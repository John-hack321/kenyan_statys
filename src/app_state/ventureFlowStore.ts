import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ListingType = "Room" | "Hotel" | "House" | "Apartment" | "GuestHouse";

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
    reservation?: "entirePlace" | "room" // note for AI : you can maybe find a better name for this instead of offer just incase it is not that good enough . 
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
            // the old saved draft had type "Apartment" preselected and could be null; start clean
            version: 1,
            migrate: () => ({ draft: {} }) as any,
        }
    )
);