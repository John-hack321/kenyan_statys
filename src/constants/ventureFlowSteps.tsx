import { BecomeAHostVentureDraft } from "@/app_state/ventureFlowStore";
import { MAPS_ENABLED } from "@/constants/featureFlags";
import { MIN_PHOTOS } from "@/constants/listingLimits";
import { listingAddressSchema, listingTextSchema } from "./schemas/listing";
import { contactSchema, idSchema, legalNameSchema, ventureNameFormSchema } from "./schemas/venture";

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
    // the same zod schemas the forms use decide whether "Next" works, so the two can never disagree
    { route: "/listingNameAndDescription", canProceed: (d) => listingTextSchema.safeParse({ listingName: d.listingName ?? "", listingDescription: d.listingDescription ?? "" }).success },
    { route: "/finalListingDetails", canProceed: (d) => listingAddressSchema.safeParse(d.address ?? {}).success },
    // Thank you page after listing is complete
    { route: "/listingFlowGratitude", canProceed: () => true },
    // Venture setup flow - starts after the listing is complete
    { route: "/ventureInfoOne",      canProceed: () => true },
    { route: "/hostLegalName",       canProceed: (d) => legalNameSchema.safeParse({ legalFirstName: d.legalFirstName ?? "", legalLastName: d.legalLastName ?? "" }).success },
    { route: "/hostIdNumber",        canProceed: (d) => idSchema.safeParse({ idCountry: d.idCountry ?? "", idType: d.idType ?? "national_id", idNumber: d.idNumber ?? "" }).success },
    { route: "/ventureName",         canProceed: (d) => ventureNameFormSchema.safeParse({ ventureName: d.ventureName ?? "" }).success },
    // optional: cover photo is not required
    { route: "/ventureCoverPhoto",   canProceed: () => true },
    { route: "/hostContactDetails",  canProceed: (d) => contactSchema.safeParse({ phoneCountry: d.contactPhone?.country ?? "", phone: d.contactPhone?.number ?? "", email: d.contactEmail ?? "" }).success },
    { route: "/reviewAndPublish",    canProceed: () => true },
];

export const WELCOME_ROUTE = "/welcomePage";