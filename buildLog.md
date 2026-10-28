# African Spaces — AI Context & Build Log

> **Read this first if you are an AI assistant picking up this project.**
> It tells you what the app is, how it is built, the rules we follow, what is done, what is shaky, and what comes next.
> Last updated: 2026-10-28.
>
> **How to maintain it (every AI, every session):**
> 1. Add a new entry at the TOP of the "Changelog" section (newest first) for anything that changes architecture, data, design or behaviour.
> 2. If a change makes another section wrong (architecture, conventions, known issues), fix that section too. Do not only append.
> 3. Mark anything you did not verify as **(unverified)**. Never state that something runs or exists in Supabase unless the user confirmed it.
>
> `AFRICAN_SPACES_PROJECT_NOTES` (project notes, last updated 2026-10-10) is an older, deeper reference for auth, RLS and the database. Where it conflicts with this file or with the code, the code wins, then this file.

---

## 1. What we are building

A mobile app (Android first, iOS later) for finding and booking short-stay homes in Kenya, expanding across Africa. Think Airbnb for Africa. The product was called "BnB Kenya", then "African Spaces". The Expo app name/slug is still `budget_lens` and the URL scheme is `budgetlens` (not renamed yet; renaming changes Supabase redirect URLs and the Android package).

- **Guests** browse listings, message hosts, book.
- **Hosts** create a **venture** (a business profile, one per user) that owns many **listings**.
- One person can be both a guest and a host.
- Local context matters: prices in **KES**, places like Roysambu/Kilimani, transport words like matatu/boda, WhatsApp-era trust concerns. Africa-wide country list (54 states).

## 2. Product principles (do not break these)

1. **Guest-first.** The app opens on listings. Anyone signed out can browse. A login prompt appears only when an action needs an account (like, message, book, publish). After login the app **continues the action the person was doing**.
2. **The database is the security boundary, not the app.** The publishable key ships in the app. Row Level Security, column grants and RPCs protect data. App-side checks are UX only.
3. **Keep payloads small.** The feed sends only what a card shows.
4. **Sensitive data is not stored on the phone.** ID number and phone number in the host draft are memory-only (see `partialize` in `ventureFlowStore.ts`). The full ID number is never stored server-side either (last 4 + server-side hash).
5. **Hosts pick places, they do not type them freely** (stops "Nairobi" / "nairobi " becoming different places).
6. **Airbnb is the design reference.** Clean, calm, outlined fields, lots of white, one clear primary action.

## 3. Stack (versions matter)

- Expo SDK **57** (`expo ~57.0.17`), React Native **0.86.3**, React **19.2.3**, `expo-router ~57`, TypeScript 6.
- **AGENTS.md says: read https://docs.expo.dev/versions/v57.0.0/ before writing Expo code.** Expo changed a lot; do not trust older memory.
- NativeWind 4 + Tailwind 3 (`className` works on RN components; `cssInterop(SafeAreaView, …)` is set in the root layout).
- Zustand 5 (+ `persist` with AsyncStorage), react-hook-form 7 + zod 4 (`@hookform/resolvers` 5).
- Supabase (`@supabase/supabase-js` 2.117): Postgres, Auth, Storage, RLS, RPCs.
- Reanimated 4.5 + worklets, gesture-handler, `react-native-sortables` (photo reorder), `react-native-maps` (Google provider), `expo-location`, `expo-image` / `expo-image-picker`, `expo-file-system`, Sentry (`@sentry/react-native`).
- Font: Rubik (Regular/Medium/SemiBold/Bold/…) loaded in the root layout.

## 4. Project layout and path aliases

