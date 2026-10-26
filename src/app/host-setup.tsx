import { ScrollView, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { useVentureDraftStore } from "@/app_state/ventureFlowStore";
import { useAuthContext } from "@/lib/hooks/auth-context";
import { canPublish, getHostRequirements } from "@/lib/hostRequirements";
import { rm, rs, rv } from "@/styles/responsive";

const GREEN = "#064D30";

// Where a host lands after signing in at the end of the venture flow.
// It shows what the ACCOUNT already has verified (read from Supabase, never from a flag the app can set).
// The phone code, the ID check and the publish button are wired up in the next step.
export default function HostSetupPage() {
    const router = useRouter();
    const { session, isLoading } = useAuthContext();
    const draft = useVentureDraftStore((s) => s.draft);

    if (isLoading) return null;

    const requirements = getHostRequirements(session?.user ?? null, draft);
    const ready = canPublish(requirements);
    const doneCount = requirements.filter((r) => r.key !== "publish" && r.done).length;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: rs(20), paddingBottom: rv(32), gap: rv(14) }}>
                <View>
                    <AppText variant="heading">You're in. Almost live!</AppText>
                    <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(4) }}>
                        {doneCount} of 4 steps done. Your listing "{draft.listingName || "your listing"}" is saved and waiting.
                    </AppText>
                </View>

                {requirements.map((r) => {
                    const locked = r.key === "publish" && !ready;
                    return (
                        <View
                            key={r.key}
                            className="flex-row items-center rounded-2xl border border-gray-200 bg-white"
                            style={{ padding: rs(14), gap: rs(12), opacity: locked ? 0.55 : 1 }}
                        >
                            <Ionicons
                                name={r.done ? "checkmark-circle" : locked ? "lock-closed-outline" : "ellipse-outline"}
                                size={rm(26)}
                                color={r.done ? GREEN : "#9CA3AF"}
                            />
                            <View style={{ flex: 1 }}>
                                <AppText variant="body" weight="semibold">{r.title}</AppText>
                                <AppText variant="small" className="text-gray-500">{r.detail}</AppText>
                            </View>
                        </View>
                    );
                })}

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
