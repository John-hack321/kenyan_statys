// src/api/listings.ts
import { supabase } from '../../lib/supabase';
import { mediaUrl } from '../../lib/media-url';
import { ListingCard, ListingFilters, PAGE_SIZE, useListingsStore } from '@/app_state/listing_store';

// One row of the listing_cards view, exactly as the database returns it.
type ListingCardRow = {
    id: string;
    title: string;
    type: string;
    price: number;
    region: string | null;
    area: string | null;
    created_at: string;
    venture_name: string;
    is_verified: boolean;
    cover_path: string | null;
    rating: number | null;
    review_count: number;
};

// database row (snake_case) -> what the UI uses (camelCase, with a ready image url)
function toListingCard(row: ListingCardRow): ListingCard {
    return {
        id: row.id,
        title: row.title,
        type: row.type,
        price: Number(row.price),
        region: row.region,
        area: row.area,
        coverUrl: mediaUrl(row.cover_path),
        rating: row.rating === null ? null : Number(row.rating),
        reviewCount: row.review_count ?? 0,
        ventureName: row.venture_name,
        isVerified: row.is_verified,
        createdAt: row.created_at,
    };
}

// Asks Supabase for one page of the feed (guests can call this: RLS lets them read active listings).
async function fetchPage(filters: ListingFilters, page: number) {
  const from = page * PAGE_SIZE;

    let query = supabase.from('listing_cards').select('*');
    if (filters.region) query = query.eq('region', filters.region);
    if (filters.type) query = query.eq('type', filters.type);
    if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice);
    if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice);

    const { data, error } = await query
        .order('created_at', { ascending: false })
        .order('id')                                  // tie-breaker so pages never repeat or skip items
        .range(from, from + PAGE_SIZE - 1);

    if (error) throw error;
    return ((data ?? []) as ListingCardRow[]).map(toListingCard);
}

// Every request gets a number. If a newer request starts while an older one is still on the way
// (user changes a filter quickly), the older answer is thrown away instead of overwriting the new one.
let latestRequest = 0;

// Loads page 1 (replacing what is on screen). Call it when the home screen opens and on pull-to-refresh.
export async function loadListings() {
    const store = useListingsStore.getState();
    const requestId = ++latestRequest;
    const hasItems = store.items.length > 0;

    store.setStatus({ isLoading: !hasItems, isRefreshing: hasItems, isLoadingMore: false, error: null });

    try {
        const items = await fetchPage(useListingsStore.getState().filters, 0);
        if (requestId !== latestRequest) return;      // outdated answer, ignore it
        useListingsStore.getState().setItems(items);
        useListingsStore.getState().setPage(0);
        useListingsStore.getState().setStatus({ hasMore: items.length === PAGE_SIZE });
    } catch (err) {
        if (requestId !== latestRequest) return;
        console.error('loadListings failed', err);
        useListingsStore.getState().setStatus({ error: 'Could not load listings. Pull down to try again.' });
    } finally {
    if (requestId === latestRequest) {
        useListingsStore.getState().setStatus({ isLoading: false, isRefreshing: false });
    }
    } 
}

// Loads the next page and adds it under the current items. Call it from the list's onEndReached.
export async function loadMoreListings() {
    const { filters, page, hasMore, isLoading, isRefreshing, isLoadingMore } = useListingsStore.getState();
    if (!hasMore || isLoading || isRefreshing || isLoadingMore) return;   // nothing to do, or already busy

    const requestId = ++latestRequest;
    useListingsStore.getState().setStatus({ isLoadingMore: true, error: null });

    try {
        const nextItems = await fetchPage(filters, page + 1);
        if (requestId !== latestRequest) return;
        useListingsStore.getState().appendItems(nextItems);
        useListingsStore.getState().setPage(page + 1);
        useListingsStore.getState().setStatus({ hasMore: nextItems.length === PAGE_SIZE });
    } catch (err) {
        if (requestId !== latestRequest) return;
        console.error('loadMoreListings failed', err);
        useListingsStore.getState().setStatus({ error: 'Could not load more listings.' });
    } finally {
        if (requestId === latestRequest) {
        useListingsStore.getState().setStatus({ isLoadingMore: false });
        }
    }
}

// Changes the filters and reloads from page 1. The old items are cleared first,
// because they belong to the old filters and would be misleading on screen.
export async function applyListingFilters(filters: ListingFilters) {
    useListingsStore.getState().setFilters(filters);
    useListingsStore.getState().setItems([]);
    useListingsStore.getState().setStatus({ hasMore: true });
    await loadListings();
}