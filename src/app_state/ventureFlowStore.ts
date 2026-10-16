import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ListingType = "Room" | "Hotel" | "House" | "Apartment" | "GuestHouse"

export type BecomeAHostVentureDraft = {
    type : ListingType
}

type BecomeAHostVentureDraftStore = {
    draft : BecomeAHostVentureDraft | null;
    setDraft : (draft : BecomeAHostVentureDraft) => void;
    //setItem : (item) => void; I want to set a way in which I can set only sepcific part of the draft like maybe I just want to add the type or something okay . 
    resetDraft : () => void;
}

export const useVentureDraftStore = create<BecomeAHostVentureDraftStore>()(
    persist(
        (set) => ({
            draft : { type: "Apartment" }, // preselect apartment for a new venture

            setDraft : (draft) => set({draft}),
            resetDraft : () => set({draft: { type: "Apartment" }})

        }),
        { name: 'venture-draft-storage' }
    )
)
