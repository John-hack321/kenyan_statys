// supabase/functions/start-host-verification/index.ts   (NEW FILE)
//
// WHAT: the app calls this when a host taps "Start verification". It asks Didit for a new
//       verification session and hands the app a short-lived `session_token`.
// WHY HERE (and not in the app): creating a session needs the secret DIDIT_API_KEY, which must never
//       be inside the phone app. It also lets US decide who the session belongs to (vendor_data),
//       so a user cannot claim somebody else's verification.
// WHO CAN CALL IT: only signed-in users (we check the token below).
//
// Secrets it needs (set with `supabase secrets set ...`): DIDIT_API_KEY, DIDIT_WORKFLOW_ID.
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are added by Supabase automatically. (UNVERIFIED for your project: confirm in the dashboard.)

import { createClient } from "npm:@supabase/supabase-js@2";

const DIDIT_CREATE_SESSION = "https://verification.didit.me/v3/session/";
const COOLDOWN_SECONDS = 30; // stops someone tapping the button 50 times (every session can cost money)

const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
    if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405); // will only accept post requests

    // all these secrets are gottne from env variables set in the supabase dashboard
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const diditKey = Deno.env.get("DIDIT_API_KEY");
    const workflowId = Deno.env.get("DIDIT_WORKFLOW_ID");
    if (!supabaseUrl || !serviceKey || !diditKey || !workflowId) {
        console.error("start-host-verification: a secret is missing");
        return json({ error: "server_not_configured" }, 500);
    }

    // "admin" talks to the database with the service role: it BYPASSES RLS. Only this server code has it.
    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

    // ---- 1. Who is calling? The app sends the user's login token in the Authorization header.
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, ""); // extract the token from the auth headers.
    if (!token) return json({ error: "unauthorized" }, 401);
    const { data: auth, error: authError } = await admin.auth.getUser(token); // this is just a supabase function to call the auth api and get the user data
    if (authError || !auth.user) return json({ error: "unauthorized" }, 401); // if there is an error or the user is not found, return unauthorized
    const user = auth.user;

    // Contact checks come first: no point paying for an ID check on an unconfirmed account.
    // (This is the REAL guard. The app also hides the button, but hiding is only UX.)
    if (!user.email_confirmed_at) return json({ error: "email_not_confirmed" }, 403);
    // I somehow feel like this assumes the user signed up using email only yet we also have a phone number as a unique identifier.

    // ---- 2. The host's identity row. publish_listing() creates it when the host publishes.
    const { data: row, error: rowError } = await admin
        .from("host_identity")
        .select("status, provider_reference, updated_at")
        .eq("user_id", user.id)
        .maybeSingle();
    if (rowError) {
        console.error("start-host-verification: reading host_identity failed", rowError.message);
        return json({ error: "database_error" }, 500);
    }
    if (!row) return json({ error: "no_host_identity" }, 404);

    // Nothing to start if it is already decided or waiting for a human.
    if (row.status === "verified") return json({ state: "verified" });
    if (row.status === "needs_review") return json({ state: "in_review" });

    // ---- 3. Cooldown (updated_at is written by this function and by the webhook only)
    if (row.provider_reference) {
        const secondsAgo = (Date.now() - new Date(row.updated_at).getTime()) / 1000;
        if (secondsAgo < COOLDOWN_SECONDS) return json({ error: "too_soon" }, 429);
    }

    // ---- 4. Ask Didit for a session. vendor_data = OUR user id, set here on the server.
    const diditResponse = await fetch(DIDIT_CREATE_SESSION, {
        method: "POST",
        headers: { "x-api-key": diditKey, "Content-Type": "application/json" },
        body: JSON.stringify({ workflow_id: workflowId, vendor_data: user.id }),
    });
    if (!diditResponse.ok) {
        console.error("start-host-verification: Didit refused", diditResponse.status, await diditResponse.text());
        return json({ error: "provider_error" }, 502);
    }
    const session = await diditResponse.json();
    if (!session.session_id || !session.session_token) {
        console.error("start-host-verification: unexpected Didit reply, keys:", Object.keys(session ?? {}));
        return json({ error: "provider_error" }, 502);
    }

    // ---- 5. Remember which session belongs to this host. The webhook finds the row by this id.
    const { error: saveError } = await admin
        .from("host_identity")
        .update({
            provider: "didit",
            provider_reference: session.session_id,
            status: "pending",
            failure_reason: null,
            updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
    if (saveError) {
        console.error("start-host-verification: saving the session failed", saveError.message);
        return json({ error: "database_error" }, 500);
    }

    // Only the short-lived token goes back to the phone. Never the API key.
    return json({ state: "session", session_token: session.session_token });
});