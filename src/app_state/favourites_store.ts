import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// PLACEHOLDER until the real wishlist exists (a `favorites` table with RLS, see DATABASE.md rules).
// For now a tapped heart is remembered ON THIS PHONE only, so the heart feels alive. When the wishlist is built,
// replace this store's toggle with a call to the database and keep the same `isFavourite(id)` shape for the cards.
type FavouritesStore = {
    ids: string[];
    toggle: (id: string) => void;
    clear: () => void;   // call on sign-out so the next person on the phone does not see this person's hearts
};

export const useFavouritesStore = create<FavouritesStore>()(
    persist(
        (set) => ({
            ids: [],
            toggle: (id) => set((s) => ({ ids: s.ids.includes(id) ? s.ids.filter((x) => x !== id) : [...s.ids, id] })),
            clear: () => set({ ids: [] }),
        }),
        { name: 'favourites-storage', storage: createJSONStorage(() => AsyncStorage), version: 1 }
    )
);