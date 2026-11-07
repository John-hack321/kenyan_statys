# Host / Guest architecture — decision and plan

Written 2026-10-29. Status of each step is in section 11 (update it as steps are done). Read `AGENTS.md`, `buildLog.md` and `DATABASE.md` first. This file only covers the host/guest split of the app UI.

> Note: The database file is `DATABASE.md` (renamed from `DATABASE.dm` on 2026-11-07).

## 1. The decision in one paragraph

One tab navigator for everybody (`src/app/(tabs)/`), where the tab bar changes with the mode the person is in: guest mode shows guest tabs, host mode shows host tabs. Shared screens (Profile, later Messages) exist once. Host-only screens that are pushed on top of the tabs (edit a listing, a booking's details) live in a separate route group `src/app/(host)/` whose layout has the host guard. The wizard stays in `(venture_and_listings_flow)/`, auth stays in `(auth)/`. Security is the database. The UI split is only convenience.

## 2. Three layers of "who may do what" (do not mix them up)

| Layer | What it does | Is it security? |
|---|---|---|
| 1. Database (RLS, column grants, RPCs) | Decides which rows/columns/actions a user may touch | **YES. The only real one.** |
| 2. Route guard (`HostOnly` component, `(host)/_layout.tsx`) | Sends a non-host away from a host screen (deep link, bug, old state) | No. Avoids showing an empty broken screen |
| 3. Tab visibility (`href: null` per mode) | Shows the right tab bar | No. Cosmetic |

Rule: every host screen must be written as if a guest could open it. The queries behind it must be blocked by RLS anyway.

## 3. Two different ideas: `isHost` and `mode`

| Meaning | Source of truth | Can the user change it? |
|---|---|---|
| `isHost` | This ACCOUNT owns a venture | the database (`ventures` row, read by `refreshHostStatus`, cached as `ventureId`) | No (only by becoming a host) |
| `mode` | Which side of the app the person is VIEWING | `modeStore` (persisted: `"guest"` or `"host"`) | Yes, if `isHost` |

Effective mode = `isHost && mode === "host" ? "host" : "guest"`. A non-host is always in guest mode, whatever is stored. This is a middle path between "mode only from `ventureId`" (cannot switch back to browsing) and "free mode flag" (can drift). Use one hook everywhere: `useAppMode()` returns `{ isHost, mode, isHostMode, setMode }`.

Defaults and resets:
- New install: guest mode. After the first publish the person stays in guest mode; Profile offers "Switch to hosting" (same as Airbnb).
- Sign-out resets mode to guest (`resetUser`), so the next person on the phone does not land on host tabs.

## 4. Folder structure

```
src/app/
  (tabs)/                         ONE navigator, tabs depend on mode
    _layout.tsx                   declares ALL screens, hides the ones that do not belong to the mode
    index.tsx                     Home feed                      (guest mode)
    host-dashboard.tsx            "Hosting": today, alerts, setup card (host mode)
    host-listings.tsx             "Listings": my listings        (host mode)
    host-bookings.tsx             "Bookings": requests/calendar  (host mode)
    profile.tsx                   Profile (both modes; branches inside)
    saved.tsx, trips.tsx          later (guest mode)
    messages.tsx                  later (both modes, shared)
  (host)/                         host-only screens that are PUSHED over the tabs (no tab bar)
    _layout.tsx                   Stack + host guard (redirect to "/" if not a host)
    listing/[id].tsx              edit a listing                  (later)
    booking/[id].tsx              one booking                     (later)
  (venture_and_listings_flow)/    the wizard (guests become hosts here, hosts add listings here)
  (auth)/                         sign-in sheet
  host-setup.tsx                  verification checklist (full screen, outside the tabs)
src/components/host/              host-only UI pieces (FinishSetupCard, HostPlaceholder, ...)
src/lib/useAppMode.ts             the hook from section 3
```

Why a host group at all? A guard in ONE layout protects every pushed host screen. The tab screens cannot be guarded in a layout (it is shared with guests), so each host tab screen is wrapped in `<HostOnly>`.

## 5. Tab matrix

| Tab | File | Guest mode | Host mode |
|---|---|---|---|
| Home | `index` | yes | hidden |
| Saved / Trips | `saved`, `trips` (later) | yes | hidden |
| Hosting | `host-dashboard` | hidden | yes |
| Listings | `host-listings` | hidden | yes |
| Bookings | `host-bookings` | hidden | yes |
| Messages | `messages` (later) | yes | yes |
| Profile | `profile` | yes | yes |

Expo Router pitfall (verify against the SDK 57 docs): every file in `(tabs)/` becomes a tab automatically. Not rendering a `<Tabs.Screen>` does NOT hide it. Declare every screen and hide it with `options={{ href: null }}`. So the "conditionally render `<Tabs.Screen>` in a fragment" snippet from the research would show host tabs to guests with default titles. Hiding by `href: null` per mode is the fix. (Confirmed in the Expo Router docs on 2026-10-29. Caveat found there: switching a tab between `href: null` and a path can remount the tab navigator, which is acceptable for a rare mode switch.)

## 6. Why not the alternatives

- Two tab groups `(guest)` / `(host)` each with a `<Tabs>`: stronger separation, but Profile/Messages must exist in both and two groups with the same child name map to the same URL (`/profile`), which Expo Router treats as a conflict. Not worth it.
- `mode ? <GuestNavBar/> : <HostNavBar/>`: works for a hand-made bar, but we use the navigator's own bar; the real problem is route registration (section 5), not the bar.
- Mode only derived from `ventureId`: simplest, but a host could never browse as a guest. We keep `modeStore`, constrained by `isHost`.

## 7. Switching modes (UX)

- Profile shows "Switch to hosting" (host account, guest mode) or "Switch to traveling" (host mode). Non-hosts see "Become a host".
- Switching = `setMode(next)` then `router.replace` to the mode's start screen (`/host-dashboard` or `/`).
- Safety net in `(tabs)/_layout.tsx`: if the current route does not belong to the effective mode, replace to the mode's start screen (covers deep links, "Back to home" buttons, sign-out, dev toggle off).

## 8. Development toggle (until publishing works again)

Goal: see and build the host side without a real venture.

Easiest and most realistic: sign in with the account that owns the seed venture "Okello Stays" (70 listings). It is a real host (`ventureId` set).

Fallback, UI only: `devForceHost` in `user_store` (never persisted) + a switch on Profile, shown only when `__DEV__`. `useIsHost()` returns true when it is on. It must never affect data or publishing: `useVentureFlow` reads `ventureId` directly, and host screens still query the database as the real user (so they will be empty without a real venture; build them with empty states).

Remove the toggle (or keep it dev-only) before release. `__DEV__` is false in release builds, so it cannot ship active.

## 9. Verification checklist ("Finish setting up")

- Profile (and later the Hosting dashboard) shows a FinishSetupCard when the venture is not verified (`ventures.is_verified = false`). The app stores `ventureVerified` next to `ventureId` (read by `refreshHostStatus`).
- Tapping the card opens `/host-setup` (the checklist: account, email, phone, ID). Its behaviour is built later.
- Yes, `host-setup` needs a "I'll do this later" button that goes to the Profile tab, where the card stays. After publishing, the person lands on `host-setup` (momentum), leaves with "later", and finds the card on Profile.
- `host-setup` only SHOWS requirements for now. The phone code, email confirmation and ID check are separate work (see `buildLog.md` roadmap).

## 10. What each host screen needs from the database (check before building a screen)

Before writing a host screen, write down: which tables it reads/writes, which RLS policy allows it, and whether a write must be an RPC. Known starting points (from `rls_policies.sql`, reported as applied, not re-verified):
- My listings: `listings` select policy must let the OWNER see inactive/awaiting listings (the hardening in the project notes §6.3 adds "Owner can view own listings"; unverified if applied).
- Bookings: "Guest or host can view booking" exists (reported). Booking status changes by hosts must go through a guarded function/trigger (notes §6.3), not direct updates.
- Never use the `service_role` key in the app. Never read host data from `user_metadata`. See `DATABASE.md` for the rules and the registry of what really exists.

## 11. Implementation steps and status

| # | Step | Status |
|---|---|---|
| 1 | `user_store`: `ventureVerified`, `devForceHost`, `setVentureStatus`, mode reset on sign-out; `useIsHost` honours the dev toggle | delivered 2026-10-29, not tested |
| 2 | `src/lib/useAppMode.ts` (+ `useHostSetupPending`) | delivered 2026-10-29, not tested |
| 3 | `src/lib/host.ts`: also read `is_verified` | delivered 2026-10-29, not tested |
| 4 | `(tabs)/_layout.tsx`: all screens declared, hidden by mode with `href: null`, redirect safety net | delivered 2026-10-29, not tested |
| 5 | `HostOnly` component | delivered 2026-10-29, not tested |
| 6 | Placeholder host tabs: `host-dashboard`, `host-listings`, `host-bookings` | delivered 2026-10-29, not tested |
| 7 | `FinishSetupCard` on Profile (+ dashboard) | delivered 2026-10-29, not tested |
| 8 | Profile: mode switch, card, dev toggle | delivered 2026-10-29, not tested |
| 9 | `host-setup`: "I'll do this later" to Profile, neutral title | delivered 2026-10-29, not tested |
| 10 | `(host)/_layout.tsx` guard group (when the first pushed host screen is built) | later |
| 11 | Real host screens (listings list from DB, bookings, calendar) | later |
| 12 | Messages (shared tab), Saved, Trips | later |
| 13 | Verification steps (phone code, email confirmation, ID check), "Add listing" disabled for unverified hosts | later |

## 12. Open questions for the owner

- Should a brand-new host land in host mode right after publishing, or stay in guest mode until they switch? (Plan: stay in guest mode.)
- Host tab names: "Hosting / Listings / Bookings" (plan) or Airbnb-like "Today / Calendar / Listings"?
- Is a separate "Messages" tab wanted in v1, or later?
