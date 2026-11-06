# African Spaces — AI Context & Build Log

> **Read this first if you are an AI assistant picking up this project.**
> It tells you what the app is, how it is built, the rules we follow, what is done, what is shaky, and what comes next.
> Last updated: 2026-11-05.
>
> **How to maintain it (every AI, every session):**
> 1. Add a new entry at the TOP of the "Changelog" section (newest first) for anything that changes architecture, data, design or behaviour.
> 2. If a change makes another section wrong (architecture, conventions, known issues), fix that section too. Do not only append.
> 3. Mark anything you did not verify as **(unverified)**. Never state that something runs or exists in Supabase unless the user confirmed it.
>
> **Related files (read in this order):** `AGENTS.md` (rules every AI must follow), this file, **`DATABASE.md` (strict Supabase/SQL rules, what really exists in the database, migration log)**, `HOST_GUEST_PLAN.md` (host vs guest app structure).
> `AFRICAN_SPACES_PROJECT_NOTES` (project notes, last updated 2026-10-10) is an older, deeper reference for auth, RLS and the database. Where it conflicts with this file, `DATABASE.md` or the code, the code wins, then these files. For anything about the database, `DATABASE.md` is the source of truth.
>
> **Several AIs work on this repo** (Claude in the chat/project, and a local coding AI, Devin/Windsurf, in the editor). Each one only sees its own changes, so log what you did here, and say which AI did it.

---

## Changelog

### 2026-11-05: Host verification with Didit (KYC), Supabase Edge Functions, verification flow screens
**Done in the Claude chat. Written, deployed and partly checked, NOT yet run end to end** (the first trial on a phone, from an EAS dev build, was starting when this was written).

**Decisions (and why)**
- **Vendor: Didit**, because of its free tier (500 free checks per month for each of ID verification, passive liveness, face match and device/IP) and a hosted native SDK. Smile ID stays the upgrade path (better Kenyan registry coverage, pricing only through sales). Vendor is kept swappable: the vendor call lives in ONE Edge Function.
- **Workflow (Didit console, sandbox):** ID Verification + passive Liveness + Face Match + Device & IP. **AML screening OFF** (extra cost, no known obligation for hosting; ask a lawyer later). No custom style ($0.20, not worth it). Callback URL left empty (the native SDK has no browser redirect). "Allow vendor sessions without API key" stays OFF.
- **Hosts only at launch.** The first listing stays hidden until the host is verified; verification is done once, later listings need no new check. **Guests are not checked at signup** (guest-first principle, and the free tier would be eaten by people who never book). Plan: check guests at their first booking request, later.
- **Native SDK with a server-created session token**, NOT `startVerificationWithWorkflow` (that one lets the app choose `vendorData` and needs the "without API key" switch, so anyone could create sessions on our bill or attach a verification to another user).
- **Registry check (Kenya IPRS lookup) is NOT built.** Didit prices it at about $3.15 per successful query. Decision: run it only when a host first asks for a payout, or when a risk flag appears (duplicate ID, name mismatch). Money controls matter more than the check: platform holds the guest's payment until after check-in, payouts only to an M-Pesa/bank account whose registered name matches the verified legal name.
- No check is cheat-proof. The goal is to make scamming costly and traceable.

**Built (all NOT RUN)**
- `supabase/functions/start-host-verification/index.ts` (Function A): checks the login token, requires a confirmed email, refuses hosts already verified or in review, 30 s cooldown, creates the Didit session with `vendor_data = user id`, stores `session_id` in `host_identity.provider_reference`, returns ONLY the short-lived `session_token`.
- `supabase/functions/didit-webhook/index.ts` (Function B): the ONLY writer of `host_identity.status`. Checks timestamp (5 min) and the `X-Signature` HMAC over the raw bytes, finds the row by session id, maps Didit status → ours (`Approved`→ extra checks → `verified`; `Declined/Abandoned/Expired`→`failed`; `In Review/Resubmitted`→`needs_review`). On approval it compares the document's last 4 digits with what the host typed and stores a keyed hash (`id_fingerprint`, UNIQUE, so one ID cannot verify two accounts). Mismatch, unreadable number or duplicate → `needs_review`, never `verified`.
- App: route group `src/app/(verification_flow)/` (`_layout.tsx`, `IDConfirmation.tsx`, `contactConfirmation.tsx`), reusable shell `src/components/verification/` (`VerificationScreen`, `StatusPanel`, `VerificationButtons`; built so the future guest verification reuses them), `src/lib/kyc/` (`startHostVerification.ts`, `useHostIdentity.ts`, `contactConfirm.ts`).
- `src/app/host-setup.tsx` REPLACED: rows are dynamic and tappable (an unconfirmed email/phone opens `contactConfirmation?kind=…`; the ID row opens `IDConfirmation` once contacts are ready). It re-reads the account (`supabase.auth.getUser()`), `host_private` and `host_identity` every time the page gets focus.
- `IDConfirmation` shows one state at a time: intro, waiting (polls `host_identity` every 3 s for up to 90 s), slow, failed (try again), needs_review, verified. The SDK's own result only chooses a message; the database decides.

