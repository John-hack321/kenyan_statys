import type { GuestAccessType, ListingType } from "@/app_state/ventureFlowStore";

// What the draft calls a type -> what the database stores in listings.type
export const LISTING_TYPE_TO_DB: Record<ListingType, string> = {
    Room: "room",
    Hotel: "hotel",
    House: "house",
    Apartment: "apartment",
    GuestHouse: "guest_house",
};

export const GUEST_ACCESS_TO_DB: Record<GuestAccessType, string> = {
    entirePlace: "entire_place",
    privateRoom: "private_room",
};

// database value -> label for cards and filter chips
export const DB_TYPE_LABELS: Record<string, string> = {
    room: "Room",
    hotel: "Hotel",
    house: "House",
    apartment: "Apartment",
    guest_house: "Guest house",
};

// 0 bedrooms is a studio or bedsitter
export const bedroomLabel = (n: number | null | undefined) =>
    n == null ? "" : n === 0 ? "Studio" : `${n} bedroom${n === 1 ? "" : "s"}`;

// "2 bedrooms · Apartment"
export const describeListing = (dbType: string, bedrooms: number | null | undefined) =>
    [bedroomLabel(bedrooms), DB_TYPE_LABELS[dbType] ?? dbType].filter(Boolean).join(" · ");

// Options for the home page filter chips (bedrooms: 3 means "3 or more")
export const BEDROOM_FILTERS = [
    { value: 0, label: "Studio" },
    { value: 1, label: "1" },
    { value: 2, label: "2" },
    { value: 3, label: "3+" },
] as const;
