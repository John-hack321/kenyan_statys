# DESIGN.md — African Spaces design source of truth

> **Every AI (Claude chat, Claude Code, Devin/Windsurf) reads this before touching any screen, component or style.**
> It records what the app already looks like and the rules that keep new work consistent. It is written from reading the code, not from running the app, so anything marked **(unverified)** needs a look on a device.
> Last updated: 2026-11-07 (Devin, local AI). Related: `AGENTS.md` (rules), `buildLog.md` (history), `.claude/skills/african-spaces-design*` (the skills that apply this file).
>
> **Precedence when things disagree:** the code that exists > this file > the design skills > generic design advice.
> New design rules go HERE (one place), then get logged in `buildLog.md`. Do not scatter style decisions across other files.

---

## 1. The App Read (commitments, do not drift)

| Question | Answer |
|---|---|
| What is it | Short-stay home marketplace for Kenya, expanding across Africa. Guests browse and book; hosts list through a venture profile. |
| Who uses it | Kenyan guests and hosts, mostly on mid-range and low-end Android phones, often on mobile data. Some on iPhone later. Many hosts are first-time listers, so the host flow must teach as it goes. |
| Vibe | **Calm, trustworthy, Airbnb-quality (a quality bar, not a template: learn from its hierarchy and restraint, do not copy its screens).** Lots of white, one clear primary action per screen, outlined fields, quiet green accent. Warm, plain language. Never flashy. |
| Platform posture | **One design for both platforms**, adapted only where the platform expects it (back behaviour, permission prompts, pickers, keyboard). Android first. |
| Theme | **Light only** for now (see 9, deviation 11). |

### The three dials (fixed defaults, 1 to 10)

| Dial | Value | Meaning here |
|---|---|---|
| `DESIGN_EXPRESSION` | **4** | Restrained. Brand shows through green accents, soft green panels and good type, not decoration. |
| `MOTION_INTENSITY` | **5** | Purposeful motion is welcome: spinners and progress bars, entrance fades, sheet slides, floating labels, and **scroll-linked effects such as a collapsing profile header** (avatar shrinks and tucks beside the name on scroll, grows back on scroll up; see pattern 11 in `screen-patterns.md`). Celebration allowed (Confetti on completion). Motion must run smoothly on low-end Android, never delay a task, and be simplified for users who turn on "reduce motion" (see section 5.6). |
| `VISUAL_DENSITY` | **4** | Airy. One idea per wizard page. Dense only in lists and the feed. |

Change a dial only with the owner's say-so, and log it.

---

## 2. Tokens (use these, do not invent new ones)

### Colour (source: `src/styles/colors.ts`; Tailwind mirrors some in `tailwind.config.js`)

| Token (`COLORS.*`) | Hex | Use |
|---|---|---|
| `green` | `#064D30` | Primary actions, selected states, links, active icons. Tailwind: `dark-green-ascents` / `brand` / `primary-300` |
| `greenSoft` | `#EEF5F0` | Calm info panels, selected card background, icon bubbles |
| `greenLine` | `#B8E8CD` | Progress fill on dark, soft dividers inside green panels |
| `ink` | `#111111` | Icons and strong text on white |
| `muted` | `#6B7280` | Secondary text and icons (passes 4.5:1 on white) |
| `faint` | `#9CA3AF` | Placeholders, disabled icons ONLY. **Never meaningful text** (about 2.5:1 on white, fails) |
| `border` | `#D1D5DB` | Outlines |
| `danger` / `dangerSoft` | `#B3261E` / `#FEF2F2` | Errors (always with an icon and words, never colour alone) |
| `warning` / `warningSoft` | `#B45309` / `#FFFBEB` | Cautions, "still needed" |
| `star` | `#FDA01E` | Rating star only |
| `white` | `#FFFFFF` | Surfaces, text on green |

`AppText` default colour is Tailwind `text-black-300` (`#5D5F6D`). Body text uses it; override with `className="text-black"` or `COLORS.ink` where a title needs more weight (see 9, deviation 8).

### Type (source: `src/styles/typography.ts`, font Rubik)

