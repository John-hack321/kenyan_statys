// supabase/functions/didit-webhook/index.ts   (NEW FILE)
//
// WHAT: Didit calls this URL (a "webhook") when a verification gets a decision. It is the ONLY thing that
//       may mark a host as verified. The app can never do it, because the app can be tampered with.
// DEPLOY WITH:  supabase functions deploy didit-webhook --no-verify-jwt
//       (Didit does not send a Supabase login token, so the normal JWT check must be off for THIS function.
//        The HMAC signature check below is what keeps strangers out. Never skip it.)
//
// Secrets it needs: DIDIT_WEBHOOK_SECRET, DIDIT_API_KEY, ID_FINGERPRINT_KEY
//   (+ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY, added by Supabase).
//
// Didit's rules, from its docs: read the RAW body, check the signature, check the timestamp is under 5 minutes
// old, answer 2xx fast, and treat repeated deliveries as normal (so every update here is safe to repeat).

import { createClient } from "npm:@supabase/supabase-js@2";

const encoder = new TextEncoder();
const text = (message: string, status = 200) => new Response(message, { status });

const toHex = (buffer: ArrayBuffer) =>
    [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, "0")).join("");

// Compares two strings without stopping at the first difference (stops timing attacks).
function safeEqual(a: string, b: string) {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    return diff === 0;
}

async function hmacHex(secret: string, data: Uint8Array) {
    const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    return toHex(await crypto.subtle.sign("HMAC", key, data));
}

const normalize = (value: unknown) => String(value ?? "").toUpperCase().replace(/[^A-Z0-9]/g, "");

