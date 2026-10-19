import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ListingType = "Room" | "Hotel" | "House" | "Apartment" | "GuestHouse";

// what guests get when they book: the whole place, or just a room (plus shared spaces)
export type GuestAccessType = "entirePlace" | "privateRoom";

export type listingLocationCordinatesType = {
    longitude : number;
    latitude : number;
}

export type BasicDetailsType = {
    maxGuests: number;
    rooms: number;
    beds: number;
    bathrooms: number;
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
            // version 2: `reservation` was renamed to `guestAccess`, so old saved drafts are dropped
            version: 2,
            migrate: () => ({ draft: {} }) as any,
        }
    )
);