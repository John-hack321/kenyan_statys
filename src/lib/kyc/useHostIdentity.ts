// src/lib/kyc/useHostIdentity.ts   (NEW FILE)
//
// Reads the signed-in host's verification status from the host_identity table.
// The app is allowed to read ONLY its own row and ONLY a few columns (RLS + column grants in 01_host_identity.sql),
// and it can never write to it. Only the Edge Functions write.

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type IdentityStatus = "pending" | "verified" | "failed" | "needs_review";

export function useHostIdentity() {
    const [status, setStatus] = useState<IdentityStatus | null>(null);
    const [loading, setLoading] = useState(true);

    // Returns the fresh status (or null). On a network error it keeps the old value instead of guessing.
    const refresh = useCallback(async (): Promise<IdentityStatus | null> => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            setStatus(null);
            setLoading(false);
            return null;
        }
        const { data, error } = await supabase
            .from("host_identity")
            .select("status")
            .eq("user_id", session.user.id)
            .maybeSingle();
        setLoading(false);
        if (error) {
            console.warn("useHostIdentity: could not read status", error.message);
            return null;
        }
        const next = (data?.status ?? null) as IdentityStatus | null;
        setStatus(next);
        return next;
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { status, loading, refresh };
}