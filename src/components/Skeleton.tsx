import { useEffect } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Animated, {
    useAnimatedStyle,
    useReducedMotion,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { rm, rs } from "@/styles/responsive";

// A grey block that gently pulses while real content is loading. It holds the SAME space the content will
// take, so the screen does not jump when the data arrives (this is what Airbnb-style apps do instead of a spinner).
// With "Reduce motion" turned on in the phone settings it stays still.
export function Skeleton({ style }: { style?: StyleProp<ViewStyle> }) {
    const reduceMotion = useReducedMotion();
    const opacity = useSharedValue(1);

    useEffect(() => {
        if (reduceMotion) {
            opacity.value = 1;
            return;
        }
        opacity.value = withRepeat(
            withSequence(withTiming(0.55, { duration: 800 }), withTiming(1, { duration: 800 })),
            -1
        );
    }, [reduceMotion, opacity]);

    const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
    return <Animated.View style={[{ backgroundColor: "#E5E7EB", borderRadius: rm(8) }, style, animated]} />;
}

// Same layout as <ListingCard> (4:3 photo, three text lines).
export const ListingCardSkeleton = () => (
    <View style={{ flex: 1, marginTop: rm(16) }}>
        <Skeleton style={{ aspectRatio: 4 / 3, width: "100%", borderRadius: rm(16) }} />
        <View style={{ marginTop: rm(10), gap: rm(8) }}>
            <Skeleton style={{ height: rm(14), width: "70%" }} />
            <Skeleton style={{ height: rm(12), width: "90%" }} />
            <Skeleton style={{ height: rm(14), width: "50%" }} />
        </View>
    </View>
);

// Same size as <FeaturedCard>.
export const FeaturedCardSkeleton = () => (
    <Skeleton style={{ width: rm(210), height: rm(250), borderRadius: rm(16) }} />
);

// Six placeholder cards in the home feed's two-column grid, announced to screen readers as one "loading" item.
export const FeedSkeleton = () => (
    <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Loading listings"
        importantForAccessibility="yes"
        style={{ flexDirection: "row", flexWrap: "wrap", gap: rs(16), paddingHorizontal: rs(20) }}
    >
        {Array.from({ length: 6 }).map((_, i) => (
            <View key={i} style={{ flexBasis: "47%", flexGrow: 1 }}>
                <ListingCardSkeleton />
            </View>
        ))}
    </View>
);