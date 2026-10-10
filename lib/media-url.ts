import { supabase } from './supabase'

// Seed data stores full URLs; real uploads will store a path inside the bucket.
export function mediaUrl(path: string | null) {
    if (!path) return null                       // listing with no cover -> show a placeholder
    if (path.startsWith('http')) return path
    return supabase.storage.from('listing-media').getPublicUrl(path).data.publicUrl
}