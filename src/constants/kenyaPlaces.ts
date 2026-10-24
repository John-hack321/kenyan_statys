import { placeKey } from "@/lib/text";

// The 47 counties. Hosts PICK one, so "Nairobi" is always spelled the same way and search groups correctly.
// These match the region values already used in the seed data (no " County" suffix).
export const KENYA_COUNTIES = [
    "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu", "Garissa", "Homa Bay", "Isiolo",
    "Kajiado", "Kakamega", "Kericho", "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui", "Kwale",
    "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera", "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a",
    "Nairobi", "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri", "Samburu", "Siaya", "Taita-Taveta",
    "Tana River", "Tharaka-Nithi", "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot",
] as const;

export const KENYA_COUNTY_OPTIONS = KENYA_COUNTIES.map((c) => ({ value: c, label: c }));

// Tap-to-fill suggestions for the area field. Only suggestions: the host can still type any area.
export const KENYA_AREA_SUGGESTIONS: Record<string, string[]> = {
    Nairobi: ["Roysambu", "Kasarani", "Westlands", "Kilimani", "Kileleshwa", "Lavington", "Parklands", "South B",
        "South C", "Embakasi", "Githurai", "Langata", "Karen", "Kahawa", "Eastleigh", "Donholm", "Buruburu", "Umoja", "Upper Hill"],
    Mombasa: ["Nyali", "Bamburi", "Tudor", "Likoni", "Kizingo", "Shanzu"],
    Kisumu: ["Milimani", "Kondele", "Mamboleo", "Nyalenda"],
    Nakuru: ["Section 58", "Lanet", "Milimani", "Free Area"],
    Kiambu: ["Ruaka", "Ruiru", "Thika Town", "Juja", "Limuru", "Kikuyu"],
    Kajiado: ["Kitengela", "Ongata Rongai", "Ngong", "Kiserian"],
    Kilifi: ["Mtwapa", "Kilifi Town", "Malindi", "Watamu"],
    Machakos: ["Syokimau", "Athi River", "Machakos Town"],
};

// match a name from the phone's geocoder ("Nairobi City County") to one of our counties
export function findCounty(candidates: (string | null | undefined)[]): string | null {
    for (const c of candidates) {
        if (!c) continue;
        const key = placeKey(c);
        const hit = KENYA_COUNTIES.find((county) => placeKey(county) === key);
        if (hit) return hit;
    }
    return null;
}