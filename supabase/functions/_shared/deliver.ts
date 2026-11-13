// supabase/functions/_shared/deliver.ts   (NEW FILE, written by Claude 2026-11-10, NOT RUN on Supabase)
//
// The ONLY place that knows HOW a code reaches a person. Today: it prints the code in the function logs so you
// can copy it into the app. Later: replace the body of deliverCode() with a call to an SMS provider (phone) or an
// email provider (email). Nothing else in the flow changes.
//
// DEV MODE is a switch YOU set, never something the code assumes:
//     supabase secrets set OTP_DEV_MODE=true      (turn on while building)
//     supabase secrets unset OTP_DEV_MODE         (REMOVE before real users; a code in a log is a code anyone with log access can read)
// With the switch off and no provider wired in, send-otp answers "provider_not_configured" and sends nothing.
//
// Where to look for the logs:
//     hosted project : Supabase dashboard > Edge Functions > send-otp > Logs
//     local          : the terminal running `supabase functions serve`

import type { Channel } from "./otp.ts";

const devMode = () => Deno.env.get("OTP_DEV_MODE") === "true";

// Can we deliver at all right now? send-otp asks BEFORE it writes a code or counts the attempt.
// When a provider exists, return true for it here too, e.g.  devMode() || !!Deno.env.get("SMS_API_KEY")
export const deliveryAvailable = () => devMode();

// Show only the end of the contact in logs, never the whole phone or email.
const mask = (channel: Channel, target: string) =>
    channel === "phone" ? `***${target.slice(-4)}` : `${target[0]}***${target.slice(target.indexOf("@"))}`;

export async function deliverCode(channel: Channel, target: string, code: string): Promise<void> {
    if (devMode()) {
        console.log(`[OTP DEV] ${channel} ${mask(channel, target)}  code: ${code}`);
        return;
    }
    // TODO(provider): send `code` to `target` here. Throw if the provider refuses, send-otp turns that into "delivery_failed".
    throw new Error("no delivery provider configured");
}
