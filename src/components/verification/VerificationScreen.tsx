// src/components/verification/VerificationScreen.tsx   (NEW FILE)
//
// The shell every verification page uses: safe area, a back button with a title, scrolling content and an
// optional footer for the main buttons. Built once so the future GUEST verification reuses it.

import { ReactNode } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Href, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AppText from "@/components/AppText";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

type Props = {
    title: string;
    children: ReactNode;
    footer?: ReactNode;      // buttons pinned to the bottom
    onBack?: () => void;     // default: go back, or to the host-setup checklist if there is nothing to go back to
};

export default function VerificationScreen({ title, children, footer, onBack }: Props) {
    const router = useRouter();
    const goBack = onBack ?? (() => (router.canGoBack() ? router.back() : router.replace("/host-setup" as Href)));

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-row items-center justify-center border-b border-gray-200" style={{ height: rm(52) }}>
                <TouchableOpacity
                    onPress={goBack}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    style={{ position: "absolute", left: rs(16) }}
                >
                    <Ionicons name="chevron-back" size={rm(24)} color={COLORS.ink} />
                </TouchableOpacity>
                <AppText variant="large" weight="semibold">{title}</AppText>
            </View>

            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: rs(20), paddingTop: rv(20), paddingBottom: rv(24), gap: rv(16) }}
            >
                {children}
            </ScrollView>

            {footer ? (
                <View className="border-t border-gray-100 bg-white" style={{ paddingHorizontal: rs(20), paddingVertical: rv(12), gap: rv(10) }}>
                    {footer}
                </View>
            ) : null}
        </SafeAreaView>
    );
}