// src/app_state/listings_store.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export const PAGE_SIZE = 20;

// One card on the home feed. This is the shape the UI uses (camelCase),
// the api file converts it from the database's snake_case.
export type ListingCard = {
    id: string;
    title: string;
    type: string;                // 'bedsitter' | 'studio' | 'one_bedroom' | 'two_bedroom' ...
    price: number;               // per night, KES
    region: string | null;       // e.g. Nairobi
    area: string | null;         // e.g. Roysambu
    coverUrl: string | null;     // ready to put in <Image source={{ uri }} />, null = show a placeholder
    rating: number | null;       // null = no reviews yet
    reviewCount: number;
    ventureName: string;
    isVerified: boolean;
    createdAt: string;
};

// What the user can narrow the feed by. Leave a field out (undefined) = no filter on it.
export type ListingFilters = {
    region?: string;
    type?: string;
    minPrice?: number;
    maxPrice?: number;
};

type ListingsStore = {
    items: ListingCard[];
    filters: ListingFilters;
    page: number;                // last page loaded (0 = the first page)
    hasMore: boolean;            // false once the last page has been loaded
    isLoading: boolean;          // first load, nothing to show yet -> show skeletons
    isRefreshing: boolean;       // reloading while items are already on screen (pull to refresh)
    isLoadingMore: boolean;      // loading the next page at the bottom -> show a small spinner
    error: string | null;

    setItems: (items: ListingCard[]) => void;
    appendItems: (items: ListingCard[]) => void;
    setPage: (page: number) => void;
    setFilters: (filters: ListingFilters) => void;
    setStatus: (status: Partial<Pick<ListingsStore, 'hasMore' | 'isLoading' | 'isRefreshing' | 'isLoadingMore' | 'error'>>) => void;
    resetListings: () => void;
};

export const useListingsStore = create<ListingsStore>()(
    persist(
        (set) => ({
        items: [],
        filters: {},
        page: 0,
        hasMore: true,
        isLoading: false,
        isRefreshing: false,
        isLoadingMore: false,
        error: null,

        setItems: (items) => set({ items }),
        // skip anything already in the list (a new listing arriving shifts the pages and would repeat items)
        appendItems: (newItems) =>
            set((state) => {
            const known = new Set(state.items.map((item) => item.id));
            return { items: [...state.items, ...newItems.filter((item) => !known.has(item.id))] };
            }),
        setPage: (page) => set({ page }),
        setFilters: (filters) => set({ filters }),
        setStatus: (status) => set(status),
        resetListings: () =>
            set({ items: [], filters: {}, page: 0, hasMore: true, isLoading: false, isRefreshing: false, isLoadingMore: false, error: null }),
        }),
        {
        name: 'listings-storage',
        storage: createJSONStorage(() => AsyncStorage),
        version: 1,
        // Only keep the first page on the phone: next time the app opens, the feed shows
        // instantly and is then refreshed from the server. Loading flags are never saved.
        partialize: (state) => ({ items: state.items.slice(0, PAGE_SIZE) }),
        }
    )
);