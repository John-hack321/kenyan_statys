import { supabase } from "@/lib/supabase";

export type PlaceKind = "region" | "city" | "area";

// one row returned by the search_places() function in Supabase
export type PlaceResult = {
    id: number;
    name: string;
    admin1: string | null;      // county / region / province
    kind: PlaceKind;
    country_code: string;
    lat: number;
    lng: number;
    population: number | null;
    score: number;              // 2 = exact, 1+ = starts with what you typed, below 1 = similar spelling
};

// Typo tolerant: "mombaza" finds Mombasa. Throws if Supabase can't be reached, so callers can fall back.
export async function searchPlaces(
    q: string,
    country: string,
    kinds: PlaceKind[] = ["area", "city"],
    limit = 8
): Promise<PlaceResult[]> {
    const { data, error } = await supabase.rpc("search_places", { q, p_country: country, p_kinds: kinds, lim: limit });
    if (error) throw error;
    return (data ?? []) as PlaceResult[];
}

// The regions we have for a country, as that country's data names them (county, province, state...).
// Used when a host adds an area that isn't in the table yet and has to say which region it is in.
export async function fetchRegions(country: string): Promise<string[]> {
    const { data, error } = await supabase
        .from("places")
        .select("name")
        .eq("country_code", country.toUpperCase())
        .eq("kind", "region")
        .order("name")
        .limit(200);
    if (error) throw error;
    return (data ?? []).map((r: { name: string }) => r.name);
}

type Point = { latitude: number; longitude: number };

// straight-line distance in km (haversine)
export function distanceKm(a: Point, b: Point): number {
    const R = 6371;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const dLat = toRad(b.latitude - a.latitude);
    const dLng = toRad(b.longitude - a.longitude);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
}