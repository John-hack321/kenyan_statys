import { Href, usePathname, useRouter } from "expo-router";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { VENTURE_FLOW_STEPS, WELCOME_ROUTE } from "@/constants/ventureFlowSteps";

// Works out which page we are on and what Next / Back should do.
export function useVentureFlow() {
    const pathname = usePathname();
    const router = useRouter();
    const draft = useVentureDraftStore((s) => s.draft);

    const total = VENTURE_FLOW_STEPS.length;
    const index = VENTURE_FLOW_STEPS.findIndex((s) => pathname.endsWith(s.route));
    const step = VENTURE_FLOW_STEPS[index]; // undefined on the welcome page
    const isFirst = index === 0;
    const isLast = index === total - 1;
    const canProceed = step ? step.canProceed(draft) : false;

    const goNext = () => {
        if (!canProceed) return;
        if (isLast) {
            // TODO: last page reached -> this is where "create account + create venture" will start
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
        goNext,
        goBack,
    };
}