import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ListingType = "Room" | "Hotel" | "House" | "Apartment" | "GuestHouse";
export type BasicDetailsType = {
    maxGuests : number;
    rooms : number;
    beds : number;
    bathrooms: number;
}

// Every field is optional: the draft starts empty and each page of the flow fills in its own part.
// Add new fields here as you build the next pages.
export type BecomeAHostVentureDraft = {
    type?: ListingType;
    basicDetails? : BasicDetailsType;
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