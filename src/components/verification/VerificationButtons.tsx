// src/components/verification/VerificationButtons.tsx   (NEW FILE)
// The two buttons every verification page needs. Same look as the sign-in sheet's Continue button.

import { ActivityIndicator, TouchableOpacity } from "react-native";
import AppText from "@/components/AppText";
import { COLORS } from "@/styles/colors";
import { rm } from "@/styles/responsive";

type Props = { label: string; onPress: () => void; disabled?: boolean; loading?: boolean };

export const PrimaryButton = ({ label, onPress, disabled, loading }: Props) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled, busy: !!loading }}
        style={{
            height: rm(52),
            borderRadius: rm(12),
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: disabled ? "#E5E7EB" : COLORS.green,
        }}
    >
        {loading ? (
            <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
            <AppText variant="large" weight="bold" style={{ color: disabled ? COLORS.faint : COLORS.white }}>{label}</AppText>
        )}
    </TouchableOpacity>
);

export const SecondaryButton = ({ label, onPress, disabled }: Omit<Props, "loading">) => (
    <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        className="items-center justify-center border border-gray-300 bg-white"
        style={{ height: rm(48), borderRadius: rm(12), opacity: disabled ? 0.5 : 1 }}
    >
        <AppText variant="large" weight="semibold">{label}</AppText>
    </TouchableOpacity>
);