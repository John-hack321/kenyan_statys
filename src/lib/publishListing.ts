import { randomUUID } from "expo-crypto";
import { supabase } from "@/lib/supabase";
import { useVentureDraftStore, type BecomeAHostVentureDraft, type DraftPhoto } from "@/app_state/ventureFlowStore";
import { GUEST_ACCESS_TO_DB, LISTING_TYPE_TO_DB } from "@/constants/listingTypes";
import { toE164 } from "@/constants/schemas/venture";

const BUCKET = "listing-media";

const MIME: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
const extensionOf = (uri: string) => {
    const ext = (uri.split("?")[0].split(".").pop() ?? "").toLowerCase();
    return MIME[ext] ? ext : "jpg";
};

export type PublishProgress = { value: number; label: string };   // value: 0 to 1

async function uploadPhoto(photo: DraftPhoto, path: string) {
    const ext = extensionOf(photo.uri);
    const body = await (await fetch(photo.uri)).arrayBuffer();
    const { error } = await supabase.storage.from(BUCKET).upload(path, body, { contentType: MIME[ext], upsert: true });
    if (error) throw new Error(`Could not upload a photo: ${error.message}`);
}

// 3 at a time: kind to slow mobile data, quicker than one by one. `onEach` fires after every finished photo.
async function uploadAll(jobs: { photo: DraftPhoto; path: string }[], onEach: (done: number, total: number) => void) {
    let done = 0;
    for (let i = 0; i < jobs.length; i += 3) {
        await Promise.all(
            jobs.slice(i, i + 3).map(async (j) => {
                await uploadPhoto(j.photo, j.path);
                onEach(++done, jobs.length);
            })
        );
    }
}

export type PublishResult = { listingId: string; ventureId: string; isActive: boolean };

// Why it is built this way (all-or-nothing):
//   1. Photos go to Storage FIRST, into a folder named after `publishId`. Storage is a separate system, so it can't
//      be part of a database transaction. A photo left behind by a failed attempt is harmless: a retry overwrites it.
//   2. Then ONE call to publish_listing() in Supabase. A Postgres function runs as a single transaction, so the
//      venture, listing, photo records and private details are saved together or not at all.
//   3. Retrying is safe: the same `publishId` is the listing id, so the server returns the existing listing instead
//      of creating a second one.
// `hasVenture` = the host already has a venture, so only the listing part is sent.
// `onProgress` drives the progress bar on the publishing screen.
export async function publishDraft(
    draft: BecomeAHostVentureDraft,
    hasVenture: boolean,
    onProgress?: (p: PublishProgress) => void
): Promise<PublishResult> {
    onProgress?.({ value: 0.02, label: "Getting ready…" });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Please sign in to publish.");
    const uid = session.user.id;

    // one id per draft, kept in the draft so a retry does not create a second listing
    let publishId = draft.publishId;
    if (!publishId) {
        publishId = randomUUID();
        useVentureDraftStore.getState().setDraft({ publishId });
    }

    const photos = draft.photos ?? [];
    const photoJobs = photos.map((photo) => ({ photo, path: `${uid}/${publishId}/${photo.id}.${extensionOf(photo.uri)}` }));
    const cover = !hasVenture ? draft.ventureCover : undefined;
    const coverPath = cover ? `${uid}/venture/${cover.id}.${extensionOf(cover.uri)}` : undefined;

    await uploadAll([...photoJobs, ...(cover && coverPath ? [{ photo: cover, path: coverPath }] : [])], (done, total) => {
        // uploads take the bar from 5% to 85%
        onProgress?.({ value: 0.05 + 0.8 * (done / total), label: `Uploading photos (${done} of ${total})` });
    });

    const a = draft.address ?? {};
    const pin = draft.listingLocationCordinates;
    const details = draft.basicDetails;

    const payload = {
        listing_id: publishId,
        title: draft.listingName,
        description: draft.listingDescription,
        type: draft.type ? LISTING_TYPE_TO_DB[draft.type] : null,
        guest_access: draft.guestAccess ? GUEST_ACCESS_TO_DB[draft.guestAccess] : null,
        price: draft.pricePerNight,
        max_guests: details?.maxGuests,
        bedrooms: details?.bedrooms,
        beds: details?.beds,
        bathrooms: details?.bathrooms,
        amenities: draft.amenities ?? [],
        country: a.country,
        region: a.region,
        area: a.area,
        place_id: a.areaPlaceId ?? null,
        area_is_new: a.areaIsNew ?? false,
        street_address: a.streetAddress,
        building_name: a.buildingName,
        unit: a.unit,
        landmark: a.landmark,
        latitude: pin?.latitude ?? null,   // the SERVER rounds the public copy
        longitude: pin?.longitude ?? null,
        photos: photoJobs.map((j) => j.path),
        venture: hasVenture
            ? null
            : {
                    name: draft.ventureName,
                    cover_path: coverPath ?? null,
                    legal_first_name: draft.legalFirstName,
                    legal_last_name: draft.legalLastName,
                    id_country: draft.idCountry,
                    id_type: draft.idType,
                    id_last4: (draft.idNumber ?? "").slice(-4),
                    contact_phone: draft.contactPhone ? toE164(draft.contactPhone.country, draft.contactPhone.number) : null,
                    contact_email: draft.contactEmail ?? null,
                },
    };

    onProgress?.({ value: 0.92, label: "Saving your listing…" });
    const { data, error } = await supabase.rpc("publish_listing", { p: payload });
    if (error) throw new Error(error.message);

    onProgress?.({ value: 1, label: "Done" });
    return { listingId: data.listing_id, ventureId: data.venture_id, isActive: !!data.is_active };
}