| Variant | Size / line | Default weight | Use |
|---|---|---|---|
| `caption` | 11 / 16 | regular | Counters, fine print, badges |
| `small` | 13 / 18 | regular | Subtitles under page titles, helper text, labels |
| `body` | 15 / 22 | regular | Default reading text |
| `large` | 17 / 24 | medium | Buttons, row titles, section titles |
| `title` | 20 / 28 | semibold | Page title (one per screen) |
| `heading` | 26 / 34 | bold | Hero moments (thank-you page, Profile title) |
| `display` | 32 / 40 | bold | Rare: big initials and numbers |

All sizes go through `rm()`. Always `AppText`, never a raw `<Text>` in new code.

### Text rendering (the rules that stop text from breaking)

1. **Always `AppText`.** Never a raw `<Text>` in UI. A raw `<Text className="font-rubik-bold">` falls back to the phone's system font (those classes do not exist in `tailwind.config.js`), whose width differs from what the layout measured. That is what clipped "5.0", "KSh 4,500", "+254" and "See all" on the first phone test.
2. **Font scaling is OFF app-wide for now** (interim, section 7; planned to be turned on at about 1.3 after testing). One switch: `FONT_SCALING_ENABLED` in `src/styles/typography.ts`. `AppText` applies it; a raw `<TextInput>` must spread `{...TEXT_SCALE_PROPS}` (all current inputs do). Do not use `Text.defaultProps` (does nothing in React 19).
3. **Text never decides a box's size from outside.** Rows: `flex: 1` on the text and `numberOfLines`; things that must stay whole (price, rating, dial code, "See all") get `flexShrink: 0` or `minWidth`. Boxes that hold text use `minHeight` + padding, never a fixed `height`.
4. **Sizes come from `TEXT_VARIANTS`.** Never `rv()` or `rs()` for a font size, never `fontSize` by hand.
5. **Test the layout with Android "Display size" at its largest** and a 360 dp phone (that still changes dp even with font scaling off), and with Bold text on.

### Space, shape, size

- Sizing helpers (`src/styles/responsive.ts`): design in dp on a ~390 wide phone. `rs()` and `rm()` multiply by a factor taken from the phone's SHORT side and clamped to 0.9 to 1.15 (so no phone gets cramped or huge); `rm()` moves only half as far. **`rv()` is a deprecated alias of `rs()`** (scaling by window height made spacing differ between gesture-nav Android, 3-button Android and iOS). Use `rs` horizontally, `rm` for icon, control and text-adjacent sizes; old `rv(...)` calls keep working, do not add new ones. Never raw numbers for layout in new code. Prefer `flex`, `%` and `minHeight` over fixed pixel sizes.
- **Page gutter:** `paddingHorizontal: rs(20)` (`rs(24)` on the welcome page).
- **Page header block:** `paddingTop: rv(20)`, `paddingBottom: rv(8)`; title `AppText variant="title"`; subtitle `variant="small" className="text-gray-500"` with `marginTop: rv(4)`.
- **Vertical rhythm:** `gap: rv(14)` inside forms, `rv(16)` between page sections, `rv(10)` to `rv(12)` between list rows.
- **Radii:** cards and panels `rounded-2xl` (16); buttons and inputs `rm(12)` / `rounded-xl`; chips, avatars, icon bubbles `rounded-full`.
- **Borders:** inputs `1.5px` (never changes width on focus, only colour); cards `border border-gray-200`.
- **Control heights:** primary button `rm(48)` to `rm(52)`; chip `minHeight: rm(44)`; field row about `rv(14)` padding + text.
- **Icons:** Ionicons, outline style (`*-outline`), `rm(14)` to `rm(24)`; filled only for selected or status (`checkmark-circle`, `star`, `heart`).
- **Shadows:** almost none. Separation comes from borders and white space. Floating tab bar and sheets are the exceptions.

---

## 3. Component inventory (search here BEFORE building anything)

