import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { useAuthContext } from "@/lib/hooks/auth-context";
import { getHostRequirements } from "@/lib/hostRequirements";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

// Where a host lands right after publishing. The listing is ALREADY saved (publish_listing in Supabase);
// it goes live once the steps below are done. It shows what the ACCOUNT has verified, read from Supabase,
// never from a flag the app can set. The phone code and the ID check are wired up in the next step.
export default function HostSetupPage() {
    const router = useRouter();
    const { session, isLoading } = useAuthContext();
    const [contact, setContact] = useState<{ phone: string | null; email: string | null } | null>(null);

    // the draft is emptied after publishing, so the phone and email to verify come from the host's private row
    useEffect(() => {
        if (!session) return;
        supabase
            .from("host_private")
            .select("contact_phone, contact_email")
            .eq("user_id", session.user.id)
            .maybeSingle()
            .then(({ data }) => setContact({ phone: data?.contact_phone ?? null, email: data?.contact_email ?? null }));
    }, [session]);

    if (isLoading) return null;

    const requirements = getHostRequirements(session?.user ?? null, { contactEmail: contact?.email ?? undefined })
        .filter((r) => r.key !== "publish")
        .map((r) => (r.key === "phone" && !r.done && contact?.phone ? { ...r, detail: `We'll text a code to ${contact.phone}.` } : r));
    const doneCount = requirements.filter((r) => r.done).length;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: rs(20), paddingBottom: rv(32), gap: rv(14) }}>
                <View>
                    <AppText variant="heading">Your listing is saved!</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        {doneCount} of {requirements.length} steps done. It goes live as soon as the rest are finished.
                    </AppText>
                </View>

                {requirements.map((r) => (
                    <View
                        key={r.key}
                        className="flex-row items-center rounded-2xl border border-gray-200 bg-white"
                        style={{ padding: rs(14), gap: rs(12) }}
                    >
                        <Ionicons
                            name={r.done ? "checkmark-circle" : "ellipse-outline"}
                            size={rm(26)}
                            color={r.done ? COLORS.green : COLORS.faint}
                        />
                        <View style={{ flex: 1 }}>
                            <AppText variant="body" weight="semibold">{r.title}</AppText>
                            <AppText variant="small" className="text-gray-500">{r.detail}</AppText>
                        </View>
                    </View>
                ))}

                <View
                    className="flex-row items-center rounded-2xl border border-gray-200 bg-white"
                    style={{ padding: rs(14), gap: rs(12), opacity: 0.55 }}
                >
                    <Ionicons name="lock-closed-outline" size={rm(26)} color={COLORS.faint} />
                    <View style={{ flex: 1 }}>
                        <AppText variant="body" weight="semibold">Go live</AppText>
                        <AppText variant="small" className="text-gray-500">Happens automatically once the steps above are done.</AppText>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => router.replace("/")}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    className="items-center justify-center rounded-xl border border-gray-300"
                    style={{ height: rm(48), marginTop: rv(6) }}
                >
                    <AppText variant="large" weight="semibold">Back to home</AppText>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}