**Supabase / Didit setup done by the owner**
- Supabase CLI installed and the project linked (`bnb_backend`, ref `rzzpyureckbdaeazjroy`). Both functions deployed; `didit-webhook` with `--no-verify-jwt` (Didit sends no Supabase token; the signature check is the protection).
- Secrets set (names only; values live in Supabase, never in the repo or chat): `DIDIT_API_KEY`, `DIDIT_WORKFLOW_ID`, `DIDIT_WEBHOOK_SECRET`, `ID_FINGERPRINT_KEY`. Supabase also provides `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` etc. (VERIFIED present in `supabase secrets list`, 2026-11-05).
- Didit console: webhook endpoint `…/functions/v1/didit-webhook`, name `event_status_update`, version v3, event `status.updated`, **environment Sandbox**. Going live needs a second (live) endpoint, a live API key/workflow, and the matching secrets.

**VERIFIED by the owner's own queries/commands, 2026-11-05**
- `refresh_venture_verification()` exists, table `host_identity` exists, trigger `refresh_verification_on_identity` exists on `host_identity` (so migration 05 was run). The second trigger from 05 was not located (my query only looked at `host_identity`/`ventures`).
- `host_identity` has all columns the functions use (`provider`, `provider_reference`, `failure_reason`, `updated_at`, `verified_at`, `id_fingerprint`, `id_country`, `id_type`, `id_last4`, `status`). The `status` CHECK allows `needs_review` (query returned `true`). A row exists for the test host with `status = pending`, `provider_reference = NULL`.
- `curl -X POST …/didit-webhook` without a signature returns `401` with body `stale`: the function is deployed, public, and rejecting unsigned calls.

**UNVERIFIED (check during the first trial)**
- Didit's decision field name `document_number` and the raw-bytes `X-Signature` header (the webhook logs the decision keys if it cannot read the number, then sets `needs_review` / `number_unreadable`).
- `supabase.functions.invoke` sending the user's token, and whether Function A needs `--no-verify-jwt` too (the project has `SUPABASE_JWKS` / publishable keys, i.e. newer JWT signing; if A answers 401 "Invalid JWT" while signed in, redeploy A with that flag, it checks the token itself).
- SDK error type names in `startHostVerification.ts`; `verifyOtp` types `phone_change` / `email_change`; whether Didit accepts our sandbox keys against the sandbox endpoint.
- That the EAS dev build contains the Didit native module and the camera permissions.

**Known blocker (product, not code):** `DATABASE.md` says a venture goes live only with email + phone + ID all confirmed. Phone confirmation needs an SMS provider that is not set up (`AUTH_METHODS.phone = false`), so **no host can go live yet**. For testing, the ID row opens after email alone (`contactsReady` in `host-setup.tsx`).

