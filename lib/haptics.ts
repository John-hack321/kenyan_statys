import * as Haptics from "expo-haptics";

// Tiny physical feedback for taps, like the little buzz in Airbnb or Coinbase. Rules (DESIGN.md section 5):
//   * only for real state changes: a toggle, a selection, a step, a finished action. Not for every tap.
//   * never awaited and never allowed to throw: some phones have no vibration motor, so errors are swallowed.
// REQUIRES:  npx expo install expo-haptics   (then rebuild the dev build: it is a native module)
export const HAPTICS_ENABLED = true;

const run = (fn: () => Promise<void>) => {
    if (!HAPTICS_ENABLED) return;
    fn().catch(() => {});
};

export const haptics = {
    /** a normal button was pressed (Next, Continue) */
    tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
    /** something was picked or toggled (chip, card, counter step, tab) */
    select: () => run(() => Haptics.selectionAsync()),
    /** a big thing worked (listing published, code accepted) */
    success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
    /** something failed (wrong code) */
    error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