```
app.config.js              Expo config (app.json is git-ignored; config lives here). Maps key from .env
global.css / tailwind.config.js / babel.config.js / metro.config.js
providers/auth-provider.tsx   Supabase session -> React context + Zustand user cache
lib/                          ROOT lib (older code): supabase.ts, aut-actions.ts (sic), pending-actions.ts,
                              media-url.ts, hooks/{auth-context, use-require-auth, useVentureFlow}
src/
  app/                        expo-router routes
    _layout.tsx               root: fonts, Sentry, AuthProvider, Stack
    (tabs)/                   index (home feed), profile; floating pill tab bar
    (auth)/                   sign-in/sign-up, shown as a ModalSheet over the app
    (venture_and_listings_flow)/   the host "create listing + venture" wizard
    host-setup.tsx            post-publish checklist
  app_state/                  Zustand stores (user_store, listing_store, ventureFlowStore)
  api/                        listings.ts (feed queries) — auth.ts is dead code
  components/                 UI building blocks (+ components/auth/)
  constants/                  schemas (zod), flags, steps, amenities, countries, SQL files
  lib/                        newer code: places.ts, publishListing.ts, host.ts, hostRequirements.ts,
                              draftFiles.ts, otpAuth.ts, text.ts, utils.ts
  styles/                     responsive.ts, typography.ts, colors.ts
old_stuff/                    dead FastAPI-era auth. Ignore.
```

**GOTCHA — two `lib` folders.** `tsconfig` maps `@/*` → `src/*` and `@/lib/*` → `./lib/*` then `./src/lib/*`. So `@/lib/supabase` is the ROOT `lib/supabase.ts`, while `@/lib/places` is `src/lib/places.ts`. When adding a file, put new code in `src/lib/` and check the name does not already exist in root `lib/`.

## 5. Conventions (follow these when writing code)

**Sizing and text**
- Never hard-code sizes. Use `rs()` (horizontal), `rv()` (vertical), `rm()` (moderate) from `@/styles/responsive`.
- Text goes through `<AppText variant="small|body|large|title|heading|display|caption" weight="…">`. Variants live in `styles/typography.ts`. `font-rubik-*` Tailwind classes are **not** defined in `tailwind.config.js` (unverified in practice) — use `AppText`, which sets `fontFamily` in `style`.
- Colours for `color=` props and StyleSheets: `COLORS` in `@/styles/colors`. Brand green is `#064D30` (`dark-green-ascents` / `brand` in Tailwind). Soft green `#EEF5F0`.
- Prefer `style` for sizing and `className` for colours/borders/layout helpers (this is how the existing code reads).

**Forms**
- Fields: `TextField`, `PhoneField`, `SelectField`, `PlaceSearchField` (label inside the box, border green on focus, red on error, 1.5px always so layout never jumps).
- Pattern for each wizard page: `useForm` + `zodResolver`, `mode: "onTouched"`, read the draft **once** with `useRef(store.getState().draft).current`, `useWatch` → `setDraft` on every change, re-`trigger` errors for already-filled fields on mount.
- The same zod schema decides whether the wizard's **Next** button is enabled (`constants/ventureFlowSteps.tsx`). One source of truth.
- Sanitize while typing (`sanitize*` helpers) so bad characters simply do not appear.
- Block phone numbers/links/emails in public text (`hasContactInfo`) — protects the platform fee.

**Modals**
- Any route-based modal that covers most of the screen must use **`ModalSheet`** (`src/components/ModalSheet.tsx`): black backdrop including the status bar, white status-bar icons, grey "peek" strip, rounded white sheet, slide up/down. Register the route with `presentation: "transparentModal"`, `animation: "none"`. (User requirement, copied from Airbnb.)
- Use `useModalSheet().close(after?)` to slide down and then run something.

**Auth-gated actions**
- Wrap with `useRequireAuth()`: `requireAuth(() => doThing())`. Logged out → the action is stored (`lib/pending-actions.ts`) and `/sign-in` opens as the sheet. After login the sheet slides down and **then** the stored action runs. Closing the sheet without logging in clears it.

