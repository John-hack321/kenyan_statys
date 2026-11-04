// src/lib/kyc/contactConfirm.ts   (NEW FILE)
//
// Confirms the OTHER contact of an account that is already signed in:
//   - signed in with Google / email  -> the email is confirmed, the PHONE still needs a code
//   - signed in with phone (later)   -> the phone is confirmed, the EMAIL still needs a code
// updateUser() sends a one-time code to the new phone/email, verifyOtp() checks it.
//
// UNVERIFIED (not run): the verifyOtp types "phone_change" and "email_change" are my reading of the supabase-js
// docs. Phone needs an SMS provider in Supabase; email needs the "Change email" template to contain {{ .Token }}.
// Until those are set up (see AUTH_METHODS in constants/featureFlags.ts) these calls will fail.
// Errors are turned into friendly text by friendlyAuthError() in src/lib/otpAuth.ts.

import { supabase } from "@/lib/supabase";

export async function sendPhoneConfirmation(phoneE164: string) {
    const { error } = await supabase.auth.updateUser({ phone: phoneE164 });
    if (error) throw error;
}

export async function verifyPhoneConfirmation(phoneE164: string, token: string) {
    const { error } = await supabase.auth.verifyOtp({ phone: phoneE164, token, type: "phone_change" });
    if (error) throw error;
}

export async function sendEmailConfirmation(email: string) {
    const { error } = await supabase.auth.updateUser({ email: email.trim().toLowerCase() });
    if (error) throw error;
}

export async function verifyEmailConfirmation(email: string, token: string) {
    const { error } = await supabase.auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: "email_change" });
    if (error) throw error;
}