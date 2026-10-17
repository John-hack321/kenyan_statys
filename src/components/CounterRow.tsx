import { TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { rm, rs, rv } from "@/styles/responsive";

type StepButtonProps = { icon: "add" | "remove"; disabled: boolean; label: string; onPress: () => void };

const StepButton = ({ icon, disabled, label, onPress }: StepButtonProps) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        className={`items-center justify-center rounded-full border ${disabled ? "border-gray-200" : "border-gray-400"}`}
        style={{ height: rm(36), width: rm(36) }}
    >
        <Ionicons name={icon} size={rm(18)} color={disabled ? "#D1D5DB" : "#111"} />
    </TouchableOpacity>
);

type Props = {
    label: string;
    value: number;
    min: number;
    max: number;
    onChange: (value: number) => void;
};

// one "label  - 2 +" row. It owns no state: the value lives in the draft store and comes in as a prop.
export default function CounterRow({ label, value, min, max, onChange }: Props) {
    return (
        <View className="flex-row items-center justify-between border-b border-gray-200" style={{ paddingVertical: rv(18) }}>
            <AppText variant="body">{label}</AppText>
            <View className="flex-row items-center" style={{ gap: rs(14) }}>
                <StepButton icon="remove" label={`Decrease ${label}`} disabled={value <= min} onPress={() => onChange(Math.max(min, value - 1))} />
                <AppText variant="large" weight="semibold" style={{ minWidth: rs(28), textAlign: "center" }}>{value}</AppText>
                <StepButton icon="add" label={`Increase ${label}`} disabled={value >= max} onPress={() => onChange(Math.min(max, value + 1))} />
            </View>
        </View>
    );
}