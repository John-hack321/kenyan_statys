import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { COLORS } from "@/styles/colors";
import { rm, rs } from "@/styles/responsive";

export const SaveAndExitButton = ({ onPress }: { onPress?: () => void }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Save and exit"
        className="flex-row items-center rounded-full border border-gray-300 bg-white"
        style={{ height: rm(36), paddingHorizontal: rs(14), gap: rs(6) }}
    >
        <Ionicons name="bookmark-outline" size={rm(16)} color={COLORS.green} />
        <AppText variant="small" weight="medium" className="text-dark-green-ascents">Save & exit</AppText>
    </TouchableOpacity>
);

// just an icon: quitting without saving
export const DiscardButton = ({ onPress }: { onPress?: () => void }) => (
    <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Discard listing"
        className="items-center justify-center rounded-full border border-gray-300 bg-white"
        style={{ height: rm(36), width: rm(36) }}
    >
        <Ionicons name="trash-outline" size={rm(18)} color={COLORS.danger} />
    </TouchableOpacity>
);

type NextPageButtonProps = {
    clickable: boolean;
    onPress?: () => void;
    label?: string;     // e.g. "Finish" on the last page
    loading?: boolean;  // shows a spinner and blocks taps (publishing)
};

export const NextPageButton = ({ clickable, onPress, label = "Next", loading = false }: NextPageButtonProps) => {
    const active = clickable && !loading;
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!active}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ disabled: !active, busy: loading }}
            className={`flex-row items-center justify-center rounded-xl ${clickable ? "bg-dark-green-ascents" : "bg-gray-200"}`}
            style={{ height: rm(48), minWidth: rm(132), paddingHorizontal: rs(28), gap: rs(8) }}
        >
            {loading ? (
                <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
                <>
                    <AppText variant="large" weight="bold" className={clickable ? "text-white" : "text-gray-400"}>{label}</AppText>
                    <Ionicons name="arrow-forward" size={rm(18)} color={clickable ? COLORS.white : COLORS.faint} />
                </>
            )}
        </TouchableOpacity>
    );
};

export const BackButton = ({ onPress, disabled }: { onPress?: () => void; disabled?: boolean }) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        className="flex-row items-center justify-center rounded-xl"
        style={{ height: rm(48), paddingHorizontal: rs(12), gap: rs(4), opacity: disabled ? 0.4 : 1 }}
    >
        <Ionicons name="chevron-back" size={rm(18)} color="black" />
        <AppText variant="large" weight="semibold" className="underline">Back</AppText>
    </TouchableOpacity>
);

// thin bar under the header showing how far through the flow the user is
export const FlowProgressBar = ({ progress }: { progress: number }) => (
    <View className="w-full bg-gray-200" style={{ height: rm(4) }}>
        <View className="bg-dark-green-ascents" style={{ height: "100%", width: `${Math.round(progress * 100)}%` }} />
    </View>
);