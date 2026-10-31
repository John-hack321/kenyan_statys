import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/app_state/user_store";

// Is this account a host, and is the host verified? The answer is "does a venture exist for me" (and its is_verified),
// read from the database. It is never taken from user_metadata (users can edit that). The result is cached in the user store.
// On a network error we keep the cached value instead of wrongly turning a host into a guest.
export async function refreshHostStatus() {
    const { data: { session } } = await supabase.auth.getSession();
    const { setVentureStatus } = useUserStore.getState();
    if (!session) {
        setVentureStatus(null, null);
        return;
    }
    const { data, error } = await supabase
        .from("ventures")
        .select("id, is_verified")
        .eq("admin_id", session.user.id)
        .maybeSingle();
    if (error) {
        console.warn("refreshHostStatus failed", error.message);
        return;
    }
    setVentureStatus(data?.id ?? null, data ? !!data.is_verified : null);
}


