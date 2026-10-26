import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AmenityId } from "@/constants/amenities";

export type ListingType = "Room" | "Hotel" | "House" | "Apartment" | "GuestHouse";

// what guests get when they book: the whole place, or just a room (plus shared spaces)
export type GuestAccessType = "entirePlace" | "privateRoom";

// ID types for host verification
export type IdType = "national_id" | "passport" | "resident_id";

export type listingLocationCordinatesType = {
    longitude: number;
    latitude: number;
};

export type BasicDetailsType = {
    maxGuests: number;
    rooms: number;
    beds: number;
    bathrooms: number;
};

// A photo the host picked but that is not uploaded yet. `uri` is a file on the phone.
// The ORDER of the array is the order guests will see: the first photo is the listing cover.
export type DraftPhoto = {
    id: string;
    uri: string;
    width?: number;
    height?: number;
};

// The address the host types. region/area are PUBLIC (used for search), the street, building, unit and
// landmark are private until a guest books. `country` is the ISO code, e.g. "KE".
export type ListingAddress = {
    country?: string;
    region?: string;
    area?: string;
    areaPlaceId?: number;   // set when the host picked the area from our places table
    areaIsNew?: boolean;    // set when the host added an area that wasn't in the table
    streetAddress?: string;
    buildingName?: string;
    unit?: string;
    landmark?: string;
};

// what the page shows (and saves) before the host touches anything
export const DEFAULT_BASIC_DETAILS: BasicDetailsType = { maxGuests: 2, rooms: 1, beds: 1, bathrooms: 1 };

// for sentences like "Tell us more about your guest house"
export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
    Room: "room",
    Hotel: "hotel",
    House: "house",
    Apartment: "apartment",
    GuestHouse: "guest house",
};

// Every field is optional: the draft starts empty and each page of the flow fills in its own part.
// Add new fields here as you build the next pages.
export type BecomeAHostVentureDraft = {
    type?: ListingType;
    basicDetails?: BasicDetailsType;
    guestAccess?: GuestAccessType;
    listingLocationCordinates?: listingLocationCordinatesType;
    amenities?: AmenityId[];
    photos?: DraftPhoto[];
    listingName?: string;
    listingDescription?: string;
    address?: ListingAddress;
    // Host verification fields
    legalFirstName?: string;
    legalLastName?: string;
    idCountry?: string;
    idType?: IdType;
    idNumber?: string;
    // Venture fields
    ventureName?: string;
    ventureCover?: DraftPhoto;
    // Contact fields
    contactPhone?: { country: string; number: string };
    contactEmail?: string;
};

type BecomeAHostVentureDraftStore = {
    draft: BecomeAHostVentureDraft;
    // merges: setDraft({ type: "House" }) only changes `type` and keeps everything else
    setDraft: (patch: Partial<BecomeAHostVentureDraft>) => void;
    resetDraft: () => void;
};

export const useVentureDraftStore = create<BecomeAHostVentureDraftStore>()(
    persist(
        (set) => ({
            draft: {}, // nothing preselected, so "Next" stays disabled until the user chooses

            setDraft: (patch) => set((state) => ({ draft: { ...state.draft, ...patch } })),
            resetDraft: () => set({ draft: {} }),
        }),
        {
            name: "venture-draft-storage",
            storage: createJSONStorage(() => AsyncStorage),
            // Sensitive data (ID number and phone number) is kept in memory only, never persisted
            partialize: (state) => ({
                draft: {
                    ...state.draft,
                    idNumber: undefined, // never save ID number to storage
                    contactPhone: undefined, // never save phone number to storage
                },
            }),
            // version 2: `reservation` was renamed to `guestAccess`, so old saved drafts are dropped
            version: 2,
            migrate: () => ({ draft: {} }) as any,
        }
    )
);