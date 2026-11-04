// src/components/verification/StatusPanel.tsx   (NEW FILE)
//
// One panel per verification state: a round icon (or a spinner while we wait), a title and a short note.
// It owns no state: the page decides which panel to show.

import { ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

type Tone = "success" | "warning" | "danger" | "neutral";

const TONES: Record<Tone, { fg: string; bg: string }> = {
    success: { fg: COLORS.green, bg: COLORS.greenSoft },
    warning: { fg: COLORS.warning, bg: COLORS.warningSoft },
    danger: { fg: COLORS.danger, bg: COLORS.dangerSoft },
    neutral: { fg: COLORS.muted, bg: "#F3F4F6" },
};

type Props = {
    icon: keyof typeof Ionicons.glyphMap;
    tone: Tone;
    title: string;
    note: string;
    busy?: boolean;   // shows a spinner instead of the icon
};

export default function StatusPanel({ icon, tone, title, note, busy }: Props) {
    const { fg, bg } = TONES[tone];
    return (
        <View className="items-center" style={{ paddingHorizontal: rs(8), paddingVertical: rv(24), gap: rv(12) }}>
            <View
                className="items-center justify-center"
                style={{ height: rm(88), width: rm(88), borderRadius: rm(44), backgroundColor: bg }}
            >
                {busy ? <ActivityIndicator size="large" color={fg} /> : <Ionicons name={icon} size={rm(44)} color={fg} />}
            </View>
            <AppText variant="title" weight="bold" className="text-center">{title}</AppText>
            <AppText variant="body" className="text-center text-gray-500">{note}</AppText>
        </View>
    );
}