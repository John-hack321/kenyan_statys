# Tells: the signatures of generic, AI-made mobile UI (and what to do instead)

Append-only catalogue. Numbering never changes, so reviews can cite "T7". Idea of a tells catalogue and grep checklist is borrowed from the public draftbit/mobile-taste-skill project (MIT); the entries below are written for this app.

A tell is not always a bug. It is a signal that nobody *decided* the thing. Fix by making a deliberate choice that fits `DESIGN.md`.

## Contents
- Catalogue (T1 to T24)
- Grep checklist (runnable)
- Scoring the AI-slop score

---

## Catalogue

**Visual**
- **T1 Indigo/purple gradient hero.** Not our palette. Use white + `COLORS.green`.
- **T2 Everything is a white rounded card in a stack.** Cards inside cards, shadow on everything. Use spacing and borders; one level of card at most.
- **T3 Shadow soup.** Heavy `shadow-lg` on lists. Only the floating tab bar and sheets float.
- **T4 Emoji as icons or in UI copy.** Use Ionicons outline.
- **T5 Random accent colours** (orange badge here, pink there). Only `green` family, `warning`, `danger`, and the rating `star`.
- **T6 Glassmorphism/blur for its own sake.** Costs frames on low-end Android and adds nothing.
- **T7 Gradient overlays on every image.** Only where text sits on a photo and needs contrast (the featured card).
- **T8 Centered everything.** Left-align reading text; centre only status panels, empty states and thank-you pages.

**Layout and hierarchy**
- **T9 Two "primary" buttons on one screen.** One filled green action; others outline or text.
- **T10 Title, subtitle, caption, helper and a callout all competing.** One title, one sentence of help, at most one callout.
- **T11 Giant hero + tiny content.** Content first. The welcome page's image is the one allowed hero.
- **T12 Five-tab bar with a floating "+" FAB.** Our tabs: guest Home, Profile; host Hosting, Listings, Bookings, Profile. No FAB.
- **T13 Settings-style lists for everything.** Use the pattern that fits (choice cards, counters, forms).

**Copy**
- **T14 "Welcome back, John! 👋"** / exclamation marks / marketing voice. Plain, calm, local.
- **T15 Lorem-style filler or fake stats.** Never invent ratings, counts or guest names in shipped UI.
- **T16 Technical error text** ("Network request failed", raw Supabase messages). Use `friendlyAuthError`-style human text.
- **T17 Promising what is not built** ("Instant payouts"). Use the "Soon" badge pattern or leave it out.
- **T18 Title Case On Every Button.** Sentence case.

**Behaviour and craft**
- **T19 Spinner as the only loading design** on content areas. Prefer skeleton or at least a stable layout; always offer retry.
- **T20 Layout jumps.** Border width changing on select, content pushing down on error. Constant borders; reserve space.
- **T21 Fixed widths/heights on text** (clips at larger font scale). Flex + `numberOfLines`.
- **T22 Invented tokens.** A new hex, a new radius, a 13.5 px font. Use `DESIGN.md` tokens.
- **T23 A second pattern for something solved** (new button component, new modal, `Pressable` in one screen and `TouchableOpacity` in the next). Reuse; if truly needed, record why.
- **T24 Interactive things without semantics.** No role, no label, no state.

---

## Grep checklist (run from the repo root; each line is advisory, read before acting)

Findings in files you are not touching are reported, not fixed, unless the owner asks for a pass.

```bash
# T22 raw hex in screens/components (COLORS and tokens live in styles/colors.ts)
grep -rnE "#[0-9A-Fa-f]{6}\b" src --include=*.tsx | grep -v "styles/colors.ts"

# raw <Text> in new-style code (should be AppText)
grep -rn "<Text" src --include=*.tsx | grep -v "AppText"

# T21/T22 fixed font sizes not using rm()
grep -rnE "fontSize:\s*[0-9]" src --include=*.tsx | grep -v "rm(" | grep -v "rs(" 

# T24 touchables without accessibilityRole (list files, then open them)
grep -rLn "accessibilityRole" $(grep -rl "TouchableOpacity" src --include=*.tsx)

# small targets: heights/widths of 36 or smaller on touchables (check hitSlop nearby)
grep -rnE "(height|width):\s*rm\((2[0-9]|3[0-6])\)" src --include=*.tsx

# contrast: gray-400 or COLORS.faint used for text
grep -rnE "text-gray-(300|400)|COLORS\.faint" src --include=*.tsx

# T4 emoji in UI strings (rough: any non-ASCII symbol in JSX text)
grep -rnP "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src --include=*.tsx

# currency: dollar or bare KES instead of KSh
grep -rnE "\\$\{item\.price|>\s*\\$|KES \{" src --include=*.tsx

# T23 second pattern: Pressable vs TouchableOpacity
grep -rlE "Pressable" src --include=*.tsx

# motion without reduced-motion handling
grep -rlE "entering=|FadeIn|withTiming|withDelay" src --include=*.tsx | xargs grep -L "useReducedMotion"

# states: lists with no empty/error handling
grep -rlE "<FlatList" src --include=*.tsx | xargs grep -L "ListEmptyComponent"

# images: RN Image used where expo-image is the standard
grep -rnE "import \{[^}]*\bImage\b[^}]*\} from \"react-native\"" src --include=*.tsx
```

On Windows, run in Git Bash or WSL; the `-P` emoji check needs GNU grep.

---

## Scoring the AI-slop score

Count distinct tells found in the reviewed scope (each T-number counts once, however many times it appears):

| Tells found | AI-slop score | Meaning |
|---|---|---|
| 0 to 2 | **A** | Deliberate and consistent |
| 3 to 5 | **B** | Mostly deliberate; a few defaults |
| 6 to 9 | **C** | Noticeably generic in places |
| 10+ | **D** | Reads as machine-made |

Report the score *and* the list, because the list is what gets fixed.