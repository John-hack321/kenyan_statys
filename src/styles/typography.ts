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