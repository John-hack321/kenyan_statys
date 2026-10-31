import { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AppText from "@/components/AppText";
import FinishSetupCard from "@/components/host/FinishSetupCard";
import HostOnly from "./HostOnly";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

type Props = {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    emptyTitle: string;
    emptyNote: string;
    children?: ReactNode;      // real content goes here when the screen is built
};

// Common shell for the host tabs: guard, safe-area title, the setup card, and an empty state.
// Replace the empty state with real content as each screen gets built.
export default function HostPlaceholder({ title, icon, emptyTitle, emptyNote, children }: Props) {
    const insets = useSafeAreaInsets();

    return (
        <HostOnly>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingTop: insets.top + rv(16), paddingHorizontal: rs(20), paddingBottom: 160, gap: rv(16) }}
            >
                <AppText variant="heading">{title}</AppText>

                <FinishSetupCard />

                {children ?? (
                    <View
                        className="items-center justify-center rounded-2xl border border-dashed border-gray-300"
                        style={{ padding: rs(24), gap: rv(8), minHeight: rv(220) }}
                    >
                        <Ionicons name={icon} size={rm(36)} color={COLORS.faint} />
                        <AppText variant="large" weight="semibold" className="text-center">{emptyTitle}</AppText>
                        <AppText variant="small" className="text-gray-500 text-center">{emptyNote}</AppText>
                    </View>
                )}
            </ScrollView>
        </HostOnly>
    );
}