| Need | Use | File |
|---|---|---|
| Any text | `AppText` | `src/components/AppText.tsx` |
| Single-line / multiline input (floating label) | `TextField` | `TextField.tsx` |
| Phone with country code | `PhoneField` | `PhoneField.tsx` |
| Pick from a fixed list | `SelectField` | `SelectField.tsx` |
| Pick a place (typo tolerant) | `PlaceSearchField` | `PlaceSearchField.tsx` |
| Pick one, wide card | `ChoiceCard` | `ChoiceCard.tsx` |
| Pick many, pill | `AmenityChip` | `AmenityChip.tsx` |
| Tap-to-fill suggestion pill | `SuggestionChip` | `SuggestionChip.tsx` |
| Number stepper row | `CounterRow` | `CounterRow.tsx` |
| One-time code | `OtpCodeInput` | `OtpCodeInput.tsx` |
| Outlined "Continue with…" row | `AuthOptionRow` | `AuthOptionRow.tsx` |
| Covering modal (sign-in etc.) | `ModalSheet` | `ModalSheet.tsx` |
| Pull to refresh on any scrolling screen | `AppRefreshControl` as the list's `refreshControl` prop | `AppRefreshControl.tsx` (native control, branded) |
| Physical feedback (buzz on toggles, picks, steps, finished actions, failures) | `haptics.tap/select/success/error` | `src/lib/haptics.ts` (needs `npx expo install expo-haptics`) |
| Loading placeholder (never a bare spinner for a list) | `Skeleton`, `ListingCardSkeleton`, `FeaturedCardSkeleton`, `FeedSkeleton` | `Skeleton.tsx` (respects Reduce motion) |
| Verification page shell | `VerificationScreen` + `StatusPanel` + `PrimaryButton`/`SecondaryButton` | `components/verification/` |
| Wizard footer buttons | `NextPageButton`, `BackButton`, `SaveAndExitButton`, `DiscardButton`, `FlowProgressBar` | `ventureFlowButtons.tsx` |
| Full-screen progress | `PublishingOverlay` | `PublishingOverlay.tsx` |
| Celebration | `Confetti` | `Confetti.tsx` |
| Venture card preview | `VentureCardPreview` | `VentureCardPreview.tsx` |
| Host tab shell / gate / setup nudge | `HostPlaceholder`, `HostOnly`, `FinishSetupCard` | `components/host/` |
| Floating label primitive | `FloatingLabel` | `FloatingLabel.tsx` |
| Text-only button | `TextButton` | `TextButton.tsx` |
| Scroll-linked effects (collapsing header) | Reanimated hooks (pattern in `screen-patterns.md` section 11) | Build per pattern, not a component |

**Legacy, do not use in new code:** `customButton.tsx`, `customInput.tsx`, `AppleSignInButton.tsx` (unwired), `search.tsx` (to be rebuilt as a button, see roadmap), `prep.tsx` (scratch).

If nothing fits: first try composing existing parts. If you must add a component, follow the conventions in 4, add it to this table, and log it.

---

## 4. Patterns (the shapes screens take)

Canonical code for each is in `.claude/skills/_shared/references/screen-patterns.md`. Names here:

1. **Wizard page**: header block, one form or choice group, nothing else. Footer (Back / Next) belongs to the layout, not the page.
2. **Choice page**: `ChoiceCard` list (pick one) or `AmenityChip` groups (pick many). Selected = green fill or soft-green card with a 2px green border; unselected = white with grey border. Border width constant so layout never jumps.
3. **Form page**: `TextField`s in a `ScrollView` with `keyboardShouldPersistTaps="handled"`, `keyboardDismissMode="on-drag"`. Errors show after the field is left (`mode: "onTouched"`), never on an untouched field.
4. **Callout**: `bg-[#EEF5F0] rounded-2xl`, padding `rs(14)`, small icon in green, `variant="small"` text. For reassurance ("Guests never see your ID"), not for errors.
5. **Banner (warning/error)**: soft-tinted background, icon + words, never colour alone.
6. **Empty state**: dashed grey border, `rounded-2xl`, centred icon + title + one sentence + (if possible) one action.
7. **Status panel**: big round icon bubble, title, one sentence (`StatusPanel`). One state at a time.
8. **Sheet**: `ModalSheet` for anything covering most of the screen.
9. **Feed card**: image first, then type/area, price, rating. (Currently below standard, see 9.)
10. **Bottom action bar**: top border, white, primary button right, secondary left.
11. **Collapsing header**: scroll-linked avatar transformation (centre to left gutter, scale down) as in pattern 11 of `screen-patterns.md`. Use for Profile tab and venture page. Animate only transform/opacity, clamp the range, keep 44 dp+ targets, provide snap fallback for reduce-motion users.

