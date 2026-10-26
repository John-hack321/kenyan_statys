import { Href, usePathname, useRouter } from "expo-router";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { VENTURE_FLOW_STEPS, WELCOME_ROUTE } from "@/constants/ventureFlowSteps";
import { useAuthContext } from "@/lib/hooks/auth-context";
import { useRequireAuth } from "@/lib/hooks/use-require-auth";

// Works out which page we are on and what Next / Back should do.
export function useVentureFlow() {
    const pathname = usePathname();
    const router = useRouter();
    const draft = useVentureDraftStore((s) => s.draft);
    const { isLoggedIn } = useAuthContext();
    const requireAuth = useRequireAuth();

    const total = VENTURE_FLOW_STEPS.length;
    const index = VENTURE_FLOW_STEPS.findIndex((s) => pathname.endsWith(s.route));
    const step = VENTURE_FLOW_STEPS[index]; // undefined on the welcome page
    const isFirst = index === 0;
    const isLast = index === total - 1;
    const canProceed = step ? step.canProceed(draft) : false;

    const goNext = () => {
        if (!canProceed) return;
        if (isLast) {
            // The draft is complete. Now we need an account: signed-in hosts go straight on, everyone else
            // signs in or signs up first and then lands on the same page (requireAuth remembers it).
            requireAuth(() => router.replace("/host-setup" as Href));
            return;
        }
        router.replace(VENTURE_FLOW_STEPS[index + 1].route as Href);
    };

    const goBack = () => {
        router.replace((isFirst ? WELCOME_ROUTE : VENTURE_FLOW_STEPS[index - 1].route) as Href);
    };

    return {
        index,
        total,
        progress: index >= 0 ? (index + 1) / total : 0,
        canProceed,
        isLast,
        nextLabel: isLast ? (isLoggedIn ? "Continue" : "Create account") : "Next",
        goNext,
        goBack,
    };
}
