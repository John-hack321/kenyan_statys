import HostPlaceholder from "@/components/host/HostPlaceholder";

// "Hosting": the host's home. Later: today's check-ins, alerts, earnings summary.
export default function HostDashboard() {
    return (
        <HostPlaceholder
            title="Hosting"
            icon="grid-outline"
            emptyTitle="Your hosting overview will be here"
            emptyNote="Check-ins, new booking requests and earnings will show up once guests start booking."
        />
    );
}