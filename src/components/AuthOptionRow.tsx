import { ReactNode } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import AppText from "@/components/AppText";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

type Props = {
    label: string;
    icon: ReactNode;          // drawn on the left
    onPress?: () => void;
    loading?: boolean;        // spinner replaces the icon
    sublabel?: string;        // small grey line under the label
    badge?: string;           // small pill on the right ("Soon", "Suggested")
};

// The outlined "Continue with ..." row: icon pinned to the left, text centred, optional pill on the right.
// Every sign-in option uses it, so they all line up the same way (like Airbnb).
export default function AuthOptionRow({ label, icon, onPress, loading, sublabel, badge }: Props) {
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel={sublabel ? `${label} ${sublabel}` : label}
            style={{
                minHeight: rm(52),
                paddingVertical: rv(8),
                paddingHorizontal: rs(48),
                borderWidth: 1,
                borderColor: COLORS.border,
                borderRadius: rm(12),
                backgroundColor: COLORS.white,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <View style={{ position: "absolute", left: rs(16), top: 0, bottom: 0, justifyContent: "center" }}>
                {loading ? <ActivityIndicator size="small" color={COLORS.green} /> : icon}
            </View>

            <AppText variant="body" weight="semibold" numberOfLines={1}>{label}</AppText>
            {!!sublabel && (
                <AppText variant="caption" className="text-gray-500" numberOfLines={1}>{sublabel}</AppText>
            )}

            {/* label sitting ON the top border line, like a notched outlined field */}
            {!!badge && (
                <View
                    pointerEvents="none"
                    style={{
                        position: "absolute",
                        top: -rm(9),
                        right: rs(16),
                        paddingHorizontal: rs(6),
                        backgroundColor: COLORS.white,   // hides the border line behind the text
                    }}
                >
                    <AppText variant="caption" weight="semibold" style={{ color: COLORS.green }}>{badge}</AppText>
                </View>
            )}
        </TouchableOpacity>
    );
}