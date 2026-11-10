// Reusable text sizes. Sizes go through rm() so they scale with the device.
// Use them through <AppText variant="small" /> instead of repeating fontSize everywhere.
export const TEXT_VARIANTS = {
    caption: { size: 11, line: 16, weight: "regular" },
    small:   { size: 13, line: 18, weight: "regular" },
    body:    { size: 15, line: 22, weight: "regular" },
    large:   { size: 17, line: 24, weight: "medium" },
    title:   { size: 20, line: 28, weight: "semibold" },
    heading: { size: 26, line: 34, weight: "bold" },
    display: { size: 32, line: 40, weight: "bold" },
} as const;

export type TextVariant = keyof typeof TEXT_VARIANTS;
export type TextWeight = "regular" | "medium" | "semibold" | "bold";

// these names match the fonts loaded in src/app/_layout.tsx
export const FONT_BY_WEIGHT: Record<TextWeight, string> = {
    regular: "Rubik-Regular",
    medium: "Rubik-Medium",
    semibold: "Rubik-SemiBold",
    bold: "Rubik-Bold",
};
// ---------- font scaling: ONE switch for the whole app ----------
// Owner decision (2026-11-07): the app's look must never break, so the phone's "Font size" setting is IGNORED.
// Sizes come only from TEXT_VARIANTS. To bring accessibility scaling back later, set this to true:
// text then grows up to MAX_FONT_SCALE and every layout must still survive it (see DESIGN.md section 5.10).
// Text.defaultProps cannot do this job in React 19, so every Text / TextInput gets these props explicitly:
// AppText does it itself, a raw <TextInput> spreads {...TEXT_SCALE_PROPS}.
export const FONT_SCALING_ENABLED = false;
export const MAX_FONT_SCALE = 1.2;

export const TEXT_SCALE_PROPS = {
    allowFontScaling: FONT_SCALING_ENABLED,
    maxFontSizeMultiplier: MAX_FONT_SCALE,
} as const;