Deno.serve(async (req) => {
    if (req.method !== "POST") return text("method not allowed", 405);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const webhookSecret = Deno.env.get("DIDIT_WEBHOOK_SECRET");
    const diditKey = Deno.env.get("DIDIT_API_KEY");
    const fingerprintKey = Deno.env.get("ID_FINGERPRINT_KEY");
    if (!supabaseUrl || !serviceKey || !webhookSecret || !diditKey || !fingerprintKey) {
        console.error("didit-webhook: a secret is missing");
        return text("server not configured", 500);
    }

    // ---- 1. The RAW bytes. The signature is calculated over exactly these, so do not parse first.
    const raw = new Uint8Array(await req.arrayBuffer());

    // ---- 2. Fresh? (replay protection: Didit says to reject anything older than 300 seconds)
    const sentAt = Number(req.headers.get("x-timestamp"));
    if (!Number.isFinite(sentAt) || Math.abs(Date.now() / 1000 - sentAt) > 300) return text("stale", 401);

    // ---- 3. Is it really from Didit? We use the X-Signature header: HMAC-SHA256 over the raw bytes.
    //         (Didit prefers X-Signature-V2, but that one needs a tricky "canonical JSON" step. The raw-bytes
    //          one is allowed and fine here because we never re-encode the body.)
    const given = (req.headers.get("x-signature") ?? "").replace(/^sha256=/i, "").toLowerCase();
    const expected = await hmacHex(webhookSecret, raw);
    if (!given || !safeEqual(given, expected)) {
        console.warn("didit-webhook: bad signature (check DIDIT_WEBHOOK_SECRET)");
        return text("bad signature", 401);
    }

    // ---- 4. Now it is safe to read.
    // deno-lint-ignore no-explicit-any
    let payload: any;
    try {
        payload = JSON.parse(new TextDecoder().decode(raw));
    } catch {
        return text("bad json", 400);
    }
    if (payload.webhook_type !== "status.updated") return text("ignored"); // other events are not needed

    const sessionId: string | undefined = payload.session_id;
    const diditStatus = String(payload.status ?? "").toLowerCase();
    if (!sessionId) return text("no session id", 400);

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // ---- 5. Which host does this session belong to? We saved the session id when we created it.
    const { data: row, error: rowError } = await admin
        .from("host_identity")
        .select("user_id, status, id_country, id_type, id_last4")
        .eq("provider_reference", sessionId)
        .maybeSingle();
    if (rowError) {
        console.error("didit-webhook: lookup failed", rowError.message);
        return text("database error", 500); // 5xx = Didit retries later
    }
    if (!row) {
        console.warn("didit-webhook: unknown or old session, ignoring");
        return text("unknown session");
    }
    // Extra safety: the label we attached when creating the session must match our row.
    if (payload.vendor_data && payload.vendor_data !== row.user_id) {
        console.error("didit-webhook: vendor_data does not match the stored owner");
        return text("mismatch");
    }
    if (row.status === "verified") return text("already verified"); // repeated delivery

    // Writes a new status. The extra .eq("provider_reference") means an OLD session can never overwrite a newer one.
    const setStatus = (patch: Record<string, unknown>) =>
        admin
            .from("host_identity")
            .update({ ...patch, updated_at: new Date().toISOString() })
            .eq("user_id", row.user_id)
            .eq("provider_reference", sessionId);

    // ---- 6. Turn Didit's status into ours.
    if (diditStatus === "declined") {
        const { error } = await setStatus({ status: "failed", failure_reason: "declined" });
        return error ? text("database error", 500) : text("ok");
    }
    if (diditStatus === "abandoned" || diditStatus === "expired") {
        const { error } = await setStatus({ status: "failed", failure_reason: diditStatus });
        return error ? text("database error", 500) : text("ok");
    }
    if (diditStatus === "in review" || diditStatus === "resubmitted") {
        const { error } = await setStatus({ status: "needs_review", failure_reason: null });
        return error ? text("database error", 500) : text("ok");
    }
    if (diditStatus !== "approved") return text("nothing to do"); // "Not Started", "In Progress", ...

    // ---- 7. Approved by Didit. We still run our own checks before turning the host on.
    // The decision normally comes inside the webhook. If it is missing, ask Didit directly.
    let decision = payload.decision;
    if (!decision) {
        const res = await fetch(`https://verification.didit.me/v3/session/${sessionId}/decision/`, {
            headers: { "x-api-key": diditKey },
        });
        if (res.ok) decision = await res.json();
    }

    // UNVERIFIED: the field name `document_number` is my reading of Didit's decision format.
    // If your first test ends in "needs_review" with failure_reason = number_unreadable, look at the logged
    // keys below and fix this one line.
    const idDoc = decision?.id_verifications?.[0];
    const number = normalize(idDoc?.document_number);
    if (!number) {
        console.error("didit-webhook: could not read the document number. id_verifications[0] keys:", Object.keys(idDoc ?? {}));
        const { error } = await setStatus({ status: "needs_review", failure_reason: "number_unreadable" });
        return error ? text("database error", 500) : text("ok");
    }

    // The host typed the last 4 digits in the wizard. They must match the document (free cross-check).
    const typedLast4 = normalize(row.id_last4);
    if (typedLast4.length === 4 && !number.endsWith(typedLast4)) {
        const { error } = await setStatus({ status: "needs_review", failure_reason: "last4_mismatch" });
        return error ? text("database error", 500) : text("ok");
    }

    // We never store the full ID number. We store a keyed hash ("fingerprint"). host_identity.id_fingerprint is
    // UNIQUE, so the same ID cannot verify two different accounts.
    const fingerprint = await hmacHex(fingerprintKey, encoder.encode(`${row.id_country}:${row.id_type}:${number}`));
    const now = new Date().toISOString();
    const { error: verifyError } = await setStatus({
        status: "verified",
        verified_at: now,
        id_fingerprint: fingerprint,
        failure_reason: null,
    });
    if (verifyError) {
        if (verifyError.code === "23505") {
            // unique violation = this ID already belongs to another account: a human must look
            await setStatus({ status: "needs_review", failure_reason: "duplicate_id" });
            return text("ok");
        }
        console.error("didit-webhook: marking verified failed", verifyError.message);
        return text("database error", 500);
    }

    // The database trigger refresh_verification_on_identity now checks email + phone + ID and switches the venture on.
    return text("ok");
});