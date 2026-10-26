import { useMemo, useState } from "react";
import { Alert } from "react-native";
import { Href, useGlobalSearchParams, usePathname, useRouter } from "expo-router";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { useUserStore } from "@/app_state/user_store";
import {
    REVIEW_ROUTE,
    WELCOME_ROUTE,
    firstIncompleteStep,
    getFlowSteps,
    withFromReview,
} from "@/constants/ventureFlowSteps";
import { useRequireAuth } from "@/lib/hooks/use-require-auth";
import { refreshHostStatus } from "@/lib/host";
import { publishDraft } from "@/lib/publishListing";

// Works out which page we are on and what Next / Back should do.
export function useVentureFlow() {
    const pathname = usePathname();
    const router = useRouter();
    // `from=review` is on the page's own URL, so the layout reads it as a global param
    const { from } = useGlobalSearchParams<{ from?: string }>();
    const draft = useVentureDraftStore((s) => s.draft);
    const resetDraft = useVentureDraftStore((s) => s.resetDraft);
    const hasVenture = useUserStore((s) => s.ventureId !== null);
    const requireAuth = useRequireAuth();
    const [isPublishing, setIsPublishing] = useState(false);

    // a host who already has a venture only walks the listing part
    const steps = useMemo(() => getFlowSteps(hasVenture), [hasVenture]);
    const total = steps.length;
    const index = steps.findIndex((s) => pathname.endsWith(s.route));
    const step = steps[index]; // undefined on the welcome page
    const isFirst = index === 0;
    const isLast = index === total - 1;
    const fromReview = from === "review";

    // The review page can continue only when EVERY other step is complete. This matters because the ID number
    // and phone are never saved on the phone: after a restart they are empty, and the host must retype them.
    const canProceed = step ? (step.isReview ? !firstIncompleteStep(steps, draft) : step.canProceed(draft)) : false;

    const publish = async () => {
        setIsPublishing(true);
        try {
            const current = useVentureDraftStore.getState().draft;
            const stillHasVenture = useUserStore.getState().ventureId !== null;
            const missing = firstIncompleteStep(getFlowSteps(stillHasVenture), current);
            if (missing) {
                Alert.alert("Something is missing", `Please finish: ${missing.label}.`);
                router.replace(withFromReview(missing.route) as Href);
                return;
            }
            await publishDraft(current, stillHasVenture);
            await refreshHostStatus();
            router.replace("/host-setup" as Href);
            resetDraft(); // empties the draft and deletes the kept photo files
        } catch (e: any) {
            Alert.alert("We couldn't publish your listing", e?.message ?? "Please check your connection and try again.");
        } finally {
            setIsPublishing(false);
        }
    };

    const goNext = () => {
        if (!canProceed || isPublishing) return;
        if (isLast) {
            // The draft is complete. Signed-in hosts publish straight away. Everyone else signs in or signs up
            // first and then the publish runs by itself (requireAuth remembers it).
            requireAuth(publish);
            return;
        }
        if (fromReview) {
            router.replace(REVIEW_ROUTE as Href);
            return;
        }
        router.replace(steps[index + 1].route as Href);
    };

    const goBack = () => {
        if (isPublishing) return;
        if (fromReview) {
            router.replace(REVIEW_ROUTE as Href);
            return;
        }
        if (isFirst) {
            // a first-time host came from the welcome page, an existing host from "Add a listing"
            router.replace((hasVenture ? "/" : WELCOME_ROUTE) as Href);
            return;
        }
        router.replace(steps[index - 1].route as Href);
    };

    return {
        steps,
        index,
        total,
        progress: index >= 0 ? (index + 1) / total : 0,
        canProceed,
        isLast,
        isPublishing,
        fromReview,
        hasVenture,
        // The last button says "Finish" for everyone. Signed-out hosts meet the sign-in screen only AFTER
        // they press it, when they are already invested. "Done" returns to the review page after an edit.
        nextLabel: fromReview ? "Done" : isLast ? "Finish" : "Next",
        goNext,
        goBack,
    };
}