**Data**
- Reads with filters → a Postgres **view** (`listing_cards`, always `security_invoker = true`). Writes with rules → an **RPC** (`publish_listing`, later `create_booking`).
- Request counters discard stale responses (`api/listings.ts`).
- Stable ids: amenity ids (`constants/amenities.ts`) are saved in the database — never rename one once listings exist.

**Style of code the owner likes**
- Plain-language comments explaining *why*. Small components that own no state (state comes in as props). Short helpers instead of clever abstractions.

## 6. Architecture

### 6.1 Auth
- Source of truth = the **Supabase session**. `providers/auth-provider.tsx` listens to `onAuthStateChange` (kept synchronous on purpose) and fills `AuthContext` (`session`, `isLoading`, `isLoggedIn`) and the persisted Zustand `user` cache. `isLoggedIn` comes from the session, never from Zustand.
- Session storage = `LargeSecureStore` in `lib/supabase.ts`: AES-encrypted session in AsyncStorage, key in SecureStore (SecureStore has a 2048-byte limit).
- Provider name after login: `session.user.app_metadata.provider` (`google`, `apple`, `email`, `phone`); saved as `user.provider`.
- Host status = does a `ventures` row exist for the user (`lib/host.ts` → `refreshHostStatus`, stored as `ventureId`). Never read from `user_metadata` (users can edit it).
- On real sign-out, the venture draft is reset (so the next person on the phone does not see it).

### 6.2 Sign-in sheet (`(auth)/(sign_in_flow)/sign-in.tsx`)
- Layout (Airbnb style): phone **or** email field + Continue → "or" → outlined rows (email/phone switch, Apple, Google). Rows are `AuthOptionRow`; optional label sits on the top border line ("Suggested", "Soon").
- Methods are switched by **`AUTH_METHODS`** in `constants/featureFlags.ts`. Currently only `google: true`. `email`, `phone`, `apple` are visible but show "Soon" and Continue stays off.
- Email and phone use passwordless one-time codes (`src/lib/otpAuth.ts`: `signInWithOtp` + `verifyOtp`; the same call logs in or creates the account). To enable: email → Supabase email template must contain `{{ .Token }}` and OTP length must match `CODE_LENGTH` (6); phone → enable Phone provider + an SMS provider. Then flip the flags.
- Apple: row is a placeholder. Needs Sign in with Apple set up AND code written. (App Store rules generally require it once Google sign-in is offered on iOS.)
- **Suggestions from the host flow:** the sheet reads the host draft. Email prefilled (email mode first because an email code is free, SMS costs money). A Gmail address puts "Continue with Google — as <email>" on top and passes `login_hint`. With a hint the button uses `prompt: "select_account"` so the person can still switch account; with no hint it keeps `prompt: "consent"`.
- OTP users have no name yet (`fullName` undefined). Google users get name/avatar from Google.
- Google flow gotchas: do **not** pass `showInRecents`; parse the redirect URL manually (RN `URL` is unreliable); the redirect URL must exactly match an entry in Supabase Redirect URLs (in Expo Go it contains the LAN IP, which changes). Long-term: development build + `budgetlens://` scheme.

### 6.3 Home feed
- `(tabs)/index.tsx` → `loadListings()/loadMoreListings()` (`api/listings.ts`) → view `listing_cards` → `listing_store` (persists only the first page for instant start). Filters: region, type, min/max price. Guests can read (RLS).
- Decided: one feed in a deliberate order (newest first) + search bar + type chips. Not random, not per-place rows (not enough inventory yet).

