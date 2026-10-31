import { TouchableOpacity, View } from "react-native";
import { Href, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { useHostSetupPending } from "@/lib/hooks/useAppMode";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

// Shown to a host whose venture is not verified yet. Tapping it opens the checklist (/host-setup).
// It renders nothing for verified hosts and for guests, so it can be dropped on any host-facing screen.
// What the steps DO (phone code, email confirmation, ID check) is built later.
export default function FinishSetupCard() {
    const router = useRouter();
    const pending = useHostSetupPending();
    if (!pending) return null;

    return (
        <TouchableOpacity
            onPress={() => router.push("/host-setup" as Href)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Finish setting up your host profile"
            className="flex-row items-center rounded-2xl"
            style={{ backgroundColor: COLORS.greenSoft, borderWidth: 1, borderColor: COLORS.greenLine, padding: rs(14), gap: rs(12) }}
        >
            <View className="items-center justify-center rounded-full bg-dark-green-ascents" style={{ height: rm(40), width: rm(40) }}>
                <Ionicons name="shield-checkmark-outline" size={rm(20)} color="white" />
            </View>
            <View style={{ flex: 1 }}>
                <AppText variant="body" weight="semibold">Finish setting up</AppText>
                <AppText variant="small" className="text-gray-600" style={{ marginTop: rv(2) }}>
                    Confirm your email, phone and ID so your listings can go live.
                </AppText>
            </View>
            <Ionicons name="chevron-forward" size={rm(20)} color={COLORS.green} />
        </TouchableOpacity>
    );
}