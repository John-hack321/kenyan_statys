import { z } from "zod";
import { KENYA_COUNTIES } from "@/constants/kenyaPlaces";

// ---------- limits (also add them as CHECK constraints in the database, the app is not the last line of defence)
export const LISTING_NAME_MIN = 8;
export const LISTING_NAME_MAX = 60;
export const DESCRIPTION_MIN = 50;
export const DESCRIPTION_MAX = 2000;

// ---------- allowed characters
// Latin letters (with accents), digits, spaces and a few punctuation marks. No emoji, no symbols.
const NAME_CHARS = /^[A-Za-z0-9\u00C0-\u024F\s.,'’&()\-/!#]+$/;
const PLACE_CHARS = /^[A-Za-z0-9\u00C0-\u024F\s.'’-]+$/;
const ADDRESS_CHARS = /^[A-Za-z0-9\u00C0-\u024F\s.,'’&()\-/#]*$/;

// ---------- cleaners: run while the user types, so bad characters simply don't appear
const noLeadingSpace = (s: string) => s.replace(/^\s+/, "").replace(/ {2,}/g, " ");
export const sanitizeListingName = (s: string) => noLeadingSpace(s.replace(/[^A-Za-z0-9\u00C0-\u024F\s.,'’&()\-/!#]/g, ""));
export const sanitizePlace = (s: string) => noLeadingSpace(s.replace(/[^A-Za-z0-9\u00C0-\u024F\s.'’-]/g, ""));
export const sanitizeAddressLine = (s: string) => noLeadingSpace(s.replace(/[^A-Za-z0-9\u00C0-\u024F\s.,'’&()\-/#]/g, ""));
// descriptions keep new lines and emoji, they only lose invisible control characters
export const sanitizeDescription = (s: string) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").replace(/^\s+/, "").replace(/[ \t]{2,}/g, " ");

// Guests message hosts through the app. Phone numbers, links and emails in public text let people
// skip the platform (and the booking fee), so we block them.
const CONTACT = /(https?:\/\/|www\.|@|\.com\b|\.co\.ke\b)/i;
const PHONE = /(\d[\s.-]?){9,}/;
export const hasContactInfo = (s: string) => CONTACT.test(s) || PHONE.test(s);
const NO_CONTACT_MESSAGE = "Leave out phone numbers, links and emails. Guests message you through the app.";

// ---------- name + description page
export const listingNameSchema = z
    .string()
    .trim()
    .min(LISTING_NAME_MIN, `Use at least ${LISTING_NAME_MIN} characters`)
    .max(LISTING_NAME_MAX, `Keep it under ${LISTING_NAME_MAX} characters`)
    .regex(NAME_CHARS, "Use letters, numbers and basic punctuation only")
    .refine((v) => !hasContactInfo(v), NO_CONTACT_MESSAGE);

export const listingDescriptionSchema = z
    .string()
    .trim()
    .min(DESCRIPTION_MIN, `Tell guests a bit more (at least ${DESCRIPTION_MIN} characters)`)
    .max(DESCRIPTION_MAX, `Keep it under ${DESCRIPTION_MAX} characters`)
    .refine((v) => !hasContactInfo(v), NO_CONTACT_MESSAGE);

export const listingTextSchema = z.object({
    listingName: listingNameSchema,
    listingDescription: listingDescriptionSchema,
});
export type ListingTextForm = z.infer<typeof listingTextSchema>;

// ---------- address page
const place = (what: string) =>
    z.string().trim().min(2, `Enter ${what}`).max(50, "Keep it under 50 characters").regex(PLACE_CHARS, "Letters, numbers, spaces and . ' - only");

const optionalLine = (max: number) =>
    z.string().trim().max(max, `Keep it under ${max} characters`).regex(ADDRESS_CHARS, "Letters, numbers and basic punctuation only").optional();

export const listingAddressSchema = z
    .object({
        country: z.string().min(2, "Choose a country"),
        region: place("a county or region"),
        area: place("an area or estate"),
        streetAddress: z
            .string()
            .trim()
            .min(3, "Enter a street, road or estate")
            .max(120, "Keep it under 120 characters")
            .regex(ADDRESS_CHARS, "Letters, numbers and basic punctuation only"),
        buildingName: optionalLine(60),
        unit: optionalLine(40),
        landmark: optionalLine(80),
    })
    .refine((a) => a.country !== "KE" || (KENYA_COUNTIES as readonly string[]).includes(a.region.trim()), {
        path: ["region"],
        message: "Choose a county from the list",
    });

export type ListingAddressForm = z.infer<typeof listingAddressSchema>;