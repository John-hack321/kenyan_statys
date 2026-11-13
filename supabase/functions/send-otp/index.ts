// supabase/functions/send-otp/index.ts   (REPLACES your sketch. Written by Claude 2026-11-10, NOT RUN on Supabase)
//
// WHAT: the app calls this when a signed-in host taps "Send code" to confirm a phone number or an email.
//       Body:  { "channel": "phone" | "email", "target": "+254712345678" | "me@example.com" }
// ONE function for both channels on purpose: 90% of the work (who is calling, limits, making and storing the code)
// is identical. Only the very last step differs, and that lives in _shared/deliver.ts.
//
// Answers (always JSON):
//   200 { status: "sent", expires_in, resend_after }
//   200 { status: "already_confirmed" }             nothing to do
//   400 bad_request | invalid_target
//   401 unauthorized
//   429 too_soon { retry_after } | too_many_requests
//   500 server_not_configured | database_error
//   502 delivery_failed
//   503 provider_not_configured                      (no dev mode and no SMS/email provider yet)

import { createClient } from "npm:@supabase/supabase-js@2";
import { deliverCode, deliveryAvailable } from "../_shared/deliver.ts";
import {
    CODE_TTL_SECONDS,
    MAX_SENDS_PER_HOUR,
    RESEND_COOLDOWN_SECONDS,
    generateCode,
    getCaller,
    hashCode,
    isAlreadyConfirmed,
    json,
    normalizeTarget,
    readConfig,
} from "../_shared/otp.ts";

Deno.serve(async (req) => {
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

    const config = readConfig();
    if (!config) {
        console.error("send-otp: a secret is missing (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or OTP_HMAC_SECRET)");
        return json({ error: "server_not_configured" }, 500);
    }

    // "admin" talks to the database with the service role: it BYPASSES RLS. That is why otp_codes can stay closed to the app.
    const admin = createClient(config.supabaseUrl, config.serviceKey, { auth: { persistSession: false } });

    // ---- 1. Who is calling?
    const user = await getCaller(admin, req);
    if (!user) return json({ error: "unauthorized" }, 401);

    // ---- 2. What are they asking for? (never trust the app: check channel and target ourselves)
    let body: { channel?: unknown; target?: unknown };
    try {
        body = await req.json();
    } catch {
        return json({ error: "bad_request" }, 400);
    }
    const channel = body.channel;
    if (channel !== "phone" && channel !== "email") return json({ error: "bad_request" }, 400);
    const target = normalizeTarget(channel, typeof body.target === "string" ? body.target : "");
    if (!target) return json({ error: "invalid_target" }, 400);

    // ---- 3. Already confirmed? Then there is nothing to send (and nothing to pay for).
    if (isAlreadyConfirmed(user, channel, target)) return json({ status: "already_confirmed" });

    // ---- 4. Can we deliver at all? Ask BEFORE writing anything, so a missing provider does not eat the user's attempts.
    if (!deliveryAvailable()) return json({ error: "provider_not_configured" }, 503);

    // ---- 5. Limits. Every SMS costs money, so an attacker (or a bug) must not be able to send thousands.
    const now = Date.now();
    const hourAgo = new Date(now - 60 * 60 * 1000).toISOString();

    // (a) this user, this channel, last hour (also gives us the time of their latest code, for the cooldown)
    const { data: mine, error: mineError } = await admin
        .from("otp_codes")
        .select("created_at")
        .eq("user_id", user.id)
        .eq("channel", channel)
        .gte("created_at", hourAgo)
        .order("created_at", { ascending: false });
    if (mineError) {
        console.error("send-otp: reading recent codes failed", mineError.message);
        return json({ error: "database_error" }, 500);
    }
    if (mine.length > 0) {
        const secondsSince = (now - Date.parse(mine[0].created_at)) / 1000;
        if (secondsSince < RESEND_COOLDOWN_SECONDS) {
            return json({ error: "too_soon", retry_after: Math.ceil(RESEND_COOLDOWN_SECONDS - secondsSince) }, 429);
        }
    }
    if (mine.length >= MAX_SENDS_PER_HOUR) return json({ error: "too_many_requests" }, 429);

    // (b) this phone/email, from ANY account, last hour (stops many accounts from spamming one person)
    const { count: forTarget, error: targetError } = await admin
        .from("otp_codes")
        .select("id", { count: "exact", head: true })
        .eq("channel", channel)
        .eq("target", target)
        .gte("created_at", hourAgo);
    if (targetError) {
        console.error("send-otp: counting codes for the target failed", targetError.message);
        return json({ error: "database_error" }, 500);
    }
    if ((forTarget ?? 0) >= MAX_SENDS_PER_HOUR) return json({ error: "too_many_requests" }, 429);

    // ---- 6. Make the code, store its hash. Only the newest code for this user + channel may work, so retire the older ones first.
    const code = generateCode();
    const codeHash = await hashCode(config.hmacSecret, user.id, channel, target, code);

    const { error: retireError } = await admin
        .from("otp_codes")
        .update({ consumed_at: new Date(now).toISOString() })
        .eq("user_id", user.id)
        .eq("channel", channel)
        .is("consumed_at", null);
    if (retireError) {
        console.error("send-otp: retiring older codes failed", retireError.message);
        return json({ error: "database_error" }, 500);
    }

    const { error: insertError } = await admin.from("otp_codes").insert({
        user_id: user.id,
        channel,
        target,
        code_hash: codeHash,
        expires_at: new Date(now + CODE_TTL_SECONDS * 1000).toISOString(),
    });
    if (insertError) {
        console.error("send-otp: saving the code failed", insertError.message);
        return json({ error: "database_error" }, 500);
    }

    // ---- 7. Send it. (Today: dev log. Later: SMS / email. See _shared/deliver.ts.)
    try {
        await deliverCode(channel, target, code);
    } catch (e) {
        console.error("send-otp: delivery failed:", (e as Error).message);
        return json({ error: "delivery_failed" }, 502);
    }

    // ---- 8. Housekeeping: this user's rows older than a day are of no use to anyone. (Their last hour is what the limits read.)
    const dayAgo = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    const { error: cleanError } = await admin.from("otp_codes").delete().eq("user_id", user.id).lt("created_at", dayAgo);
    if (cleanError) console.warn("send-otp: cleanup failed (harmless)", cleanError.message);

    return json({ status: "sent", expires_in: CODE_TTL_SECONDS, resend_after: RESEND_COOLDOWN_SECONDS });
});
