import { BecomeAHostVentureDraft } from "@/app_state/ventureFlowStore";
import { MAPS_ENABLED } from "@/constants/featureFlags";
import { MIN_PHOTOS } from "@/constants/listingLimits";
import { listingAddressSchema, listingTextSchema } from "./schemas/listing";
import { priceFormSchema } from "./schemas/price";
import { contactSchema, idSchema, legalNameSchema, ventureNameFormSchema } from "./schemas/venture";

// THE one place that defines the flow: the order of the pages and when each page lets the user continue.
// The layout reads this to know what "Next" and "Back" do, so pages never have to tell the layout anything.
//
// To add a page: create the file, then add one entry here.
//
// Two parts, so the listing part can be used on its own:
//   LISTING_STEPS : everything about ONE listing. A host who already has a venture only does these.
//   VENTURE_STEPS : who the host is (name, ID, venture name, contacts). Only for a host's very first listing.
export type VentureFlowStep = {
    route: string;                                        // same as the file name, with a leading slash
    label: string;                                        // shown when something is missing ("Photos")
    canProceed: (draft: BecomeAHostVentureDraft) => boolean;
    isReview?: boolean;                                   // the last page: it can proceed only when every other step can
};

export const REVIEW_ROUTE = "/reviewAndPublish";
export const WELCOME_ROUTE = "/welcomePage";

const basicDetailsOk = (d: BecomeAHostVentureDraft) => {
    const b = d.basicDetails;
    return !!b && b.maxGuests >= 1 && b.bedrooms >= 0 && b.beds >= 1 && b.bathrooms >= 1;   // 0 bedrooms = studio
};

export const LISTING_STEPS: VentureFlowStep[] = [
    { route: "/listingTypeChoice",   label: "Type of place",       canProceed: (d) => !!d.type },
    { route: "/basicListingDetails", label: "Rooms and guests",    canProceed: basicDetailsOk },
    { route: "/guestAccessChoice",   label: "Guest access",        canProceed: (d) => !!d.guestAccess },
    // with the map switched off (featureFlags.ts) nobody can pin a location, so don't block them
    { route: "/listingLocation",     label: "Location pin",        canProceed: (d) => !MAPS_ENABLED || !!d.listingLocationCordinates },
    // optional: a host with no amenities to list can continue
    { route: "/amenities",           label: "Amenities",           canProceed: () => true },
    { route: "/addPhotos",           label: "Photos",              canProceed: (d) => (d.photos?.length ?? 0) >= MIN_PHOTOS },
    // the same zod schemas the forms use decide whether "Next" works, so the two can never disagree
    { route: "/listingNameAndDescription", label: "Title and description", canProceed: (d) => listingTextSchema.safeParse({ listingName: d.listingName ?? "", listingDescription: d.listingDescription ?? "" }).success },
    { route: "/listingPrice",        label: "Price",               canProceed: (d) => priceFormSchema.safeParse({ price: String(d.pricePerNight ?? "") }).success },
    { route: "/finalListingDetails", label: "Address",             canProceed: (d) => listingAddressSchema.safeParse(d.address ?? {}).success },
];

export const VENTURE_STEPS: VentureFlowStep[] = [
    // Thank you page after the listing is complete, then the venture setup
    { route: "/listingFlowGratitude", label: "Thank you",          canProceed: () => true },
    { route: "/ventureInfoOne",      label: "About ventures",      canProceed: () => true },
    { route: "/hostLegalName",       label: "Your legal name",     canProceed: (d) => legalNameSchema.safeParse({ legalFirstName: d.legalFirstName ?? "", legalLastName: d.legalLastName ?? "" }).success },
    { route: "/hostIdNumber",        label: "Your ID",             canProceed: (d) => idSchema.safeParse({ idCountry: d.idCountry ?? "", idType: d.idType ?? "national_id", idNumber: d.idNumber ?? "" }).success },
    { route: "/ventureName",         label: "Venture name",        canProceed: (d) => ventureNameFormSchema.safeParse({ ventureName: d.ventureName ?? "" }).success },
    // optional: cover photo is not required
    { route: "/ventureCoverPhoto",   label: "Venture cover photo", canProceed: () => true },
    { route: "/hostContactDetails",  label: "Contact details",     canProceed: (d) => contactSchema.safeParse({ phoneCountry: d.contactPhone?.country ?? "", phone: d.contactPhone?.number ?? "", email: d.contactEmail ?? "" }).success },
];

export const REVIEW_STEP: VentureFlowStep = { route: REVIEW_ROUTE, label: "Review", canProceed: () => true, isReview: true };

// The steps this host walks through.
export const getFlowSteps = (hasVenture: boolean): VentureFlowStep[] => [
    ...LISTING_STEPS,
    ...(hasVenture ? [] : VENTURE_STEPS),
    REVIEW_STEP,
];

// The first step that is not complete yet, or undefined when the draft is ready to publish.
// Used by the review page ("still needed") and by publishing (never trust that the page was reached honestly).
export const firstIncompleteStep = (steps: VentureFlowStep[], draft: BecomeAHostVentureDraft) =>
    steps.find((s) => !s.isReview && !s.canProceed(draft));

// Opening a step from the review page: after Next the host comes straight back to the review page.
export const withFromReview = (route: string) => `${route}?from=review`;