---

## 5. Hard floors (never break; the review skill treats these as P0/P1)

1. **Touch targets:** at least **48 × 48 dp visible or reachable** for primary controls; never below **44** effective (use `hitSlop` to reach it). Sources: Material 3 (48dp), Apple HIG (44pt).
2. **Contrast:** text 4.5:1, large text and UI outlines 3:1 (WCAG 2.2 AA). No `text-gray-400` / `COLORS.faint` for meaningful text.
3. **Colour is never the only signal:** errors, selection and status always pair colour with an icon or words.
4. **Accessibility metadata on every interactive element:** `accessibilityRole`, a label for icon-only controls, `accessibilityState` for selected/disabled/busy.
5. **Four states for anything that loads:** loading, empty, error (with a way to retry), success.
6. **Motion is welcome, and stays smooth and optional.** Animate on the UI thread (Reanimated), never block input. For users who switch on the system "reduce motion" setting, skip purely decorative motion (confetti, staggered entrances) and soften big movement (parallax, zoom). Spinners, progress bars, simple fades and motion that directly follows the user's finger or scroll can stay. See `platform-rules.md` section 7 for details.
7. **Keyboard-safe forms:** the focused field is never hidden; Next/Done keys wired; numeric fields use the right `keyboardType`.
8. **Safe areas** respected top and bottom (the floating tab bar means scroll screens need bottom padding, currently 160).
9. **No sensitive data in logs, drafts on disk, or error text** (ID number, phone are memory-only; see `AGENTS.md`).
10. **Text never breaks:** follow "Text rendering" in section 2. Font scaling is off, so the stress tests are Android Display size at maximum, a 360 dp phone and Bold text; prefer `flex: 1` + `numberOfLines` over fixed widths, `minHeight` over `height`.

---

## 6. Local context (this is what makes it ours)

- **Currency:** display as **KSh 2,500** using `formatKes()` (`constants/schemas/price.ts`). Never `$`. (Proposed 2026-11-07; the price page already does this, `ListingCard` does not yet.)
- **Network:** assume slow, expensive mobile data. Small images (`expo-image`, `contentFit="cover"`, placeholder while loading), paginate, cache the first page (already done), never block a screen on a non-essential request.
- **Devices:** design and test on a small, mid-range Android first. Avoid heavy blur, large Lottie, or shadows on long lists.
- **Language:** plain English now; copy kept short so Swahili can be added later. Avoid idioms and jokes. Use local words where guests use them (matatu, boda, estate, bedsitter, Naivas).
- **Trust is the product:** verification, private address until booking, in-app messaging only. Screens that touch money, ID or addresses explain *why* in one calm sentence.
- **Phones:** numbers entered without the leading zero (`cleanPhoneDigits`), stored as E.164 (`toE164`).
- **Names of places:** hosts pick from a list; never free-text for region/area.

### Copy rules

- Sentence case. Verb-first buttons ("Continue", "Save and exit", "Send code").
- One sentence of help under a title, not a paragraph.
- Errors say what to do, not what went wrong technically ("Check your connection and try again").
- No emoji in UI text, no exclamation spam, no "Welcome back, John 👋" patterns.
- Never promise what is not built (use the existing "Soon" badge pattern).

---

## 6b. Platform posture (what differs, what does not)

Same visual design on iOS and Android. Adapt only these:

