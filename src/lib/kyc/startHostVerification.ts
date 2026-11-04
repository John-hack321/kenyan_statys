// src/lib/kyc/startHostVerification.ts   (NEW FILE)
//
// Step 1: ask our Edge Function for a session token (it checks who we are and creates the Didit session).
// Step 2: give that token to the Didit SDK, which opens its own camera screens.
//
// IMPORTANT: "submitted" means "the host finished the screens", NOT "verified".
// Only the webhook (Edge Function B) can verify a host. The screen then waits and reads host_identity.

import { startVerification } from "@didit-protocol/sdk-react-native";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type StartResult =
    | { kind: "submitted" }
    | { kind: "cancelled" }
    | { kind: "already"; status: "verified" | "in_review" }
    | { kind: "too_soon" }
    | { kind: "email_not_confirmed" }
    | { kind: "error"; message: string };

// When an Edge Function answers with an error code (4xx/5xx), the JSON body we sent is inside error.context.
async function readErrorCode(error: unknown): Promise<string | null> {
    if (error instanceof FunctionsHttpError) {
        try {
            const body = await error.context.json();
            return typeof body?.error === "string" ? body.error : null;
        } catch {
            return null;
        }
    }
    return null;
}

const CONNECTION_MESSAGE = "We couldn't start the verification. Check your connection and try again.";

export async function startHostVerification(): Promise<StartResult> {
    // supabase.functions.invoke sends the signed-in user's token automatically.
    // UNVERIFIED: if you get a 401 although you are signed in, see the note about --no-verify-jwt in my message.
    const { data, error } = await supabase.functions.invoke("start-host-verification", { method: "POST" });

    if (error) {
        const code = await readErrorCode(error);
        if (code === "too_soon") return { kind: "too_soon" };
        if (code === "email_not_confirmed") return { kind: "email_not_confirmed" };
        console.warn("start-host-verification failed:", code ?? error.message);
        return { kind: "error", message: CONNECTION_MESSAGE };
    }

    if (data?.state === "verified") return { kind: "already", status: "verified" };
    if (data?.state === "in_review") return { kind: "already", status: "in_review" };
    if (!data?.session_token) return { kind: "error", message: CONNECTION_MESSAGE };

    const result = await startVerification(data.session_token, {
        closeOnComplete: true,
        loggingEnabled: __DEV__,
    });

    if (result.type === "cancelled") return { kind: "cancelled" };
    if (result.type === "failed") {
        // UNVERIFIED: the error type names come from Didit's docs; TypeScript will tell you if one is wrong.
        const type = String(result.error?.type ?? "");
        if (/camera/i.test(type)) return { kind: "error", message: "Allow camera access in your phone settings, then try again." };
        if (/expired/i.test(type)) return { kind: "error", message: "That session expired. Start again." };
        if (/network/i.test(type)) return { kind: "error", message: CONNECTION_MESSAGE };
        return { kind: "error", message: "Something went wrong during verification. Please try again." };
    }
    return { kind: "submitted" };
}