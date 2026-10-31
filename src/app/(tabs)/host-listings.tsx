import HostPlaceholder from "@/components/host/HostPlaceholder";

// "Listings": the host's own listings. Later: list from the database (owner policy needed, see DATABASE.md),
// pause/resume, edit (pushed screen in the (host) group), "Add a new listing" (disabled while unverified).
export default function HostListings() {
    return (
        <HostPlaceholder
            title="Listings"
            icon="business-outline"
            emptyTitle="Your listings will be here"
            emptyNote="You will be able to edit, pause and add listings from this tab."
        />
    );
}