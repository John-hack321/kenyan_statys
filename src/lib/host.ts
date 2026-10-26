import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/app_state/user_store";

// Is this account a host? The answer is "does a venture exist for me", read from the database.
// It is never taken from user_metadata (users can edit that). The result is cached in the user store.
// On a network error we keep the cached value instead of wrongly turning a host into a guest.
export async function refreshHostStatus() {
    const { data: { session } } = await supabase.auth.getSession();
    const { setVentureId } = useUserStore.getState();
    if (!session) {
        setVentureId(null);
        return;
    }
    const { data, error } = await supabase.from("ventures").select("id").eq("admin_id", session.user.id).maybeSingle();
    if (error) {
        console.warn("refreshHostStatus failed", error.message);
        return;
    }
    setVentureId(data?.id ?? null);
}
