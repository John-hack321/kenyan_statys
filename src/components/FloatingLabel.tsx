import { useEffect, useRef } from "react";
import { Animated, Easing } from "react-native";
import { rm, rs } from "@/styles/responsive";
import { FONT_BY_WEIGHT } from "@/styles/typography";

type Props = {
    text: string;
    floated: boolean;       // true = small, sitting on the top border. false = big, where the placeholder would be
    color: string;
    background: string;     // must match the box background: that is what "cuts" the border line behind the text
    restingTop: number;     // where the big label sits inside the box (matches the input's top padding)
};

// The label of a text field. Empty and not focused: it is big, inside the box, like a placeholder.
// Focused or filled: it shrinks and slides up onto the border line. Used by TextField and SelectField.
// (top and fontSize can't use the native driver, which is fine for a 140 ms animation on one small label.)
export default function FloatingLabel({ text, floated, color, background, restingTop }: Props) {
    const progress = useRef(new Animated.Value(floated ? 1 : 0)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: floated ? 1 : 0,
            duration: 140,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
        }).start();
    }, [floated, progress]);

    const top = progress.interpolate({ inputRange: [0, 1], outputRange: [restingTop, -rm(9)] });
    const fontSize = progress.interpolate({ inputRange: [0, 1], outputRange: [rm(15), rm(12)] });

    return (
        <Animated.Text
            numberOfLines={1}
            style={{
                position: "absolute",
                left: rs(10),
                top,
                fontSize,
                color,
                backgroundColor: background,
                paddingHorizontal: rs(4),
                fontFamily: FONT_BY_WEIGHT.regular,
                pointerEvents: "none",
            }}
        >
            {text}
        </Animated.Text>
    );
}