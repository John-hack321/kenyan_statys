import { z } from "zod";
import { COUNTRIES } from "@/constants/countryCodes";
import { hasContactInfo } from "@/constants/schemas/listing";

// ---------- person names (as printed on an ID) ----------
// Letters (with accents), spaces, dots, apostrophes and hyphens. No digits, no emoji.
const PERSON_CHARS = /^[A-Za-z\u00C0-\u024F][A-Za-z\u00C0-\u024F\s.'’-]*$/;
export const sanitizePersonName = (s: string) =>
    s.replace(/[^A-Za-z\u00C0-\u024F\s.'’-]/g, "").replace(/^\s+/, "").replace(/ {2,}/g, " ");

const personName = (what: string) =>
    z.string().trim().min(2, `Enter your ${what}`).max(40, "Keep it under 40 characters").regex(PERSON_CHARS, "Letters only, please");

export const legalNameSchema = z.object({
    legalFirstName: personName("first name"),
    legalLastName: personName("last name"),
});
export type LegalNameForm = z.infer<typeof legalNameSchema>;

// ---------- venture name (public) ----------
export const VENTURE_NAME_MIN = 3;
export const VENTURE_NAME_MAX = 40;
const VENTURE_CHARS = /^[A-Za-z0-9\u00C0-\u024F\s.,'’&()\-!]+$/;
export const sanitizeVentureName = (s: string) =>
    s.replace(/[^A-Za-z0-9\u00C0-\u024F\s.,'’&()\-!]/g, "").replace(/^\s+/, "").replace(/ {2,}/g, " ");
// stops a host from calling themselves "African Spaces Support" and fooling guests
const RESERVED = /\b(african\s*spaces|official|admin|administrator|support|staff)\b/i;

export const ventureNameSchema = z
    .string()
    .trim()
    .min(VENTURE_NAME_MIN, `Use at least ${VENTURE_NAME_MIN} characters`)
    .max(VENTURE_NAME_MAX, `Keep it under ${VENTURE_NAME_MAX} characters`)
    .regex(VENTURE_CHARS, "Use letters, numbers and basic punctuation only")
    .refine((v) => !hasContactInfo(v), "Leave out phone numbers, links and emails")
    .refine((v) => !RESERVED.test(v), "That name is reserved. Please choose another.");

export const ventureNameFormSchema = z.object({ ventureName: ventureNameSchema });
export type VentureNameForm = z.infer<typeof ventureNameFormSchema>;

// ---------- ID ----------
export const ID_TYPES = [
    { value: "national_id", label: "National ID" },
    { value: "passport", label: "Passport" },
    { value: "resident_id", label: "Resident / alien ID" },
] as const;

export const sanitizeIdNumber = (s: string) => s.replace(/[^A-Za-z0-9\-/]/g, "").toUpperCase();

export const idSchema = z
    .object({
        idCountry: z.string().min(2, "Choose the country that issued it"),
        idType: z.enum(["national_id", "passport", "resident_id"], { error: "Choose the type of ID" }),
        idNumber: z
            .string()
            .trim()
            .min(5, "That looks too short")
            .max(20, "That looks too long")
            .regex(/^[A-Za-z0-9\-/]+$/, "Letters, numbers, - and / only"),
    })
    // The one format we know well. Other countries only get the general rules above; the real check is done later.
    .refine((v) => !(v.idCountry === "KE" && v.idType === "national_id") || /^\d{7,8}$/.test(v.idNumber), {
        path: ["idNumber"],
        message: "A Kenyan national ID number has 7 or 8 digits",
    });
export type IdForm = z.infer<typeof idSchema>;

// ---------- phone + email ----------
export const dialCodeOf = (countryIso?: string) =>
    COUNTRIES.find((c) => c.code === (countryIso ?? "KE"))?.dialCode ?? "+254";

// "0712 345 678" -> "712345678"   (digits only, no leading zero: the country code goes in front of it)
export const cleanPhoneDigits = (s: string) => s.replace(/\D/g, "").replace(/^0+/, "");
// what we store and later verify with an SMS code
export const toE164 = (countryIso: string | undefined, digits: string) => `${dialCodeOf(countryIso)}${digits}`;

export const contactSchema = z.object({
    phoneCountry: z.string().min(2, "Choose a country code"),
    phone: z.string().regex(/^\d{7,12}$/, "Enter your number without the country code"),
    email: z.string().trim().toLowerCase().email("Enter a valid email").max(120, "Keep it under 120 characters"),
});
export type ContactForm = z.infer<typeof contactSchema>;
