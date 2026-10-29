import { useEffect, useRef } from "react";
import { Animated, Easing, Modal, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import AppText from "@/components/AppText";
import { COLORS } from "@/styles/colors";
import { rm, rs, rv } from "@/styles/responsive";

type Props = {
    visible: boolean;
    progress: number;   // 0 to 1
    label: string;      // what is happening right now, e.g. "Uploading photos (3 of 6)"
};

// Covers the whole screen while a listing is being published, with a REAL progress bar (it follows the actual
// photo uploads, so it never "stalls at 90%"). Dark backdrop + light status bar icons, like our other covering modals.
// The Android back button does nothing while this is open, so nobody leaves halfway.
export default function PublishingOverlay({ visible, progress, label }: Props) {
    const fill = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (!visible) {
            fill.setValue(0);
            return;
        }
        Animated.timing(fill, {
            toValue: Math.max(0, Math.min(1, progress)),
            duration: 350,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false, // animating width
        }).start();
    }, [visible, progress, fill]);

    const width = fill.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] });

    return (
        <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={() => {}}>
            <StatusBar style="light" />
            <View style={{ flex: 1, backgroundColor: "#0B0B0B", justifyContent: "center", paddingHorizontal: rs(32) }}>
                <AppText variant="title" weight="bold" style={{ color: COLORS.white }}>
                    Publishing your listing
                </AppText>
                <AppText variant="small" style={{ color: "#D1D5DB", marginTop: rv(6) }}>
                    Please keep the app open. This can take a minute on a slow connection.
                </AppText>

                <View
                    accessibilityRole="progressbar"
                    accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
                    style={{ height: rm(8), borderRadius: 999, backgroundColor: "rgba(255,255,255,0.18)", overflow: "hidden", marginTop: rv(28) }}
                >
                    <Animated.View style={{ height: "100%", width, borderRadius: 999, backgroundColor: COLORS.greenLine }} />
                </View>

                <View className="flex-row items-center justify-between" style={{ marginTop: rv(10) }}>
                    <AppText variant="small" style={{ color: "#E5E7EB", flex: 1 }} numberOfLines={1}>{label}</AppText>
                    <AppText variant="small" weight="semibold" style={{ color: COLORS.white }}>{Math.round(progress * 100)}%</AppText>
                </View>
            </View>
        </Modal>
    );
}