### 6.4 Host wizard (`(venture_and_listings_flow)`)
- The flow is defined in ONE file: `constants/ventureFlowSteps.tsx` (`LISTING_STEPS`, `VENTURE_STEPS`, `REVIEW_STEP`, `canProceed` per step). A host who already has a venture only walks `LISTING_STEPS` + review.
- `lib/hooks/useVentureFlow.ts` works out the current step, Next/Back, `?from=review` edit mode, and publishing. The layout reads it; pages never talk to the layout.
- Draft = `app_state/ventureFlowStore.ts` (persisted, **version 3**, bump + migrate when the shape changes). Memory-only fields: `idNumber`, `contactPhone`.
- Order: type → rooms/guests → guest access → map pin → amenities → photos (3–10, drag to reorder, first = cover) → title/description → price (KES/night, 500–200,000) → address → *thank-you* → *about ventures* → legal name → ID → venture name → venture cover (optional) → contact → review → **Finish**.
- Finish → `requireAuth(publish)` → `lib/publishListing.ts`: uploads photos (3 at a time) to bucket `listing-media` at `<uid>/<publishId>/<photoId>.<ext>`, then ONE `supabase.rpc("publish_listing", { p })` that saves everything or nothing. `publishId` is kept in the draft so a retry never creates a second listing.
- After publish → `/host-setup` checklist (account, email confirmed, phone confirmed, ID check). The listing goes live when the steps are done. Requirements come from the ACCOUNT (`lib/hostRequirements.ts`), never from a draft flag.
- Address: country → place search (`PlaceSearchField` → `search_places` RPC over a `places` table, typo tolerant) or "add as new area" (then pick a region). Pin far from the picked place (>25 km) shows a warning, never blocks. Exact address is private until booking; the server rounds public coordinates.

### 6.5 Database (Supabase)
Tables: `profiles`, `ventures` (unique `admin_id`), `listings`, `media` (venture library), `listing_media` (carries `is_cover`), `availability`, `bookings`, `reviews`, `reports`, `conversations`, `messages`, `host_identity` (private; app can only read own status), plus `places` and `host_private` (referenced by code, **definitions not seen**).
RLS is on for every table. SQL in the repo: `src/constants/schemas/database_schemas/{tabels,rls_policies,01_host_identity}.sql`.
**The live database may be ahead of or behind these files.** Functions referenced by the app but not in the repo files I could see: `publish_listing`, `search_places` (and a `supabase/migrations/04_publishing.sql` mentioned in a comment). Ask the user to confirm the real schema before writing SQL that depends on it. Verification queries are in Appendix A of `AFRICAN_SPACES_PROJECT_NOTES`.

## 7. Status

| Area | State |
|---|---|
| Google sign-in (Android emulator) | Works |
| Guest-first gating + continue-after-login | Works (sheet version confirmed by user, 2026-10-28) |
| Sign-in sheet UI, nav bar fix | Done, user confirmed it looks right |
| Email / phone / Apple sign-in | UI + code ready, **off** (flags) |
| Home feed against live DB | Built; seed data had old listing types (see issues) |
| Host wizard UI | Built (all pages) — end-to-end publish against live DB **unverified** |
| ID verification, phone/email confirmation | Not built (checklist shows them) |
| Search page, listing detail, favourites, messaging, bookings, payments, reviews UI | Not started |
| Phone sign-in SMS provider | Not set up |

## 8. Known issues / tech debt

