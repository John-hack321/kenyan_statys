import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { rm, rs, rv } from "@/styles/responsive";

type IconName = keyof typeof Ionicons.glyphMap;

type Props = {
    title: string;
    description: string;
    icon: IconName;
    selected: boolean;
    onPress: () => void;
};

// A wide, tappable "pick one" card: icon on the left, text in the middle, radio dot on the right.
// It owns no state: `selected` comes in as a prop and `onPress` tells the page what was picked.
// The border is always 2px wide (only its colour changes), so the layout never jumps when selected.
export default function ChoiceCard({ title, description, icon, selected, onPress }: Props) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={`${title}. ${description}`}
            className={`flex-row items-center rounded-2xl border-2 ${
                selected ? "border-dark-green-ascents bg-[#EEF5F0]" : "border-gray-200 bg-white"
            }`}
            style={{ paddingHorizontal: rs(16), paddingVertical: rv(18), gap: rs(14) }}
        >
            <View
                className={`items-center justify-center rounded-full ${selected ? "bg-dark-green-ascents" : "bg-gray-100"}`}
                style={{ height: rm(48), width: rm(48) }}
            >
                <Ionicons name={icon} size={rm(24)} color={selected ? "white" : "#111"} />
            </View>

            <View className="flex-1">
                <AppText variant="large" weight="semibold">{title}</AppText>
                <AppText variant="small" className="text-gray-500" style={{ marginTop: rv(2) }}>
                    {description}
                </AppText>
            </View>

            {/* radio dot */}
            <View
                className={`items-center justify-center rounded-full border-2 ${
                    selected ? "border-dark-green-ascents" : "border-gray-300"
                }`}
                style={{ height: rm(22), width: rm(22) }}
            >
                {selected && (
                    <View className="rounded-full bg-dark-green-ascents" style={{ height: rm(10), width: rm(10) }} />
                )}
            </View>
        </TouchableOpacity>
    );
}