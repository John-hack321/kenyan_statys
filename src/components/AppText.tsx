import { Text, TextProps } from "react-native";
import { COLORS } from "@/styles/colors";
import { rm } from "@/styles/responsive";
import { FONT_BY_WEIGHT, TEXT_SCALE_PROPS, TEXT_VARIANTS, TextVariant, TextWeight } from "@/styles/typography";

type Props = TextProps & {
    variant?: TextVariant;
    weight?: TextWeight;   // optional: overrides the weight the variant comes with
    className?: string;    // colours etc, e.g. className="text-white"
};

// Titles, headings and display text are drawn in near-black ink so they stand out from the softer grey body text.
const INK_VARIANTS: TextVariant[] = ["title", "heading", "display"];

// True when the caller already chose a colour ("text-white", "text-gray-500", "text-dark-green-ascents"...).
// Size and alignment classes ("text-xs", "text-center") are not colours.
const NOT_A_COLOUR = /^(left|right|center|justify|start|end|xs|sm|base|lg|xl|[2-9]xl|ellipsis|clip|wrap|nowrap|balance|pretty)$/;
const hasColourClass = (className?: string) =>
    !!className && className.split(/\s+/).some((c) => c.startsWith("text-") && !NOT_A_COLOUR.test(c.slice(5)));

// <AppText variant="small">..</AppText>   <AppText variant="title" weight="bold" className="text-white">..</AppText>
// ALWAYS use this instead of a raw <Text>: it guarantees the bundled Rubik font (not the phone's system font)
// and the font scaling rule from styles/typography.ts (FONT_SCALING_ENABLED). Raw <Text> with "font-rubik-*"
// classes silently falls back to the system font, which is what clipped the ratings and prices.
export default function AppText({ variant = "body", weight, style, className, ...rest }: Props) {
    const v = TEXT_VARIANTS[variant];
    // ink goes in `style` BEFORE the caller's style, and only when no colour class was given,
    // so className="text-white" and style={{ color }} from the caller always still win.
    const ink = INK_VARIANTS.includes(variant) && !hasColourClass(className) ? { color: COLORS.ink } : null;
    return (
        <Text
            {...TEXT_SCALE_PROPS}
            {...rest}
            className={`text-black-300 ${className ?? ""}`}
            style={[
                { fontSize: rm(v.size), lineHeight: rm(v.line), fontFamily: FONT_BY_WEIGHT[weight ?? v.weight] },
                ink,
                style,
            ]}
        />
    );
}