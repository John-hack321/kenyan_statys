
// supabase/functions/verify-otp/index.ts   (REPLACES the generated template. Written by Claude 2026-11-10, NOT RUN on Supabase)
//
// WHAT: the app calls this when the host has typed the 6 digit code.
//       Body:  { "channel": "phone" | "email", "target": "...", "code": "123456" }
// If the code is right, we write the proof on the host's ACCOUNT (auth.users: phone_confirmed_at / email_confirmed_at).
// Only the service role can write those columns, so a host can never mark themselves confirmed from the app.
// The rest of the app already reads exactly those two fields (see lib/hostRequirements.ts), so nothing else has to change.
//
// Answers (always JSON):
//   200 { status: "confirmed" } | { status: "already_confirmed" }
//   400 bad_request | invalid_target | invalid_code_format | wrong_code { attempts_left } | code_expired
//   401 unauthorized
//   409 already_in_use                       that phone belongs to another account
//   429 too_many_attempts                    5 wrong tries: that code is dead, ask for a new one
//   500 server_not_configured | database_error | account_update_failed

import { createClient } from "npm:@supabase/supabase-js@2";
import {
    CODE_LENGTH,
    MAX_WRONG_ATTEMPTS,
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
        console.error("verify-otp: a secret is missing (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or OTP_HMAC_SECRET)");
        return json({ error: "server_not_configured" }, 500);
    }
    const admin = createClient(config.supabaseUrl, config.serviceKey, { auth: { persistSession: false } });

    // ---- 1. Who is calling?
    const user = await getCaller(admin, req);
    if (!user) return json({ error: "unauthorized" }, 401);

    // ---- 2. What did they send?
    let body: { channel?: unknown; target?: unknown; code?: unknown };
    try {
        body = await req.json();
    } catch {
        return json({ error: "bad_request" }, 400);
    }
    const channel = body.channel;
    if (channel !== "phone" && channel !== "email") return json({ error: "bad_request" }, 400);
    const target = normalizeTarget(channel, typeof body.target === "string" ? body.target : "");
    if (!target) return json({ error: "invalid_target" }, 400);
    const code = typeof body.code === "string" ? body.code.trim() : "";
    if (!new RegExp(`^\\d{${CODE_LENGTH}}$`).test(code)) return json({ error: "invalid_code_format" }, 400);

    if (isAlreadyConfirmed(user, channel, target)) return json({ status: "already_confirmed" });

    // ---- 3. Check the code. consume_otp (migration 06) does the finding, the wrong-guess counting and the
    //         "use it up" in ONE locked step, so 50 guesses fired at once still only get 5 tries.
    const codeHash = await hashCode(config.hmacSecret, user.id, channel, target, code);
    const { data: result, error: rpcError } = await admin.rpc("consume_otp", {
        p_user_id: user.id,
        p_channel: channel,
        p_target: target,
        p_code_hash: codeHash,
        p_max_attempts: MAX_WRONG_ATTEMPTS,
    });
    if (rpcError) {
        console.error("verify-otp: consume_otp failed", rpcError.message);
        return json({ error: "database_error" }, 500);
    }

    switch (result?.status) {
        case "ok":
            break;
        case "wrong":
            return json({ error: "wrong_code", attempts_left: result.attempts_left }, 400);
        case "locked":
            return json({ error: "too_many_attempts" }, 429);
        case "none":
            return json({ error: "code_expired" }, 400); // never sent, expired, already used, or replaced by a newer code
        default:
            console.error("verify-otp: unexpected consume_otp result", JSON.stringify(result));
            return json({ error: "database_error" }, 500);
    }

    // ---- 4. Right code: write the proof on the account.
    // UNVERIFIED: that the admin API accepts `phone` + `phone_confirm` while the project's SMS provider is switched off.
    // If it refuses, the fallback is our own table (see the message that came with this file).
    const { error: updateError } = await admin.auth.admin.updateUserById(
        user.id,
        channel === "phone" ? { phone: target, phone_confirm: true } : { email: target, email_confirm: true },
    );
    if (updateError) {
        console.error("verify-otp: updating the account failed:", updateError.status, updateError.message);
        const taken = /already|registered|exists|duplicate|in use/i.test(updateError.message);
        return json({ error: taken ? "already_in_use" : "account_update_failed" }, taken ? 409 : 500);
    }

    // ---- 5. Keep the host's private contact row in step with what was really confirmed.
    // (No row yet = nothing is updated, and that is fine: publish_listing writes it later.)
    const { error: privateError } = await admin
        .from("host_private")
        .update(channel === "phone" ? { contact_phone: target } : { contact_email: target })
        .eq("user_id", user.id);
    if (privateError) console.warn("verify-otp: host_private not updated (harmless)", privateError.message);

    return json({ status: "confirmed" });
});