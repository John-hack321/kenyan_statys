export const MIN_PHOTOS = 3;   // photos needed before "Next" works on the photos page
export const MAX_PHOTOS = 10;

// Price per night, in KES. Keep in sync with publish_listing() in supabase/migrations/04_publishing.sql
export const PRICE_DEFAULT = 1000; // what the page starts with
export const PRICE_MIN = 500;
export const PRICE_MAX = 200000;
export const PRICE_SUGGESTIONS = [1000, 1500, 2500, 4000];