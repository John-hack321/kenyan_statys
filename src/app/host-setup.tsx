import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { Href, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { useAuthContext } from "@/lib/hooks/auth-context";
import { getHostRequirements } from "@/lib/hostRequirements";
import { supabase } from "@/lib/supabase";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

// The host's verification checklist. Reached two ways: right after publishing, and from the "Finish setting up"
// card on the Profile tab. It shows what the ACCOUNT has verified, read from Supabase, never from a flag the app can set.
// For now it only SHOWS the steps; the phone code, email confirmation and ID check are built later.
// "I'll do this later" returns to the Profile tab, where the card stays until everything is done.
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

    // NOTES FOR AI : we need to make this adoptive so that is shows what needs to be verified if email it will show emal and if 
    const requirements = getHostRequirements(session?.user ?? null, { contactEmail: contact?.email ?? undefined })
        .filter((r) => r.key !== "publish")
        .map((r) => (r.key === "phone" && !r.done && contact?.phone ? { ...r, detail: `We'll text a code to ${contact.phone}.` } : r));
    const doneCount = requirements.filter((r) => r.done).length;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: rs(20), paddingBottom: rv(32), gap: rv(14) }}>
                <View>
                    <AppText variant="heading">Finish setting up</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        {doneCount} of {requirements.length} steps done. Your listing goes live as soon as the rest are finished.
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
                    onPress={() => router.replace("/profile" as Href)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    className="items-center justify-center rounded-xl border border-gray-300"
                    style={{ height: rm(48), marginTop: rv(6) }}
                >
                    <AppText variant="large" weight="semibold">I'll do this later</AppText>
                </TouchableOpacity>
                <AppText variant="caption" className="text-gray-500 text-center">
                    You can come back any time from the "Finish setting up" card on your Profile.
                </AppText>
            </ScrollView>
        </SafeAreaView>
    );
}