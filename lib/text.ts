// Small helpers for cleaning what people type.

const tidy = (s: string) => s.replace(/\s{2,}/g, " ").trim();

function titleCase(s: string) {
    return tidy(s)
        .split(/([\s-]+)/)
        .map((t) => (!t || /^[\s-]+$/.test(t) ? t : t.charAt(0).toUpperCase() + t.slice(1).toLowerCase()))
        .join("");
}

// "roysambu" -> "Roysambu", "KILIMANI" -> "Kilimani". Mixed case ("Kitengela CBD") is left alone.
// Without this, "nairobi", "Nairobi" and "Nairobi " become three different places in a group-by.
export function normalizePlaceName(s: string) {
    const t = tidy(s);
    if (!t) return "";
    const allLower = t === t.toLowerCase();
    const allUpper = t === t.toUpperCase() && t.length > 3;
    return allLower || allUpper ? titleCase(t) : t;
}

// for matching names from the phone's geocoder against our lists: "Nairobi City County" -> "nairobi"
export const placeKey = (s: string) =>
    s.toLowerCase().replace(/\b(county|city)\b/g, "").replace(/[^a-z]/g, "");