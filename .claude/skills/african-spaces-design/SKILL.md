---
name: african-spaces-design
description: Design and build UI for the African Spaces app (Expo 57 + React Native + NativeWind) so it looks calm, trustworthy and consistent, follows iOS HIG / Material 3 / WCAG 2.2 standards, and fits what the project already has. Use this skill whenever the user asks to build, add, change, polish or "make nicer" ANY screen, page, component, modal, form, list, card, empty state, button, layout, spacing, colour, copy or animation in this repo, including host wizard pages, verification pages, the home feed, the profile tab and the sign-in sheet, even if they never say "design". Also use before writing any new component, to check whether one already exists.
---

# African Spaces design (build)

You are designing for a Kenyan short-stay marketplace used mostly on mid-range Android phones over mobile data. The look is **calm, trustworthy, Airbnb-like**: white space, one green accent, outlined fields, one primary action per screen, plain language.

This skill makes new UI **fit the app that exists**. It does not replace the project's rules. Precedence: **existing code > `DESIGN.md` > this skill > generic design advice.** `AGENTS.md` rules always apply (deliver files with exact paths, say what you did not run, update the logs, check Expo SDK 57 docs, never add a second styling or form pattern without recording why).

## Step 0: Read, then commit (do not skip)

1. Read `DESIGN.md` (tokens, component inventory, patterns, hard floors, local context, known deviations). It is short on purpose.
2. Write the **App Read** for the task in 3 lines, in your reply before any code:
   - *What is this screen for, for whom* (guest or host, first-time or returning)
   - *The one primary action*
   - *Which pattern from `DESIGN.md` section 4 it is* (wizard page, form page, status page, feed card, sheet...)
3. The three dials come from `DESIGN.md` section 1 (Expression 4, Motion 5, Density 4). Do not change them on your own.
4. **Search before you build.** Open the file for the most similar existing screen and copy its shape. Check `DESIGN.md` section 3 for a component that already solves the need.

## Step 1: Pick the pattern and load only what you need

| Task | Read |
|---|---|
| Any new screen or component | `.claude/skills/_shared/references/screen-patterns.md` |
| Anything touching accessibility, forms, navigation, motion, lists, images, permissions | `.claude/skills/_shared/references/platform-rules.md` (read the relevant section only) |
| Unsure whether something looks generic | `.claude/skills/_shared/references/tells.md` |
| Polishing an existing screen | also read the file you are changing, fully, first |

## Step 2: Build (project rules in short)

- **Text:** always `AppText` with a `variant` from the type scale. No raw `<Text>` in new code.
- **Sizes:** `rs()` horizontal, `rv()` vertical, `rm()` sizes and icons. No raw layout numbers.
- **Colour:** `COLORS` from `@/styles/colors` for `color=` props and StyleSheets; Tailwind classes for text/background/border (`text-gray-500`, `bg-white`, `border-gray-200`, `bg-dark-green-ascents`, `rounded-2xl`). Do not invent hex values. If a token is missing, propose adding it to `COLORS` and `tailwind.config.js` together, and log it.
- **Layout:** page gutter `rs(20)`; header block = one `title` + one-sentence `small` subtitle in `text-gray-500`; sections separated by `rv(14)` to `rv(16)`.
- **Buttons:** `TouchableOpacity` with `activeOpacity` 0.8 to 0.85, `accessibilityRole="button"`, height `rm(48)` to `rm(52)`, radius `rm(12)`; one filled green primary per screen.
- **Fields:** `TextField` / `PhoneField` / `SelectField` / `PlaceSearchField` only. Pattern: `useForm` + `zodResolver`, `mode: "onTouched"`, read the draft once with `useRef(store.getState().draft).current`, `useWatch` → `setDraft`, sanitise while typing, same zod schema decides whether Next is enabled.
- **Icons:** Ionicons outline, `rm(14)` to `rm(24)`; filled only for selected or status.
- **Covering modals:** `ModalSheet` (route registered as `transparentModal`, `animation: "none"`).
- **Auth-gated actions:** `useRequireAuth()`.
- **New code location:** `src/lib/` for logic (not root `lib/`), `src/components/` for UI.
- **Do not touch the database or SQL** from a design task. If the design needs data that does not exist, say so and stop at the UI, per `DATABASE.md`.

## Step 3: Hard floors (check every screen before handing over)

These are `DESIGN.md` section 5. In short:
1. Targets at least 44 dp effective (48 for primary controls); use `hitSlop` to reach it.
2. Text 4.5:1, UI outlines 3:1; never `text-gray-400` / `COLORS.faint` for meaningful text.
3. Never colour alone: pair with icon or words.
4. Every interactive element has role, label (icon-only), state.
5. Four states wherever data loads: loading, empty, error with retry, success.
6. New animation respects reduced motion; UI thread; nothing delays a task.
7. Keyboard-safe: focused field visible, correct `keyboardType`, Next/Done wired.
8. Safe areas handled; bottom padding where the floating tab bar covers scroll content.
9. No sensitive data in logs, disk drafts or error text.
10. Survives font scale 1.2 and a 360 dp wide screen without clipping.

## Step 4: Platform and context

- **One design, native behaviour.** Same look on iOS and Android; adapt back handling, pickers, permission wording and keyboard only (`DESIGN.md` 6b).
- **Kenya context:** KSh via `formatKes()`; light images, `expo-image`, lists paginated; place names picked not typed; plain, short, local copy; reassure on money/ID/address screens in one honest sentence.
- **Copy:** sentence case, verb-first buttons, errors say what to do, no emoji, no unbuilt promises ("Soon" badge pattern instead).

## Step 5: Self-check against the tells

Before delivering, scan `tells.md` T1 to T24 mentally, and for non-trivial work run the grep checklist on the files you changed. Fix what you introduced. Do not "fix" unrelated old files unless asked; list them instead.

## Step 6: Deliver and keep the logs true

- Deliver **real files** with the exact destination path, and say whether each **replaces** or **adds**.
- Say **what you did not run or verify** (device, TalkBack/VoiceOver, small screen, font scale). Use the words VERIFIED / UNVERIFIED / NOT RUN as in `DATABASE.md`.
- If you added a pattern or component, add it to `DESIGN.md` sections 3 or 4. If you fixed a known deviation, remove it from section 9. If you made a design decision, add a row to section 7.
- Add a new entry at the **top** of `buildLog.md`'s changelog (newest first) saying what changed and which AI did it. If the change makes another section wrong, fix that section too.
- Keep replies in plain language; the owner is learning. Explain *why* a choice was made in one or two sentences, not a lecture.

## When the request conflicts with the standards

If the owner asks for something that breaks a hard floor (for example tiny grey text), do not silently comply or silently refuse. Say in one sentence which standard it breaks and why it matters for real users, then offer the closest version that works. If they still want it, do it and note the deviation in `DESIGN.md` section 9.

## Out of scope

Navigation restructuring (adding tabs, new route groups) needs the owner's approval and a `buildLog.md` note (`AGENTS.md`: never add a new tab/route group without recording why). Brand redesigns, new colours and dial changes also need approval.