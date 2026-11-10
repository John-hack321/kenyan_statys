import { Dimensions } from "react-native";

// Design in dp on a ~390 wide phone (iPhone 14 / most modern Androids).
// Android and iOS already normalise physical size into dp, so we only nudge sizes a little:
// the factor is clamped, so a small phone never gets cramped and a big phone never gets huge.
// Portrait only (app.config.js: orientation "portrait"), so reading the size once is fine.
const BASE_WIDTH = 390;
const MIN_FACTOR = 0.9;
const MAX_FACTOR = 1.15;

const { width, height } = Dimensions.get("window");
const shortSide = Math.min(width, height);
const factor = Math.min(Math.max(shortSide / BASE_WIDTH, MIN_FACTOR), MAX_FACTOR);

// horizontal sizes, paddings, icon sizes
export const rs = (size: number) => Math.round(size * factor);

// vertical spacing. DEPRECATED alias of rs: scaling by window HEIGHT made spacing differ between
// gesture-nav / 3-button Android and iOS. Kept so existing imports keep working. Do not use it for font sizes.
export const rv = rs;

// text sizes and anything that should grow only a little. factor 0 = no scaling, 1 = same as rs.
export const rm = (size: number, moderateFactor = 0.5) =>
    Math.round(size + (size * factor - size) * moderateFactor);