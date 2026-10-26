import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { rm, rs, rv } from "@/styles/responsive";

type Props = {
    label: string;
    selected?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
};

// A small tap-to-fill pill. Selected: green with white text. Not selected: white with black text.
export default function SuggestionChip({ label, selected = false, icon, onPress }: Props) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`flex-row items-center rounded-full border ${selected ? "bg-dark-green-ascents border-dark-green-ascents" : "bg-white border-gray-300"}`}
            style={{ paddingHorizontal: rs(12), paddingVertical: rv(7), gap: rs(6) }}
        >
            {icon && <Ionicons name={icon} size={rm(14)} color={selected ? "white" : "#064D30"} />}
            <AppText variant="small" weight="medium" className={selected ? "text-white" : "text-black"}>{label}</AppText>
        </TouchableOpacity>
    );
}