- `(auth)/(onboarding_flow)/sign-up.tsx` is stale: calls the old `signup()` with the wrong arguments and old components. Nothing links to it. Delete or rebuild.
- `src/api/auth.ts` (uses `localStorage`) and `old_stuff/authContext.tsx` are dead.
- `src/components/prep.tsx` is a scratch file with top-level JSX and missing imports; it is not imported but breaks type-checking. Delete it.
- `lib/aut-actions.ts` is misspelled (kept so imports still work). `signup()` there takes no `id_number` any more; `sign-up.tsx` still passes one.
- `AppleSignInButton.tsx` and the old `customButton.tsx` / `customInput.tsx` are mostly unused; `customButton` has implicit-any props.
- **Listing types mismatch:** the wizard saves `room | hotel | house | apartment | guest_house`, the seed data and `listing_store` comments use `bedsitter | studio | one_bedroom …`. `ListingCard` prints the raw `type` and shows `$` instead of KES. Use `describeListing` / `DB_TYPE_LABELS` (`constants/listingTypes.ts`) and fix the price label.
- `tailwind.config.js` is out of sync with `styles/colors.ts`: it lacks `warning`, `danger`, `brand-line`, and `brand-soft` there is `#0A7A4D` while `COLORS.greenSoft` is `#EEF5F0` (code uses `bg-brand-soft` and `bg-warning-soft`). Check how those render. (unverified)
- `lib/draftFiles.ts` has `keepPhoto()` (copies picked photos out of the cache folder) but `addPhotos.tsx` and `ventureCoverPhoto.tsx` do not appear to call it, so drafted photos may be lost if Android clears the cache. (unverified)
- Home screen: card `onPress` is empty, the search bar is not a button yet, filter chips not built, tab bar is `position: absolute` so screens need bottom padding (home uses 160).
- **Font loading with Expo Go**: Custom fonts (Rubik) fail to download via `ExpoAsset.downloadAsync` in Expo Go, causing render errors. Temporary workaround: font loading check commented out in root layout. Proper fix: use development build (`npx expo run:android`) to bundle fonts at build time instead of downloading from Metro at runtime.
- `ASSETS_REFERENCE.md` is stale (`apartment_image_one.jpg` is required by `constants/images.tsx` but not listed).
- Expo app name/slug/scheme still `budget_lens` / `budgetlens`.
- Pre-existing TS complaints: `global.css` module declaration, a few implicit anys.
- Google button uses `prompt: "consent"` when there is no hint, which re-asks consent on every sign-in; `select_account` would be friendlier.

## 9. Roadmap (suggested order)

1. Confirm the live schema and run the publish flow end-to-end once (photos → `publish_listing` → `/host-setup`).
2. Host verification: email confirmation, SMS code, ID check writing `host_identity` via a service-role function; then "go live".
3. Home header: search bar as a button + type chips (`applyListingFilters` already exists).
4. Search page v1 (suggestions from real region/area pairs + a separate search store), then v2 with the places API and distance.
5. Listing detail (photos in `listing_media.position` order, amenities, map, reviews, availability).
6. Favourites table + heart via `requireAuth`; messaging (realtime); bookings via `create_booking` RPC; payments (M-Pesa likely) where `paid` is only set by a backend/webhook.
7. Enable email/phone sign-in (flags), then Apple.
8. Apply the RLS hardening described in the project notes §6.3; review `profiles` policies (it will hold phone/ID/DOB).
9. Development build + `budgetlens://` redirect; rename the app.

## 10. How to work with the owner (for AI assistants)

- The owner is building and **learning**. Explain the why in plain language; avoid dumping code without context.
- **Deliver code as real files** (create the file and present it), not pasted in chat. Always state the exact destination path in the project, and whether it replaces or adds a file.
- You usually cannot run the app. Say what you did not test, and ask for an emulator screenshot when UI is involved.
- Do not claim the database has something unless the user confirmed it. When unsure, give a SQL check query first.
- Check the Expo SDK 57 docs before using an Expo API.
- Cover-the-screen modals: always `ModalSheet` (black top, white status-bar icons).
- Keep responsive sizing (`rs/rv/rm`), `AppText`, `COLORS`, and the field components. Do not introduce a second styling approach.
- When a change touches architecture, data or design, update this file in the same session.

---

## 11. Changelog (newest first)

