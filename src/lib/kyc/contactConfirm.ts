// src/lib/kyc/contactConfirm.ts   (REPLACES the old file. Written by Claude 2026-11-10, NOT RUN on a device)
//
// Confirms a contact (phone or email) of the signed-in host with a 6 digit code.
// Both steps are Edge Functions of ours, NOT Supabase's built-in phone/email change:
//   sendContactCode   -> supabase/functions/send-otp     makes a code and delivers it
//   verifyContactCode -> supabase/functions/verify-otp   checks it, then marks the account's phone/email confirmed
// The app never decides that something is confirmed. It only asks, and reads the account again afterwards.
//
// Errors: both functions answer with { error: "<code>" } and sometimes extra fields. We turn that into a
// ContactConfirmError, and friendlyContactError() turns it into one calm sentence for the screen.
// We never log the phone, the email or the code (DESIGN.md hard floor 9).

import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type ContactChannel = "phone" | "email";

export class ContactConfirmError extends Error {
    code: string;
    retryAfter?: number;   // seconds, on "too_soon"
    attemptsLeft?: number; // on "wrong_code"
    constructor(code: string, extra: { retryAfter?: number; attemptsLeft?: number } = {}) {
        super(code);
        this.code = code;
        this.retryAfter = extra.retryAfter;
        this.attemptsLeft = extra.attemptsLeft;
    }
}

// supabase.functions.invoke sends the signed-in user's token by itself.
// When the function answers 4xx/5xx, the JSON we sent is inside error.context (same trick as startHostVerification.ts).
async function call<T>(fn: "send-otp" | "verify-otp", body: Record<string, string>): Promise<T> {
    const { data, error } = await supabase.functions.invoke(fn, { method: "POST", body });
    if (!error) return data as T;

    if (error instanceof FunctionsHttpError) {
        let payload: { error?: unknown; retry_after?: unknown; attempts_left?: unknown } | null = null;
        try {
            payload = await error.context.json();
        } catch {
            payload = null;
        }
        throw new ContactConfirmError(typeof payload?.error === "string" ? payload.error : "server_error", {
            retryAfter: typeof payload?.retry_after === "number" ? payload.retry_after : undefined,
            attemptsLeft: typeof payload?.attempts_left === "number" ? payload.attempts_left : undefined,
        });
    }
    throw new ContactConfirmError("network"); // could not reach the function at all
}

export type SendResult = { alreadyConfirmed: boolean; resendAfter: number };

// `target` = E.164 phone ("+254724027231", use toE164) or an email address.
export async function sendContactCode(channel: ContactChannel, target: string): Promise<SendResult> {
    const data = await call<{ status?: string; resend_after?: number }>("send-otp", { channel, target });
    return { alreadyConfirmed: data?.status === "already_confirmed", resendAfter: data?.resend_after ?? 30 };
}

// Resolves when the code was right (or the contact was already confirmed). Throws ContactConfirmError otherwise.
export async function verifyContactCode(channel: ContactChannel, target: string, code: string): Promise<void> {
    await call("verify-otp", { channel, target, code });
}

export function friendlyContactError(e: unknown, channel: ContactChannel): string {
    const err = e instanceof ContactConfirmError ? e : null;
    switch (err?.code) {
        case "invalid_target":
            return channel === "phone" ? "Check the phone number and try again." : "Check the email address and try again.";
        case "too_soon":
            return `Please wait ${err.retryAfter ?? 30} seconds before asking for a new code.`;
        case "too_many_requests":
            return "Too many codes were requested. Please try again in an hour.";
        case "wrong_code":
            return err.attemptsLeft === 1
                ? "That code isn't right. You have 1 try left."
                : `That code isn't right. You have ${err.attemptsLeft ?? "a few"} tries left.`;
        case "too_many_attempts":
            return "Too many wrong tries. Go back and ask for a new code.";
        case "code_expired":
            return "That code has expired. Go back and ask for a new one.";
        case "already_in_use":
            return "That number is already used by another account.";
        case "provider_not_configured":
        case "delivery_failed":
            return channel === "phone" ? "We couldn't send the text message. Please try again later." : "We couldn't send the email. Please try again later.";
        case "network":
            return "Can't reach the server. Check your connection and try again.";
        default:
            return "Something went wrong. Please try again.";
    }
}
