import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { rm, rs } from "@/styles/responsive";

type Props = {
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    selected: boolean;
    onPress: () => void;
};

// A pick-many pill. Selected: green with white icon and text. Not selected: white with black icon and text.
// It owns no state: `selected` comes in as a prop. A pill (not a square tile) so long labels still fit.
export default function AmenityChip({ label, icon, selected, onPress }: Props) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.85}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={label}
            className={`flex-row items-center rounded-full border ${
                selected ? "bg-dark-green-ascents border-dark-green-ascents" : "bg-white border-gray-300"
            }`}
            style={{ height: rm(42), paddingHorizontal: rs(14), gap: rs(8) }}
        >
            <Ionicons name={icon} size={rm(18)} color={selected ? "white" : "#111"} />
            <AppText variant="small" weight="medium" className={selected ? "text-white" : "text-black"}>
                {label}
            </AppText>
        </TouchableOpacity>
    );
}