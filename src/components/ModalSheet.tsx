import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, View, useWindowDimensions } from "react-native";
import { useNavigation, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type SheetApi = {
    // Slides the sheet down, closes the screen, then runs `after` (if given).
    close: (after?: () => void) => void;
};

const SheetContext = createContext<SheetApi>({ close: () => {} });
export const useModalSheet = () => useContext(SheetContext);

type Props = {
    children: ReactNode;
    onClosed?: () => void; // called when the sheet closed WITHOUT an `after` action (user backed out)
    // "full" (default): tall sheet on a black backdrop with a grey strip above it. Used by sign-in.
    // "compact": the page stays visible but dimmed (status bar included), and the sheet is only as tall as its
    //            content, anchored to the bottom. Tap the dimmed area to close. Used by the phone / email code sheet.
    variant?: "full" | "compact";
};

// True while the on-screen keyboard is up. A compact sheet drops its bottom safe-area padding then,
// because the keyboard already covers that strip (otherwise a gap shows between the sheet and the keyboard).
function useKeyboardVisible() {
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setVisible(true));
        const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setVisible(false));
        return () => { show.remove(); hide.remove(); };
    }, []);
    return visible;
}

// Airbnb-style sheet: black backdrop (status bar included) with white status bar icons,
// a small grey strip peeking above a rounded white sheet that slides up and down.
// Register the route as presentation "transparentModal" with animation "none" (see root _layout).
// Use it for ANY route-based modal. variant="full" covers most of the screen, variant="compact" is a short bottom sheet.
export default function ModalSheet({ children, onClosed, variant = "full" }: Props) {
    const router = useRouter();
    const navigation = useNavigation();
    const insets = useSafeAreaInsets();
    const { height } = useWindowDimensions();
    const keyboardVisible = useKeyboardVisible();

    const progress = useRef(new Animated.Value(0)).current; // 0 = hidden, 1 = shown
    const closing = useRef(false);
    const onClosedRef = useRef(onClosed);
    onClosedRef.current = onClosed;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: 1,
            duration: 320,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [progress]);

    const close = useCallback(
        (after?: () => void) => {
            if (closing.current) return;
            closing.current = true;
            Animated.timing(progress, {
                toValue: 0,
                duration: 240,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start(() => {
                if (router.canDismiss()) router.dismiss();
                else router.replace("/"); // opened directly, nothing underneath
                if (after) setTimeout(after, 50); // let the screen leave before the action navigates
                else onClosedRef.current?.();
            });
        },
        [progress, router]
    );

    // Android back button / back gesture: slide down instead of vanishing
    useEffect(() => {
        return navigation.addListener("beforeRemove", (e) => {
            if (closing.current) return;
            e.preventDefault();
            close();
        });
    }, [navigation, close]);

    const api = useMemo(() => ({ close }), [close]);
    const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [height, 0] });

    if (variant === "compact") {
        return (
            <SheetContext.Provider value={api}>
                <View style={StyleSheet.absoluteFill}>
                    <StatusBar style="light" />

                    {/* the page underneath, dimmed. The status bar area is dimmed too (route uses statusBarTranslucent). Tap to close. */}
                    <Animated.View
                        style={[StyleSheet.absoluteFill, { backgroundColor: "#000", opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.6] }) }]}
                    >
                        <Pressable
                            style={StyleSheet.absoluteFill}
                            onPress={() => close()}
                            accessibilityRole="button"
                            accessibilityLabel="Close"
                        />
                    </Animated.View>

                    {/* iOS: padding lifts the sheet above the keyboard. Android: the window itself resizes (same as the full sheet). */}
                    <KeyboardAvoidingView
                        pointerEvents="box-none"
                        style={{ flex: 1, justifyContent: "flex-end" }}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        <Animated.View
                            style={{
                                flexShrink: 1, // on a small screen with the keyboard open the sheet gives way and its body scrolls
                                maxHeight: height - insets.top - 24,
                                backgroundColor: "#fff",
                                borderTopLeftRadius: 16,
                                borderTopRightRadius: 16,
                                overflow: "hidden",
                                paddingBottom: keyboardVisible ? 0 : insets.bottom,
                                transform: [{ translateY }],
                            }}
                        >
                            {children}
                        </Animated.View>
                    </KeyboardAvoidingView>
                </View>
            </SheetContext.Provider>
        );
    }

    return (
        <SheetContext.Provider value={api}>
            <View style={StyleSheet.absoluteFill}>
                <StatusBar style="light" />

                {/* black backdrop, also under the status bar */}
                <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: "#000", opacity: progress }]} />

                {/* the strip of "previous page" peeking above the sheet */}
                <Animated.View
                    pointerEvents="none"
                    style={{
                        position: "absolute",
                        top: insets.top + 6,
                        left: 16,
                        right: 16,
                        height: 28,
                        borderTopLeftRadius: 14,
                        borderTopRightRadius: 14,
                        backgroundColor: "#3A3A3C",
                        opacity: progress,
                    }}
                />

                <Animated.View
                    style={{
                        position: "absolute",
                        top: insets.top + 18,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "#fff",
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                        overflow: "hidden",
                        transform: [{ translateY }],
                    }}
                >
                    <KeyboardAvoidingView
                        style={{ flex: 1, paddingBottom: insets.bottom }}
                        behavior={Platform.OS === "ios" ? "padding" : undefined}
                    >
                        {children}
                    </KeyboardAvoidingView>
                </Animated.View>
            </View>
        </SheetContext.Provider>
    );
}