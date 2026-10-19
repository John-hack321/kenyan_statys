import { BecomeAHostVentureDraft } from "@/app_state/ventureFlowStore";
import { MAPS_ENABLED } from "@/constants/featureFlags";
import { MIN_PHOTOS } from "./listingLimits";

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
    { route: "/basicListingDetails", canProceed: (d) => !!d.basicDetails && Object.values(d.basicDetails).every((n) => n >= 1) },
    { route: "/guestAccessChoice",   canProceed: (d) => !!d.guestAccess },
    // with the map switched off (featureFlags.ts) nobody can pin a location, so don't block them
    { route: "/listingLocation",     canProceed: (d) => !MAPS_ENABLED || !!d.listingLocationCordinates },
    // optional: a host with no amenities to list can continue
    { route: "/amenities",           canProceed: () => true },
    { route: "/addPhotos",           canProceed: (d) => (d.photos?.length ?? 0) >= MIN_PHOTOS },
    { route: "/listingNameAndDescription" , canProceed: (d) => true},
    { route: "/finalListingDetails" , canProceed: (d) => true}
];

export const WELCOME_ROUTE = "/welcomePage";