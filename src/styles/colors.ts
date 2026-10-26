// Colours for places that cannot use a className (icon `color=`, ActivityIndicator, StyleSheet).
// Keep in sync with tailwind.config.js, which holds the same palette for classNames
// (brand, brand-soft, brand-line, danger, warning, black-100..300, grey-100, primary-100..300).
export const COLORS = {
    green: "#064D30",
    greenSoft: "#EEF5F0",
    greenLine: "#B8E8CD",
    ink: "#111111",
    muted: "#6B7280",
    faint: "#9CA3AF",
    border: "#D1D5DB",
    danger: "#B3261E",
    dangerSoft: "#FEF2F2",
    warning: "#B45309",
    warningSoft: "#FFFBEB",
    star: "#FDA01E",
    white: "#FFFFFF",
} as const;
