import { Platform, RefreshControl, RefreshControlProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { haptics } from "@/lib/haptics";
import { COLORS } from "@/styles/colors";

type Props = Omit<RefreshControlProps, "onRefresh" | "refreshing"> & {
    refreshing: boolean;
    onRefresh: () => void;
};

// THE one pull-to-refresh for every scrolling screen. Pass it as the list's refreshControl prop:
//   <FlatList refreshControl={<AppRefreshControl refreshing={isRefreshing} onRefresh={reload} />} ... />
//   <ScrollView refreshControl={...}>
// It is the phone's NATIVE control (smooth on every device, no extra JavaScript work per frame), so it looks
// like the platform: the bouncy iOS pull and the Material circle on Android. We only brand it:
// green spinner, white circle, a light buzz when the refresh starts, and the app name under the spinner on iOS.
// A custom animated "African Spaces" in the pulled-down gap was considered and rejected (DESIGN.md section 7).
export default function AppRefreshControl({ refreshing, onRefresh, ...rest }: Props) {
    const insets = useSafeAreaInsets();
    return (
        <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
                haptics.tap();
                onRefresh();
            }}
            colors={[COLORS.green]}                       // Android spinner colour
            progressBackgroundColor={COLORS.white}        // Android circle
            progressViewOffset={insets.top}               // Android: stay below the status bar (edge-to-edge)
            tintColor={COLORS.green}                      // iOS spinner colour
            title={Platform.OS === "ios" ? "African Spaces" : undefined}   // iOS only: small text under the spinner
            titleColor={COLORS.muted}
            {...rest}
        />
    );
}