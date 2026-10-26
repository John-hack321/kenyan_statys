import { useEffect, useMemo } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from "react-native-reanimated";

const COLORS = ["#064D30", "#B8E8CD", "#F3D9A7", "#FDA01E", "#111111"];

type PieceProps = { x: number; size: number; color: string; delay: number; duration: number; drift: number; spin: number; fall: number };

function Piece({ x, size, color, delay, duration, drift, spin, fall }: PieceProps) {
    const t = useSharedValue(0);

    useEffect(() => {
        t.value = withDelay(delay, withTiming(1, { duration, easing: Easing.in(Easing.quad) }));
    }, [t, delay, duration]);

    const style = useAnimatedStyle(() => ({
        opacity: t.value === 0 ? 0 : 1 - Math.max(0, t.value - 0.75) * 4,   // fades out near the bottom
        transform: [{ translateY: -30 + t.value * fall }, { translateX: drift * t.value }, { rotate: `${spin * t.value}deg` }],
    }));

    return (
        <Animated.View
            style={[{ position: "absolute", top: 0, left: x, width: size, height: size * 1.6, borderRadius: 2, backgroundColor: color }, style]}
        />
    );
}

// Pieces of paper fall once when the page opens. Pure Reanimated, no extra package.
// It sits on top of the page but never blocks a tap.
export default function Confetti({ count = 40 }: { count?: number }) {
    const { width, height } = useWindowDimensions();

    const pieces = useMemo(
        () =>
            Array.from({ length: count }, () => ({
                x: Math.random() * width,
                size: 6 + Math.random() * 6,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
                delay: Math.random() * 700,
                duration: 2200 + Math.random() * 1600,
                drift: (Math.random() - 0.5) * 120,
                spin: (Math.random() - 0.5) * 900,
                fall: height * (0.7 + Math.random() * 0.3),
            })),
        [count, width, height]
    );

    return (
        <View style={[StyleSheet.absoluteFill, { pointerEvents: "none" }]}>
            {pieces.map((p, i) => <Piece key={i} {...p} />)}
        </View>
    );
}
