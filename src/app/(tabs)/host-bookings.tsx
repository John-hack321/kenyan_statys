import HostPlaceholder from "@/components/host/HostPlaceholder";

// "Bookings": requests and the calendar. Later: bookings for the host's listings (RLS "Guest or host can view booking"
// is REPORTED, not verified), status changes through a guarded function, never direct updates (see DATABASE.md).
export default function HostBookings() {
    return (
        <HostPlaceholder
            title="Bookings"
            icon="calendar-outline"
            emptyTitle="No bookings yet"
            emptyNote="Booking requests and your calendar will show up here."
        />
    );
}