**Follow-ups:** SMS provider (Twilio / Africa's Talking) and flip `AUTH_METHODS.phone`; pass the typed legal name to Didit as expected details (name cross-check, API field names unverified); registry check at first payout; guest verification at first booking; escrow/payout rules before payments; consent/retention wording for selfies + ID photos (Kenya Data Protection Act, ODPC); a daily cap on sessions per host (today only a 30 s cooldown).

---

### 2026-11-04: Physical device testing setup and font scaling fixes
*(by the local coding AI; copied from its log)*

**Problem:** Text rendering issues on physical Android device (text clipping, truncated labels, white placeholder text on light background). These issues didn't appear on the emulator.

**Root cause:**
1. Physical device had system font scaling enabled (accessibility setting), while emulator was at default 100%
2. React Native's `<Text>` component respects OS-level font scaling by default
3. Tight container widths and heights couldn't accommodate scaled-up text
4. Search placeholder had no explicit color, defaulting to white on light background

**Changes:**
- **EAS build setup for physical device testing:**
  - Created `eas.json` with development build profile
  - Added EAS project ID to `app.config.js` (extra.eas.projectId)
  - Added iOS camera/microphone/photo/location permission descriptions in `infoPlist`
  - Disabled NFC in Didit plugin (iosNfcEnabled: false, androidNfcEnabled: false)
  - Installed `expo-dev-client` via EAS CLI
- **Font scaling mitigation (Option 2 - balanced approach):**
  - Added global `maxFontSizeMultiplier = 1.2` in `src/app/_layout.tsx` for all Text and TextInput components
  - Caps font scaling at 120% to support accessibility while preventing layout breakage
- **UI component fixes:**
  - Search bar: Added `placeholderTextColor="#888"` to make placeholder visible
  - "Our Recommendation" header: Added `flex-1` and `numberOfLines={1}` to prevent clipping
  - Featured cards: Increased width from `rm(180)` to `rm(200)` for more text space
  - Property type text: Changed to single line with ellipsis (`ellipsizeMode="tail"`) and added minimum width
  - Added explicit `allowFontScaling={true}` to ensure components respect the 1.2x cap

**Why this approach:** capping at 1.2x balances accessibility with UI stability and avoids a full layout overhaul.

**Build workflow update:**
- Physical device testing uses EAS cloud builds: `eas build --profile development --platform android`
- One-time build installs the dev build APK on the phone; later changes hot reload via `npx expo start --dev-client`
- Android Studio emulator workflow unchanged: `npx expo run:android` (initial) + `npx expo start --dev-client` (daily)
- **Heads-up (unverified):** `.env` is git-ignored, so a cloud build does not see it. `app.config.js` reads `GOOGLE_MAPS_API_KEY` at build time, so it must exist as an EAS environment variable or the map key in the installed app is empty. (`EXPO_PUBLIC_*` values are read by Metro from the local `.env` at bundle time.)

**Status:** EAS build configured, changes hot-reloaded to physical device. Text rendering issues resolved (reported by the local AI).

---

### 2026-10-31: Fixed Google OAuth hanging issue and migrated to development build URLs
**Problem:** Google sign-in hung after the user picked an account; the browser stayed open and the app never got the session.

**Root cause:**
1. Supabase Redirect URLs were set for Expo Go (`exp://192.168.181.135:8081/--/`) but the app uses a development build with the custom scheme `budgetlens://`
2. The OAuth completion code used `setSession` first, which has a known hanging issue in React Native/Expo (supabase-js #1429)

**Changes:**
- **Supabase configuration:** removed the Expo Go URLs from Redirect URLs and Site URL; added `budgetlens://` to Redirect URLs; Site URL is now `budgetlens://`.
- **`src/components/GoogleSignInButton.tsx`:** `exchangeCodeForSession` first, `setSession` only as fallback; loading state clears on every error path; more logging; `hasAuthParams` helper.

**Why this is production-ready:** the `budgetlens://` scheme works for dev builds, APK and IPA, with no environment-specific Supabase config.

**Status:** config changes made by the user and code verified working by the user (2026-10-31).

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
4. **Sensitive data is not stored on the phone.** ID number and phone number in the host draft are memory-only (see `partialize` in `ventureFlowStore.ts`). The full ID number is never stored server-side either (last 4 + server-side keyed hash).
5. **Hosts pick places, they do not type them freely** (stops "Nairobi" / "nairobi " becoming different places).
6. **Airbnb is the design reference.** Clean, calm, outlined fields, lots of white, one clear primary action.
7. **Trust is built on money control, not only ID checks.** Hosts are verified once; the platform (not the guest, not the host) holds a booking's payment until after check-in; payouts go only to an account matching the verified name.

## 3. Stack (versions matter)

- Expo SDK **57** (`expo ~57.0.17`), React Native **0.86.3**, React **19.2.3**, `expo-router ~57`, TypeScript 6.
- **AGENTS.md says: read https://docs.expo.dev/versions/v57.0.0/ before writing Expo code.** Expo changed a lot; do not trust older memory.
- **Development build** (not Expo Go): the app uses custom native configuration (Sentry native module, custom Google Maps key, custom `budgetlens://` scheme, the Didit SDK) which requires a development build.
- **Build workflow:**
  - Local build: `JAVA_HOME=$HOME/.sdkman/candidates/java/17.0.12-tem npx expo run:android` (Gradle caches work, rebuilds are fast). Java 17 via SDKMAN because Kali only has Java 11 in repos but Gradle 9.3.1 requires 17+.
  - Phone build: `eas build --profile development --platform android` (EAS cloud, see 2026-11-04).
  - Daily coding: `npx expo start --dev-client` (hot reload for JS/TSX).
  - Rebuild only when adding native packages or changing `app.config.js` (plugins, keys, scheme, permissions) or upgrading Expo.
- NativeWind 4 + Tailwind 3 (`className` works on RN components; `cssInterop(SafeAreaView, …)` is set in the root layout).
- Zustand 5 (+ `persist` with AsyncStorage), react-hook-form 7 + zod 4 (`@hookform/resolvers` 5).
- Supabase (`@supabase/supabase-js` 2.117): Postgres, Auth, Storage, RLS, RPCs, **Edge Functions (Deno)**. Supabase CLI is installed and the project is linked.
- Identity checks: **Didit** (`@didit-protocol/sdk-react-native`, native module, Expo config plugin in `app.config.js`).
- Reanimated 4.5 + worklets, gesture-handler, `react-native-sortables` (photo reorder), `react-native-maps` (Google provider), `expo-location`, `expo-image` / `expo-image-picker`, `expo-file-system`, Sentry (`@sentry/react-native`).
- Font: Rubik (Regular/Medium/SemiBold/Bold/…) loaded in the root layout.

## 4. Project layout and path aliases

```
app.config.js              Expo config (app.json is git-ignored; config lives here). Maps key from .env
global.css / tailwind.config.js / babel.config.js / metro.config.js / eas.json
providers/auth-provider.tsx   Supabase session -> React context + Zustand user cache
lib/                          ROOT lib (older code): supabase.ts, aut-actions.ts (sic), pending-actions.ts,
                              media-url.ts, hooks/{auth-context, use-require-auth, useVentureFlow, useAppMode}
src/
  app/                        expo-router routes
    _layout.tsx               root: fonts, Sentry, AuthProvider, Stack
    (tabs)/                   guest tabs (index, profile) + host tabs (host-dashboard/listings/bookings), floating pill tab bar
    (auth)/                   sign-in sheet (ModalSheet over the app)
    (venture_and_listings_flow)/   the host "create listing + venture" wizard
    (verification_flow)/      contactConfirmation + IDConfirmation (host now, guest later)
    host-setup.tsx            post-publish checklist (dynamic rows)
  app_state/                  Zustand stores (user_store, listing_store, ventureFlowStore)
  api/                        listings.ts (feed queries) — auth.ts is dead code
  components/                 UI building blocks (+ components/host/, components/verification/)
  constants/                  schemas (zod), flags, steps, amenities, countries, SQL files
  lib/                        newer code: places.ts, publishListing.ts, host.ts, hostRequirements.ts,
                              draftFiles.ts, otpAuth.ts, text.ts, utils.ts, kyc/ (Didit + contact confirmation)
  styles/                     responsive.ts, typography.ts, colors.ts
supabase/
  config.toml, migrations/    migrations are run BY HAND in the SQL editor (see DATABASE.md)
  functions/                  start-host-verification/, didit-webhook/   (Edge Functions, deployed with the CLI)
old_stuff/                    dead FastAPI-era auth. Ignore.
```

**GOTCHA — two `lib` folders.** `tsconfig` maps `@/*` → `src/*` and `@/lib/*` → `./lib/*` then `./src/lib/*`. So `@/lib/supabase` is the ROOT `lib/supabase.ts`, while `@/lib/places` is `src/lib/places.ts`. When adding a file, put new code in `src/lib/` and check the name does not already exist in root `lib/`.

**GOTCHA — do not run `supabase db push`.** Migrations were applied by hand, so Supabase's migration history does not match the real database. Set that up deliberately first.

## 5. Conventions (follow these when writing code)

**Sizing and text**
- Never hard-code sizes. Use `rs()` (horizontal), `rv()` (vertical), `rm()` (moderate) from `@/styles/responsive`.
- Text goes through `<AppText variant="small|body|large|title|heading|display|caption" weight="…">`. Variants live in `styles/typography.ts`. `font-rubik-*` Tailwind classes are **not** defined in `tailwind.config.js` (unverified in practice) — use `AppText`, which sets `fontFamily` in `style`.
- Colours for `color=` props and StyleSheets: `COLORS` in `@/styles/colors`. Brand green is `#064D30` (`dark-green-ascents` / `brand` in Tailwind). Soft green `#EEF5F0`.
- Prefer `style` for sizing and `className` for colours/borders/layout helpers.

**Forms**
- Fields: `TextField`, `PhoneField`, `SelectField`, `PlaceSearchField` (label inside the box, border green on focus, red on error, 1.5px always so layout never jumps).
- Pattern for each wizard page: `useForm` + `zodResolver`, `mode: "onTouched"`, read the draft **once** with `useRef(store.getState().draft).current`, `useWatch` → `setDraft` on every change, re-`trigger` errors for already-filled fields on mount.
- The same zod schema decides whether the wizard's **Next** button is enabled (`constants/ventureFlowSteps.tsx`). One source of truth.
- Sanitize while typing (`sanitize*` helpers) so bad characters simply do not appear.
- Block phone numbers/links/emails in public text (`hasContactInfo`) — protects the platform fee.

**Modals**
- Any route-based modal that covers most of the screen must use **`ModalSheet`**: black backdrop including the status bar, white status-bar icons, grey "peek" strip, rounded white sheet, slide up/down. Register the route with `presentation: "transparentModal"`, `animation: "none"`.
- Use `useModalSheet().close(after?)` to slide down and then run something.

**Auth-gated actions**
- Wrap with `useRequireAuth()`: `requireAuth(() => doThing())`. Logged out → the action is stored (`lib/pending-actions.ts`) and `/sign-in` opens as the sheet. After login the sheet slides down and **then** the stored action runs.

**Data**
- Reads with filters → a Postgres **view** (`listing_cards`, always `security_invoker = true`). Writes with rules → an **RPC** (`publish_listing`, later `create_booking`).
- Request counters discard stale responses (`api/listings.ts`).
- Stable ids: amenity ids (`constants/amenities.ts`) are saved in the database — never rename one once listings exist.

**Edge Functions (new)**
- Anything that needs a secret or must be trusted (calling Didit, writing `host_identity`) is an Edge Function, never app code. Secrets: `supabase secrets set NAME=value` (never in the repo, `.env` files shipped to the phone, or chat; `supabase secrets list` shows names and digests only).
- A function that must be called by an outside service (webhook) is deployed with `--no-verify-jwt` and protected by a signature check. Functions called by the app check the login token themselves (`admin.auth.getUser(token)`).
- Functions use the service role to write; the app can only read its own `host_identity` status (RLS + column grants).
- Webhooks can arrive twice or out of order: every update must be safe to repeat and must not let an old session overwrite a newer one.

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
- Email and phone use passwordless one-time codes (`src/lib/otpAuth.ts`). To enable: email → Supabase email template must contain `{{ .Token }}` and OTP length must match `CODE_LENGTH` (6); phone → enable Phone provider + an SMS provider. Then flip the flags.
- Apple: placeholder. Needs Sign in with Apple set up AND code written.
- **Suggestions from the host flow:** the sheet reads the host draft (email prefilled; a Gmail address puts "Continue with Google — as <email>" on top and passes `login_hint`; with a hint the button uses `prompt: "select_account"`, otherwise `prompt: "consent"`).
- **Google OAuth configuration (dev builds):** Supabase Redirect URLs include `budgetlens://`; Site URL is `budgetlens://`; `WebBrowser.openAuthSessionAsync` with `skipBrowserRedirect: true`; completion prefers `exchangeCodeForSession`. Do NOT use `exp://` URLs.

### 6.3 Home feed
- `(tabs)/index.tsx` → `loadListings()/loadMoreListings()` (`api/listings.ts`) → view `listing_cards` → `listing_store` (persists only the first page). Filters: region, type, min/max price. Guests can read (RLS).
- Decided: one feed in a deliberate order (newest first) + search bar + type chips. Not random, not per-place rows (not enough inventory yet).

### 6.4 Host wizard (`(venture_and_listings_flow)`)
- The flow is defined in ONE file: `constants/ventureFlowSteps.tsx` (`LISTING_STEPS`, `VENTURE_STEPS`, `REVIEW_STEP`, `canProceed` per step). A host who already has a venture only walks `LISTING_STEPS` + review.
- `lib/hooks/useVentureFlow.ts` works out the current step, Next/Back, `?from=review` edit mode, and publishing.
- Draft = `app_state/ventureFlowStore.ts` (persisted, **version 3**). Memory-only fields: `idNumber`, `contactPhone`.
- Order: type → rooms/guests → guest access → map pin → amenities → photos (3–10) → title/description → price (KES/night, 500–200,000) → address → thank-you → about ventures → legal name → ID → venture name → venture cover (optional) → contact → review → **Finish**.
- Finish → `requireAuth(publish)` → `lib/publishListing.ts`: uploads photos to bucket `listing-media` at `<uid>/<publishId>/<photoId>.<ext>`, then ONE `supabase.rpc("publish_listing", { p })` (all or nothing; `publishId` makes a retry safe).
- After publish → `/host-setup` checklist. The listing goes live when the steps are done. Requirements come from the ACCOUNT (`lib/hostRequirements.ts`), never from a draft flag.
- Address: country → place search (`search_places` RPC) or "add as new area". Exact address is private until booking; the server rounds public coordinates.

### 6.5 Database (Supabase)
Tables: `profiles`, `ventures` (unique `admin_id`), `listings`, `media`, `listing_media` (carries `is_cover`), `availability`, `bookings`, `reviews`, `reports`, `conversations`, `messages`, `host_identity` (private; app can only read its own status), plus `places`, `host_private`, `listing_private`. RLS is on for every table. SQL in the repo: `src/constants/schemas/database_schemas/`.
**The live database may be ahead of or behind these files.** For anything about the database, `DATABASE.md` is the source of truth and its VERIFIED/REPORTED/UNVERIFIED labels apply.
- Verified 2026-10-29 (owner's queries): buckets `listing-media` (public) and `avatars` (private); tables `host_private`, `listing_private`, `places`; functions `publish_listing(jsonb)` and `search_places`; the extra `listings`/`ventures` columns (`guest_access`, `beds`, `country`, `place_id`, `region`, `area`, `area_pending`, `check_in_time`, `check_out_time`, `cover_media_id`).
- **Verified 2026-11-05 (owner's queries):** migration 05 was run: `host_identity` table, `refresh_venture_verification()` and trigger `refresh_verification_on_identity` exist; `host_identity` has every column the verification functions use; its `status` CHECK allows `pending | verified | failed | needs_review`. (`DATABASE.md` should be updated to match.)
- Still unknown: storage policies on `storage.objects`, RLS on `host_private`/`listing_private`, `listing_media.position`, the second trigger from 05.
- **Lesson:** never write SQL against this database from memory. Check what exists first, then change the existing function with small edits instead of replacing it.

### 6.6 Host verification (new, 2026-11-05)
```
App (IDConfirmation) ──login token──▶ Edge Function A  start-host-verification
                                        │ checks user + confirmed email + status + cooldown,
                                        │ creates the Didit session (secret key stays here)
                                        ▼
                                      Didit ──▶ session_id + session_token
App ◀── session_token only ───────── Function A   (session_id saved in host_identity.provider_reference)
App: startVerification(session_token) ─▶ Didit's native screens (ID + selfie)
Didit ──signed webhook status.updated──▶ Edge Function B  didit-webhook
                                        │ verifies timestamp + HMAC, finds row by session id,
                                        │ updates host_identity.status (service role)
                                        ▼ trigger refresh_verification_on_identity → venture/listings go live
                                          (only when email + phone + ID are all confirmed)
App reads host_identity.status (own row only) and shows the state
```
- Statuses in the app: `pending` (also "not started" and "waiting for the webhook"), `verified`, `failed`, `needs_review`. The app cannot tell "never started" from "submitted, waiting" because `provider_reference` is not readable by the app; the page keeps a local "waiting" phase and polls.
- `vendor_data` = the Supabase user id, set by Function A from the login token (the app can never choose it).
- Rule: only the webhook may set `verified`. The SDK result and the callback/redirect are only for showing messages.

## 7. Status

| Area | State |
|---|---|
| Development build (Android emulator) | **Working** (2026-10-31). |
| Development build on a physical phone (EAS cloud build) | Set up 2026-11-04 (reported by the local AI). A new build with the Didit native module was being installed on 2026-11-05. |
| Google sign-in | **Working** (2026-10-31, emulator). |
| Guest-first gating + continue-after-login | Works (confirmed 2026-10-28) |
| Sign-in sheet UI, nav bar fix | Done, user confirmed it looks right |
| Email / phone / Apple sign-in | UI + code ready, **off** (flags) |
| Home feed against live DB | Built; seed data has old listing types (see 8). Had runtime errors earlier. |
| Host wizard UI | Built (all pages); end-to-end publish against live DB **unverified** |
| Host verification (Didit): functions, screens, webhook, console setup | **Built and deployed, first end-to-end trial pending (NOT RUN)** |
| Contact confirmation (phone/email) | Page built; **off** until an SMS provider / email template exists |
| Registry (IPRS) check, guest verification, AML | Not built (decided: later) |
| Search page, listing detail, favourites, messaging, bookings, payments, reviews UI | Not started |
| SMS provider for phone confirmation/sign-in | Not set up (**blocks hosts going live**) |

## 8. Known issues / tech debt

- **No host can go live until phone confirmation works** (SMS provider; see 2026-11-05).
- `(auth)/(onboarding_flow)/sign-up.tsx` is stale: calls the old `signup()` with the wrong arguments and old components. Nothing links to it. Delete or rebuild.
- `src/api/auth.ts` (uses `localStorage`) and `old_stuff/authContext.tsx` are dead.
- `src/components/prep.tsx` is a scratch file with top-level JSX and missing imports; it is not imported but breaks type-checking. Delete it.
- `lib/aut-actions.ts` is misspelled (kept so imports still work). `signup()` there takes no `id_number` any more; `sign-up.tsx` still passes one.
- `AppleSignInButton.tsx` and the old `customButton.tsx` / `customInput.tsx` are mostly unused; `customButton` has implicit-any props.
- **Listing types mismatch:** the wizard saves `room | hotel | house | apartment | guest_house`, the seed data and `listing_store` comments use `bedsitter | studio | one_bedroom …`. `ListingCard` prints the raw `type` and shows `$` instead of KES. Use `describeListing` / `DB_TYPE_LABELS` (`constants/listingTypes.ts`) and fix the price label.
- `tailwind.config.js` is out of sync with `styles/colors.ts`: it lacks `warning`, `danger`, `brand-line`, and `brand-soft` there is `#0A7A4D` while `COLORS.greenSoft` is `#EEF5F0` (code uses `bg-brand-soft` and `bg-warning-soft`). (unverified)
- `lib/draftFiles.ts` has `keepPhoto()` but `addPhotos.tsx` and `ventureCoverPhoto.tsx` do not appear to call it, so drafted photos may be lost if Android clears the cache. (unverified)
- Home screen: card `onPress` is empty, the search bar is not a button yet, filter chips not built, tab bar is `position: absolute` so screens need bottom padding (home uses 160).
- `ASSETS_REFERENCE.md` is stale (`apartment_image_one.jpg` is required by `constants/images.tsx` but not listed).
- Expo app name/slug/scheme still `budget_lens` / `budgetlens`.
- Pre-existing TS complaints: `global.css` module declaration, a few implicit anys.
- `DATABASE.md` still says migration 05 is NOT RUN and `host_identity` is missing; update it from the 2026-11-05 verified results.
- Function A only has a 30 s cooldown per host; add a daily cap before launch (each session may cost money).
- Verification pages are not wrapped in an "is this a host?" guard (the database still protects everything).

## 9. Roadmap (suggested order)

1. **Finish and verify host verification:** first end-to-end trial (sandbox), fix anything in the UNVERIFIED list, then go live with a live Didit endpoint/keys.
2. **SMS provider** (Twilio or Africa's Talking) → flip `AUTH_METHODS.phone` → phone confirmation and phone sign-in; then email codes (template with `{{ .Token }}`).
3. Registry (IPRS) check at a host's first payout or on a risk flag (store only last 4 + keyed hash, never the full number).
4. Home header: search bar as a button + type chips (`applyListingFilters` already exists); search page v1 then v2 (places API + distance).
5. Listing detail (photos in `listing_media.position` order, amenities, map, reviews, availability).
6. Favourites table + heart via `requireAuth`; messaging (realtime); bookings via `create_booking` RPC; payments (M-Pesa likely) with the platform holding the guest's payment until after check-in and `paid` set only by a backend/webhook; payouts only to an account matching the verified name. Check licensing implications of holding funds (use a licensed provider's escrow/split).
7. Guest verification at first booking (reuse `components/verification/`).
8. Apple sign-in.
9. Apply the RLS hardening described in the project notes §6.3; review `profiles` policies.
10. Rename the app from `budget_lens` / `budgetlens` to `african_spaces` / `africanspaces` (requires updating Supabase redirect URLs, Android package, iOS bundle identifier).

## 10. How to work with the owner (for AI assistants)

- The owner is building and **learning** (new to Supabase, raw SQL and Edge Functions; the Supabase CLI is now set up and they prefer doing things there). Explain the why in plain language; avoid dumping code without context.
- **Deliver code as real files** (create the file and present it). Always state the exact destination path in the project, and whether it replaces or adds a file.
- You usually cannot run the app. Say what you did not test, and ask for a screenshot or log when UI or functions are involved.
- Do not claim the database has something unless the user confirmed it. When unsure, give a read-only SQL check query first.
- Check the Expo SDK 57 docs before using an Expo API.
- Cover-the-screen modals: always `ModalSheet`.
- Keep responsive sizing (`rs/rv/rm`), `AppText`, `COLORS`, and the field components. Do not introduce a second styling approach.
- When a change touches architecture, data or design, update this file in the same session, and say which AI made the change.

---

## 11. Changelog: older entries (newest first)

### 2026-10-31 — Development build setup
- **Switched to development build workflow** (no longer using Expo Go): the app needs custom native configuration (Sentry native module, custom Google Maps key, custom `budgetlens://` scheme). Expo Go would use Expo's Maps key and `exp://<LAN-IP>` redirects.
- **Build workflow:** initial build `JAVA_HOME=$HOME/.sdkman/candidates/java/17.0.12-tem npx expo run:android` (about 20 minutes first time, 1-2 minutes after); daily `npx expo start --dev-client`; rebuild only for native packages, `app.config.js` changes or an Expo upgrade.
- **Java 17 via SDKMAN** (system Java 11, Gradle 9.3.1 needs 17+). **Android emulator:** internal storage raised to 16GB+.
- **Benefits:** stable `budgetlens://` redirect URL, real Maps key, Sentry native crash reporting, custom native modules.

### 2026-10-29 (later) — Host/guest foundation, policy files
- **Decision (see `HOST_GUEST_PLAN.md`):** ONE tab navigator `(tabs)` for everybody; tabs change with the mode; screens outside the mode are hidden with `href: null`. Host-only screens pushed over the tabs will live in a `(host)` group with a guard layout (not built yet).
- **Two ideas:** `isHost` = the ACCOUNT owns a venture (database, cached as `ventureId`); `mode` = the side being viewed (`modeStore`). Host mode only if `isHost && mode === "host"`. Neither is security.
- **Built (NOT tested at the time):** `user_store.ts`, `useAppMode`, `lib/host.ts`, mode-based `(tabs)/_layout.tsx`, `HostOnly`, `FinishSetupCard`, `HostPlaceholder`, placeholder host tabs, `profile.tsx` (mode switch, setup card, dev toggle), `host-setup.tsx`.
- **Dev toggle:** `devForceHost` makes the UI act like a host in development builds only; it must never be used for data or publishing.
- **"Finish setting up" card** shows when `ventureVerified === false`; it opens `/host-setup`.
- **New policy files:** `AGENTS.md` (MUST / MUST NOT for every AI), `DATABASE.md` (strict Supabase/SQL rules, registry, migration log).
- **Known follow-ups:** `(host)` group + guard; host listings need an owner select policy on `listings` (unverified); "Add a new listing" should be disabled for unverified hosts.

### 2026-10-29 — Floating labels, all-or-nothing publishing, host-state decisions
- **Fields:** `TextField`, `PhoneField`, `SelectField` use a floating label (`FloatingLabel.tsx`). Every new field must use these components.
- **Publishing is atomic:** photos to Storage first (own folder, retry overwrites), then ONE `publish_listing(p jsonb)` call. Same `publishId` = same listing id. SQL: `supabase/migrations/05_publish_atomic.sql` (rewritten after the live DB was checked; run by the owner, verified 2026-11-05).
- **Decisions:** signing in never needs an "account exists?" check; a new host's venture + first listing are created together and stay hidden until email + phone + ID are confirmed (only the server flips this); an account that is already a host gets a choice (add / use another account / cancel); an unverified host may have only ONE listing; public coordinates rounded to ~1 km, exact address in `listing_private`; contact phone/email in `host_private`, never in `ventures.phone`.
- **Publish flow changes:** `useVentureFlow.publish` awaits `refreshHostStatus()` first; `keepDraftOnNextSignOut()` lets "use another account" keep the draft.
- **Loading screen:** `PublishingOverlay` with a real determinate progress bar driven by upload progress.

### 2026-10-28 — Sign-in sheet, nav bar, build log
- **Nav bar:** now a floating pill (`bottom = insets.bottom + 12`, zero padding, centred items).
- **`ModalSheet`** (new): Airbnb-style sheet; the root layout registers `(auth)` as `transparentModal` with `animation: "none"`.
- **`(auth)/_layout.tsx`:** `AuthGate` closes the sheet after login and THEN runs the pending action. Closing without login clears it.
- **Sign-in screen rewritten** (Airbnb layout): `AuthOptionRow`, `OtpCodeInput`, `otpAuth.ts`, `AUTH_METHODS` flags, `loginHint` support in `GoogleSignInButton`.
- **Decisions:** email-first suggestion over SMS (email codes are free); `prompt: "select_account"` when a Google hint is given.

### Before 2026-10-28 (reconstructed from code and the 2026-10-10 project notes; no exact dates)
- Replaced the FastAPI/axios auth with Supabase auth (session provider, encrypted session storage, Google OAuth on the emulator).
- Guest-first browsing with `useRequireAuth` + `pending-actions`.
- Database schema, RLS policies, `listing_cards` view, seed data (70 listings), Zustand listings store + API with paging, filters and stale-response protection.
- Host wizard (all pages), publish via `publish_listing`, `/host-setup` checklist; draft persisted (version 3) with sensitive fields memory-only.
- `host_identity` table SQL (private, read-only from the app).