| Topic | Android | iOS |
|---|---|---|
| Back | System back button/gesture must always do something sensible; wizard uses its own Back. | Edge-swipe back is lost when we use `router.replace`; the on-screen Back must always exist. |
| Pickers / dialogs | Material look from RN is fine. | Date picker is a `spinner`; keep native. |
| Permissions | Ask in context with a plain reason; image picker needs no permission on Android. | Purpose strings in `app.config.js` are shown to users; keep them honest and specific. |
| Keyboard | Default resize behaviour. | `KeyboardAvoidingView` (already in `ModalSheet`). |
| Feedback | Ripple is welcome. | Opacity press (`TouchableOpacity`) is the norm. |

---

## 7. Decisions (append-only; newest first)

| Date | Decision | Why | Who |
|---|---|---|---|
| 2026-11-07 | **Phone font scaling is ignored for now (`FONT_SCALING_ENABLED = false`). INTERIM, Claude's call, not an owner decision.** One switch in `styles/typography.ts`; `AppText` and every `TextInput` read it. Plan: after the new build passes the phone test, flip it to `true` with `MAX_FONT_SCALE` about 1.3, because apps like Airbnb and Coinbase support system text size and users who need large text lose out otherwise. | The clipping may be caused by the system-font fallback (now fixed by AppText) rather than by scaling, and nobody has tested yet; off is the safe default until that is known. Accessibility cost: people with a large system font get no larger text while it is off. | Claude (chat) |
| 2026-11-07 | **Feed card hierarchy: photo, then two text lines only** ("Apartment in Kasarani" / "KSh 2,100 per night · ★ 4.5"); price always says "per night"; the heart stays visible on the photo (future wishlist) and is saved on the phone only until the wishlist table exists. | Owner feedback comparing with Airbnb: ours was busier (3 text lines, bold price, separate rating). The earlier 3-line shape came from the design notes and is replaced. | Owner feedback, Claude (chat) |
| 2026-11-07 | **Black stays out of the buttons.** One filled-button colour (brand green) for primary actions; near-black (`ink`) is for text, icons and outlined secondary buttons; a black fill only for the Sign in with Apple button (Apple's rules). The guest profile "Sign in" is green. | One primary colour keeps a clear single action per screen. Easy to flip if the owner wants a black neutral button back. | Claude (chat), owner said either is fine |
| 2026-11-07 | **One pull-to-refresh: `AppRefreshControl` (native `RefreshControl`, branded).** A custom "African Spaces" wordmark in a pulled-down gap was NOT built (deferred, not impossible). | iOS opens that gap for free (scroll bounce); on Android it must be built by hand: a Reanimated + Gesture Handler pull gesture that moves the content down while the list is at the top and shares touches with the list's own scroll. Doable, but fiddly to get smooth on low-end phones, which is the audience. How X or Airbnb do it on Android was NOT checked; an earlier version of this note claimed they use the native control, which was unverified. Revisit if the owner wants it; test on a real low-end phone first. On iOS the app name already shows as the control's title. | Claude (chat), asked by owner to decide |
| 2026-11-07 | **Sizing rewritten:** clamped short-side scale (0.9 to 1.15, base 390); `rv` aliased to `rs`; `rm` really uses its factor. | Height-based scaling made spacing differ across Android nav modes and iOS; the old 350x680 base inflated everything about 18% on a 412 dp phone. Sizes now look about 8 to 10% smaller there. | Claude (chat) |
| 2026-11-07 | **Light-only UI:** `userInterfaceStyle: "light"` in `app.config.js` (needs a new dev build). | Every screen is light; "automatic" could turn system dialogs and keyboards dark. | Claude (chat) |
| 2026-11-07 | Feed cards rebuilt to the section 7 target: KSh, `expo-image` + placeholder, no shadow, heart drawn only when a screen passes `onToggleFavourite`; home screen shows loading, empty, error + retry, refresh, load-more; search field loses its dead filter icon until filters exist. | Closes deviations 1, 6, 7, 9, 10, 11 below. | Claude (chat) |
| 2026-11-07 | **Motion dial raised from 3 to 5.** Collapsing/scroll-linked headers (WhatsApp-style profile photo) and similar purposeful motion are welcome. | Owner said they like this kind of animation. | Owner, recorded by Claude (chat) |
| 2026-11-07 | **Keep `TouchableOpacity`** for new buttons for now; do not mix in `Pressable` in the same screen. May migrate later as one deliberate change. | `AGENTS.md`: no second pattern without a recorded reason. Consistency beats the small ripple benefit. | Claude (chat), proposed |
| 2026-11-07 | Display currency as **KSh**. | Kenyan convention, matches the price page. | Claude (chat), proposed |
| 2026-11-07 | This file, `.claude/skills/african-spaces-design`, `…-review` and `_shared/references/` created. | Make design quality repeatable across AIs. | Claude (chat) |
| 2026-11-04 | ~~Font scaling capped at 1.2 via `Text.defaultProps`.~~ **Superseded 2026-11-07.** `defaultProps` does nothing on function components in React 19 (believed from the React 19 release notes; not tested on device), so the cap was likely never applied. | Text clipped on a phone with large system text. | Local coding AI |
| earlier | Airbnb is the visual reference; fields are outlined with floating labels; one primary action; modals use `ModalSheet`. | Product principles in `buildLog.md` section 2. | Owner |

Open question, closed 2026-11-07: scaling is off (see the first row). Revisit when the layouts have been tested at 1.2; accessibility guidance expects scaling up to 200%.

---

## 8. Dated, version-sensitive facts (verify against Expo SDK 57 docs before relying)

- Expo SDK 57, React Native 0.86.3, React 19.2.3, Reanimated 4.5.1, NativeWind 4.2.6 / Tailwind 3.4.
- `app.config.js`: `userInterfaceStyle: "light"` (changed 2026-11-07, needs a native rebuild), `predictiveBackGestureEnabled: false`, edge-to-edge behaviour **(unverified)**.
- `Text.defaultProps` is ignored on function components in React 19, so font-scaling props are set per component **(believed; confirm in the React 19 upgrade notes)**.
- Reanimated's reduced-motion handling for entering animations in 4.5 **(unverified; check docs)**.

---

## 9. Known deviations from this file (found by reading the code, 2026-11-07; NOT run on a device)

Fix when you touch the file anyway, or as a dedicated pass. Do not mass-edit across the app unasked.

| # | Where | Deviation | Rule |
|---|---|---|---|
| 2 | `welcomePage.tsx` caption, `listingFlowGratitude.tsx` "1/3" | `text-gray-400` on white for meaningful text | 5.2 contrast |
| 3 | `Confetti.tsx`, `FadeInDown` pages | No reduced-motion check | 5.6 |
| 4 | Many files | Inline hex (`"#111"`, `"#6B7280"`, `GREEN` consts) instead of `COLORS` | 2 tokens |
| 5 | `tailwind.config.js` vs `colors.ts` | Missing `warning`, `danger`, `brand-line`; `brand-soft` is `#0A7A4D` in Tailwind but `#EEF5F0` in `COLORS` | 2 tokens (already in `buildLog.md` section 8) |
| 12 | Wizard (`router.replace`) | No iOS swipe-back; Android back behaviour not verified | 6b |
| 13 | `sign-up.tsx`, `PhoneInput.tsx`, `customInput.tsx`, `customButton.tsx`, `AppleSignInButton.tsx`, `prep.tsx` | Dead files with raw `<Text>`, `rv` font sizes; delete them | 2, text rendering |
| 14 | Small visual targets: wizard `BackButton`, `StepButton` in `CounterRow` (36), `SaveAndExit`/`Discard` (40 + hitSlop) | Reach 44 only through `hitSlop` | 5.1 |

Closed on 2026-11-07 (NOT run on a device): #1 (hitSlop), #6 (cards), #7 (search), #9 (home states), #8 (`AppText` titles/headings now use ink, unless the caller passes a colour class or style), #10 (profile guest view and sign-out), #11 (`userInterfaceStyle`).

---

## 10. Last design review

| Date | Scope | Design Score | AI-slop Score | Notes |
|---|---|---|---|---|
| (none yet) | | | | Run the `african-spaces-design-review` skill on the host wizard first, then the feed. |