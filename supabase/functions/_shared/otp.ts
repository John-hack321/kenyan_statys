// supabase/functions/_shared/otp.ts   (NEW FILE, written by Claude 2026-11-10, NOT RUN on Supabase)
//
// Everything send-otp and verify-otp have in common, written ONCE so the two functions can never disagree
// about how a code is made, hashed or checked. (A folder starting with "_" is how Supabase says
// "shared code, not a function of its own".)
//
// The idea in one paragraph: the app asks send-otp for a code for ONE contact (a phone or an email).
// We make a random 6 digit code, store only a HASH of it in the table otp_codes, and send the real code
// to the person. When they type it, verify-otp hashes what they typed and compares. If it matches, we
// write the proof ("phone_confirmed_at") on their auth account, which only this server can do.

import type { User } from "npm:@supabase/supabase-js@2";

export type Channel = "phone" | "email";

// ---- the rules, all in one place ----
export const CODE_LENGTH = 6;                 // 6 digits: the usual choice (4 is too easy to guess, 8 is annoying to type)
export const CODE_TTL_SECONDS = 10 * 60;      // a code works for 10 minutes
export const RESEND_COOLDOWN_SECONDS = 30;    // must match RESEND_SECONDS in the app screen
export const MAX_SENDS_PER_HOUR = 5;          // per user AND per phone/email (every SMS costs money)
export const MAX_WRONG_ATTEMPTS = 5;          // then that code is dead and a new one is needed

export const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are added by Supabase itself.
// OTP_HMAC_SECRET is ours: `supabase secrets set OTP_HMAC_SECRET=<a long random string>` (see the message that came with this file).
export function readConfig() {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const hmacSecret = Deno.env.get("OTP_HMAC_SECRET");
    if (!supabaseUrl || !serviceKey || !hmacSecret) return null;
    return { supabaseUrl, serviceKey, hmacSecret };
}

// Same pattern as start-host-verification: the app sends the user's login token, we ask Supabase who it belongs to.
export async function getCaller(
    admin: { auth: { getUser: (token: string) => Promise<{ data: { user: User | null }; error: unknown }> } },
    req: Request,
): Promise<User | null> {
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!token) return null;
    const { data, error } = await admin.auth.getUser(token);
    return error || !data.user ? null : data.user;
}

// The app tells us WHICH channel it means. We never guess from the text: a guess is a place for bugs,
// and it would let a caller steer where a (paid) message goes. We only check the text fits that channel.
//   phone -> E.164, "+254712345678"
//   email -> lower-case, one "@", a dot after it
export function normalizeTarget(channel: Channel, raw: string): string | null {
    if (channel === "phone") {
        const cleaned = raw.replace(/[\s\-().]/g, "");
        return /^\+[1-9]\d{7,14}$/.test(cleaned) ? cleaned : null;
    }
    const email = raw.trim().toLowerCase();
    return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null;
}

const digitsOnly = (s: string | undefined | null) => (s ?? "").replace(/\D/g, "");

// Nothing to do if the account already has this contact confirmed. (Supabase may store a phone without its "+",
// so we compare digits only.)
//   email: an account has ONE login email. If it is already confirmed we never change it from here.
//   phone: confirmed AND the same number.
export function isAlreadyConfirmed(user: User, channel: Channel, target: string): boolean {
    if (channel === "email") return !!user.email_confirmed_at;
    return !!user.phone_confirmed_at && digitsOnly(user.phone) === digitsOnly(target);
}

// A random 6 digit code. Plain `random % 1,000,000` would make small numbers slightly more likely,
// so we throw away the few values at the top that do not divide evenly. (4,294,000,000 = largest multiple of 1,000,000 below 2^32.)
export function generateCode(): string {
    const limit = 4_294_000_000;
    const buf = new Uint32Array(1);
    do {
        crypto.getRandomValues(buf);
    } while (buf[0] >= limit);
    return String(buf[0] % 1_000_000).padStart(CODE_LENGTH, "0");
}

// What goes in the table. HMAC = a hash that needs a secret key (OTP_HMAC_SECRET) to compute.
// Why not store the code? If the table ever leaked, plain codes would be usable at once. With HMAC the thief would
// also need our secret. The user id, channel and target are mixed in so a hash is only valid for ONE person and ONE contact.
export async function hashCode(secret: string, userId: string, channel: Channel, target: string, code: string): Promise<string> {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const sig = await crypto.subtle.sign("HMAC", key, enc.encode(`${userId}|${channel}|${target}|${code}`));
    return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}
