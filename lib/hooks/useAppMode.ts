import { modeStore, useIsHost, useUserStore } from "@/app_state/user_store";

// THE one place that answers "which side of the app is this person on?".
//   isHost     = this ACCOUNT owns a venture (from the database, cached in the user store)
//   mode       = the side being VIEWED: "host" only if isHost AND they switched to hosting, otherwise "guest"
// It is a view preference, not security: the database (RLS and RPCs) decides what anyone may do.
// See HOST_GUEST_PLAN.md.
export function useAppMode() {
    const isHost = useIsHost();
    const storedMode = modeStore((s) => s.mode);
    const setMode = modeStore((s) => s.setMode);

    const isHostMode = isHost && storedMode === "host";
    return { isHost, isHostMode, mode: (isHostMode ? "host" : "guest") as "host" | "guest", setMode };
}

// True while a host still has to finish verification: the "Finish setting up" card is shown.
// ventureVerified === null means "not loaded yet", which does NOT count as pending (no flash of the card for verified hosts).
export function useHostSetupPending() {
    return useUserStore((s) => s.ventureVerified === false || (__DEV__ && s.devForceHost && s.ventureId === null));
}