# Platform rules (industry standards, mapped to African Spaces)

Distilled in our own words from Apple's Human Interface Guidelines, Material Design 3, WCAG 2.2 and common usability heuristics. Use as a checklist, not a lecture. Where this file and `DESIGN.md` disagree, `DESIGN.md` wins (it records project decisions). Always check the current Expo SDK 57 docs before using an Expo API.

## Contents
1. Touch and input
2. Contrast, colour, type
3. Accessibility semantics (React Native)
4. Navigation and back
5. Forms
6. States and feedback
7. Motion and haptics
8. Lists, images, performance (low-end Android, slow data)
9. Permissions and privacy
10. Platform differences that matter here

---

## 1. Touch and input

- Minimum target: **48 × 48 dp** (Material), never under **44 × 44 pt** (Apple). A 36 px icon button needs `hitSlop` of at least 6 on each side to reach 48.
- Leave about 8 dp between adjacent targets so a thumb does not hit the neighbour.
- Primary actions sit where the thumb reaches (bottom). The wizard footer already does this.
- Visible press feedback within 100 ms (`TouchableOpacity` `activeOpacity` 0.7 to 0.85 in this app).
- Do not rely on long-press or hover alone. If a gesture exists (drag to reorder photos), offer a visible alternative (the "Photo options" menu does).
- Disable a button only if the reason is obvious; otherwise keep it enabled and explain on press. (Wizard "Next" greys out because the missing thing is visible on the page. Keep that rule: only grey out when the cause is on screen.)

## 2. Contrast, colour, type

- Text contrast **4.5:1**; large text (about 18pt regular or 14pt bold) and UI component outlines **3:1** (WCAG 1.4.3, 1.4.11).
- Brand green `#064D30` on white and white on green both pass comfortably. `#6B7280` on white passes (about 4.8:1). `#9CA3AF` on white does not (about 2.5:1): placeholders and disabled only.
- Never use colour alone to carry meaning (WCAG 1.4.1): errors get an icon + words, selected gets a fill/border change + a check or radio dot.
- Do not use pure-colour text on tinted panels without checking: `warning` text on `warningSoft` passes; do not invent new pairs without measuring.
- Body text at least 15; nothing meaningful below 13 (caption 11 is for counters and fine print only).
- Keep line length comfortable: one idea per line on phones, no justified text.
- Support system text scaling: layouts flex, text wraps or truncates deliberately (`numberOfLines` + `ellipsizeMode`), fixed heights on text containers are a red flag. The app caps scale at 1.2 (project decision); new work must not clip at 1.2.

## 3. Accessibility semantics (React Native)

- Every `TouchableOpacity` gets `accessibilityRole` (`button`, `radio`, `checkbox`, `link`...).
- Icon-only buttons get `accessibilityLabel` that says the action ("Close map"), not the icon.
- State goes in `accessibilityState` (`selected`, `checked`, `disabled`, `busy`). Existing components do this well; copy `AmenityChip`, `ChoiceCard`.
- Group related radio cards in a container with `accessibilityRole="radiogroup"` (done in `guestAccessChoice`).
- Inputs: `accessibilityLabel` equals the visible label; errors are visible text next to the field.
- Decorative icons next to text are fine without labels; do not make them focusable.
- Images that carry meaning get an alt/label; cover photos in cards get "Photo of <listing title>".
- Announce important async results (publish done, code sent) with visible text, not only a toast.
- Test with TalkBack (Android) and VoiceOver (iOS) once per new flow. **State plainly when this was not done.**

## 4. Navigation and back

- Android back button/gesture must never trap the user or lose work silently. Wizard drafts are saved as you type, which makes back safe; keep it that way.
- iOS users expect edge-swipe back. Flows that use `router.replace` give that up, so the on-screen Back must always be present and obvious.
- Modals and sheets: a visible close control, and system back closes them. `ModalSheet` handles `beforeRemove`.
- Do not stack more than one covering modal over another.
- Tab bar: at most 5 items; labels always visible (they are); icon + label.
- Deep link and signed-out states: a guest sees a path forward, never a dead end ("You're browsing as a guest").
- Confirm destructive actions with a plain-language alert and a clearly different button label ("Discard" in destructive style).

## 5. Forms