### 2026-10-28 — Tailwind setup, SafeAreaView fix, tab bar fixes, review card styling
- **Tailwind config created**: Added `tailwind.config.js` with correct content paths (`src/**`, `lib/**`, `providers/**`) and `nativewind/preset`. This was missing, causing all Tailwind classes to be ignored.
- **SafeAreaView cssInterop**: Registered SafeAreaView from `react-native-safe-area-context` in root layout with `cssInterop(SafeAreaView, { className: "style" })` so className works throughout the app.
- **Tabs layout**: Replaced SafeAreaView with plain View using inline `style={{ flex: 1, backgroundColor: "white" }}` in `(tabs)/_layout.tsx` (SafeAreaView was collapsing without a definite parent height). Added `sceneStyle: { backgroundColor: "white" }` to override React Navigation's default gray background.
- **Tab bar positioning**: Fixed icons/labels being pushed off-centre by removing `mt-12` and `min-h-full`, adding `flex-1` to TabBarIcon, and using fixed width (70px) with `numberOfLines={1}` on labels. Added `left: 0, right: 0` to tabBarStyle for proper centering with margin.
- **Home screen padding**: Added `useSafeAreaInsets()` and set `paddingTop: insets.top, paddingBottom: 160` on FlatList contentContainerStyle to clear the floating tab bar (now that screens no longer sit in SafeAreaView).
- **Review card styling**: Changed "What happens next" card in `reviewAndPublish.tsx` from dark green (`bg-brand-soft`) to light gray (`bg-gray-50`) with subtle border, lighter circles, and muted green accents to match the softer design reference.
- **Font loading issue**: Encountered `ExpoAsset.downloadAsync` error with custom fonts in Expo Go. Temporarily commented out font loading check to test app. Long-term fix requires development build (`npx expo run:android`) to bundle fonts at build time.

### 2026-10-28 — Sign-in sheet, nav bar, build log
- **Nav bar** (`(tabs)/_layout.tsx`): icons/labels were pushed off-centre by `flex-1` and the default safe-area padding. Now a floating pill (`bottom = insets.bottom + 12`, zero padding, centred items). "Profile" label colour fixed.
- **`ModalSheet`** (new, `src/components/ModalSheet.tsx`): Airbnb-style sheet with black top + white status-bar icons + slide animation, back button slides down. Root layout registers `(auth)` as `transparentModal` with `animation: "none"`.
- **`(auth)/_layout.tsx`**: `AuthGate` closes the sheet after login and THEN runs the pending action (replaced a 300 ms timeout guess). Closing without login clears the pending action. Nested `(sign_in_flow)` and `(onboarding_flow)` layouts reduced to `<Slot />`.
- **Sign-in screen rewritten** (Airbnb layout, app icon removed). New: `AuthOptionRow`, `OtpCodeInput`, `src/lib/otpAuth.ts`, `AUTH_METHODS` flags, `loginHint` support in `GoogleSignInButton` (now draws itself with `AuthOptionRow`; `styles` prop ignored). Option labels ("Suggested", "Soon") render on the top border line.
- **Host-flow suggestions:** sign-in reads the host draft (`contactEmail`, `contactPhone`) to prefill and to suggest Google for Gmail addresses.
- **Decision:** email-first suggestion over SMS (email codes are free; SMS costs per message). Social first overall.
- **Decision:** with a Google hint use `prompt: "select_account"` so the person can switch accounts.
- Added this file and pointed `AGENTS.md` at it.

### Before 2026-10-28 (reconstructed from code and the 2026-10-10 project notes; no exact dates)
- Replaced the FastAPI/axios auth with Supabase auth (session provider, encrypted session storage, Google OAuth working on the emulator).
- Guest-first browsing with `useRequireAuth` + `pending-actions`.
- Database schema, RLS policies, `listing_cards` view, seed data (70 listings), Zustand listings store + API with paging, filters and stale-response protection.
- Host wizard: type, basics, guest access, map pin (`LocationPickerModal`), amenities, photos (sortable), title/description, price, address with places search, thank-you, venture explainer, legal name, ID, venture name/cover, contacts, review, publish via `publish_listing`, `/host-setup` checklist. Draft is persisted (version 3) with sensitive fields memory-only.
- `host_identity` table SQL (private, read-only from the app).