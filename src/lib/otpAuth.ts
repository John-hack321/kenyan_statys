import { supabase } from "@/lib/supabase";

// Passwordless sign in with a one-time code, for both email and phone.
// The SAME call logs an existing user in or creates a new account, which is why the screen says "Log in or sign up".
// After verifyOtp succeeds Supabase fires SIGNED_IN, AuthProvider updates, and the sheet closes by itself.

// Must match Supabase > Authentication > (Email) OTP length. The default is 6.
export const CODE_LENGTH = 6;

export async function sendEmailCode(email: string) {
    const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: { shouldCreateUser: true },
    });
    if (error) throw error;
}

// `phone` must be E.164, e.g. "+254712345678" (use toE164 from constants/schemas/venture)
export async function sendPhoneCode(phone: string) {
    const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
    if (error) throw error;
}

export async function verifyEmailCode(email: string, token: string) {
    const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: "email" });
    if (error) throw error;
}

export async function verifyPhoneCode(phone: string, token: string) {
    const { error } = await supabase.auth.verifyOtp({ phone, token, type: "sms" });
    if (error) throw error;
}

// Turns Supabase's technical errors into something a guest can act on.
export function friendlyAuthError(e: unknown): string {
    const err = e as { message?: string; status?: number } | null;
    const msg = err?.message ?? "";
    if (err?.status === 429 || /rate limit|too many/i.test(msg)) return "Too many tries. Please wait a minute and try again.";
    if (/token/i.test(msg) && /expired|invalid/i.test(msg)) return "That code didn't work or has expired. Check it, or ask for a new one.";
    if (/network|fetch/i.test(msg)) return "Can't reach the server. Check your connection and try again.";
    return msg || "Something went wrong. Please try again.";
}