- Visible label always (floating label counts once it floats); placeholder is an example, never the only label.
- Right keyboard for the data: `email-address`, `number-pad`, `phone-pad`; `autoComplete`/`textContentType` for name, email, one-time codes (`sms-otp`).
- Validate on blur (`onTouched`), not on every keystroke; re-validate on change after the first error. Never show an error on an untouched field.
- Errors: next to the field, in words, say how to fix ("Use at least 8 characters"). Do not clear the user's input on error.
- Prevent errors: sanitise as they type (`sanitize*` helpers), sensible defaults (country KE, ID type National ID), disabled Next only when the reason is visible.
- Chain fields with `returnKeyType="next"` and `onSubmitEditing`; last field `done`.
- Long forms are split one idea per page, with a progress bar and a safe way out (Save and exit).
- Ask for sensitive data late and explain why in one sentence (ID page does this).
- Allow paste into every field (OTP especially).

## 6. States and feedback

Every async surface has four states: **loading, empty, error, success**.

- Loading: skeleton or spinner within 300 ms; long operations show real progress (`PublishingOverlay`).
- Empty: say why and what to do next; one action if possible.
- Error: what happened in human words, how to retry, keeps existing content visible (the listings store does this).
- Success: confirm visibly (checkmark panel, confetti once), then move on automatically or offer the next step.
- Offline or slow: never leave an infinite spinner; time out into a retry state. (Verification polling stops at 90 s: good example.)
- Optimistic UI only for cheap, reversible actions (like). Never for money, verification or publishing.

## 7. Motion and haptics

- Motion explains change (a sheet slides from where it came from, a field label floats). Decorative motion is rare and short.
- Durations: micro feedback 100 to 200 ms, transitions 200 to 350 ms, never above 500 ms except one-off celebration.
- Animate transform and opacity on the UI thread (Reanimated, `useNativeDriver`). Animating `top`/`width` is acceptable only for tiny elements (the app does this in `FloatingLabel`, `PublishingOverlay`).
- "Reduce motion" is an operating-system setting some people turn on (motion sickness, vestibular conditions, or just preference). It does not mean "no animation". Keep spinners, progress bars, simple fades and motion that directly follows the user's finger or scroll. Skip purely decorative motion (confetti, staggered entrances) and soften big automatic movement (parallax, zoom, bounce) for those users.
- Scroll-linked effects (collapsing headers, a profile photo that shrinks to a corner as you scroll) are welcome. Drive them with a Reanimated scroll handler so they run on the UI thread, clamp the interpolation, and keep a simple fallback (header that just snaps) for reduce-motion users.
- Haptics: not installed as a direct dependency. Do not add one for cosmetics.

## 8. Lists, images, performance (low-end Android, slow data)

- `FlatList` with a stable `keyExtractor`, `initialNumToRender` modest, `getItemLayout` when row height is fixed, `onEndReachedThreshold` about 0.5. Do not render long lists inside a `ScrollView`.
- Images: `expo-image` with `contentFit`, a placeholder colour or blur, correct size (cards do not need 2000 px), lazy below the fold.
- Avoid inline object/array/function props on list items when the list is large; memoise rows if profiling shows re-renders.
- Select only the Zustand fields a component needs (`useStore((s) => s.items)`), not the whole store.
- Heavy work off the render path; no synchronous crypto or JSON parsing of big payloads on tap.
- Keep bundle weight in mind: do not add a library for one small thing.
- Test on the smallest screen you support (about 360 × 640 dp) and with 1.2 font scale.

## 9. Permissions and privacy

- Ask at the moment of need with a one-sentence reason shown before the system prompt when it helps (the location picker asks "Are you at your place right now?" first: good).
- Handle denial gracefully with a working alternative (drag the map instead).
- Never log or persist ID numbers, card data, tokens or full phone numbers (see `AGENTS.md`).
- Show privacy reassurance where data is sensitive (green callout pattern), and be accurate. Do not claim "secure" or "private" unless it is true in the code.

## 10. Platform differences that matter here

| Topic | Android | iOS |
|---|---|---|
| Target size | 48 dp | 44 pt |
| Navigation | System back always active | Edge swipe back; no hardware back |
| Tab bar | Floating pill is ok; keep above the gesture bar (`insets.bottom + 12`) | Same |
| Dialogs | Material-style `Alert` | Native alert sheet |
| Status bar | Dark icons on white (`StatusBar style="dark"`), light on black sheets | Same |
| Selection feedback | Ripple welcome | Opacity |
| Fonts | Rubik loaded in-app, same both | Same |

Native-feel rule of thumb: **look the same, behave natively.**