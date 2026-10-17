import { BecomeAHostVentureDraft } from "@/app_state/ventureFlowStore";

// THE one place that defines the flow: the order of the pages and when each page lets the user continue.
// The layout reads this to know what "Next" and "Back" do, so pages never have to tell the layout anything.
//
// To add a page: create the file, then add one entry here.
export type VentureFlowStep = {
    route: string;                                        // same as the file name, with a leading slash
    canProceed: (draft: BecomeAHostVentureDraft) => boolean;
};

export const VENTURE_FLOW_STEPS: VentureFlowStep[] = [
    { route: "/listingTypeChoice",   canProceed: (d) => !!d.type },
    { route: "/basicListingDetails", canProceed: () => true }, // TODO: add the real check when the page is built
];

export const WELCOME_ROUTE = "/welcomePage";