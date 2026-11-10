# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# African Spaces — project policies for every AI assistant

Read these files, in this order, before changing anything:
1. `AGENTS.md` (this file: the rules)
2. `buildLog.md` (what the app is, how it is built, conventions, status, known issues, changelog)
3. `DESIGN.md` (**tokens, component inventory, UI patterns, hard accessibility floors, known design deviations**. Required before touching any screen, component or style)
4. `DATABASE.md` (**Supabase / SQL rules, what really exists in the database, migration log**. Required before any SQL, RLS, RPC, storage or Edge Function work)
5. `HOST_GUEST_PLAN.md` (how the host side and guest side share the app)
6. `AFRICAN_SPACES_PROJECT_NOTES` (older deep reference; the files above win when they disagree)

Design skills live in `.claude/skills/` (`african-spaces-design` to build UI, `african-spaces-design-review` to audit it, shared notes in `_shared/references/`). Claude Code loads them automatically. Any other AI (Devin/Windsurf, Cursor, etc.) that cannot load skills must read `DESIGN.md` and the files in `.claude/skills/_shared/references/` directly. They are plain markdown.

## The owner
Builds and is learning. New to Supabase and raw SQL (used to ORMs like SQLAlchemy). Explain the why in plain language.

## MUST

- **Deliver code as real files** (create the file and present it) with the exact destination path in the project, and say whether it replaces or adds a file.
- **Check before you change.** For anything in the database, ask the owner to run a read-only check and paste the result. Never write SQL about existing objects from memory.
- **Say what you did not test or verify.** You usually cannot run the app or the database. Use the labels VERIFIED / REPORTED / UNVERIFIED / NOT RUN from `DATABASE.md`. For UI, say plainly if you did not check a device, a small screen, font scaling, or a screen reader.
- **Keep the logs current in the same session:** a new entry at the top of the `buildLog.md` changelog (say which AI made it), and for any database change update `DATABASE.md` (registry + migration log). For any UI pattern, component, token or design decision update `DESIGN.md` (sections 3, 4, 7 or 9). Fix sections your change made wrong; do not only append.
- **Security lives in the database** (RLS, column grants, RPCs). UI hiding, tab hiding and route guards are UX only.
- **Writes with rules go through an RPC**; reads with filters through a view with `security_invoker = true`.
- **Keep sensitive data in private tables** (phone, ID, exact address). Public tables (`ventures`, `listings`, `media`, `reviews`) never hold it.
- **UI conventions:** sizes with `rs()/rm()` (`rv()` is a deprecated alias of `rs()`, never for fonts), text with `AppText` only (never a raw `<Text>`; a raw `<TextInput>` spreads `{...TEXT_SCALE_PROPS}`), `minHeight` not `height` on text boxes, colours from `COLORS`, fields with `TextField` / `PhoneField` / `SelectField` (floating label), covering modals with `ModalSheet` (black top, white status-bar icons), auth-gated actions with `useRequireAuth()`.
- **Design work follows `DESIGN.md`.** Search its component inventory before creating anything. Meet its hard floors (touch targets, contrast, never colour alone, accessibility roles/labels/states, loading/empty/error/success states, reduced motion, keyboard-safe forms, safe areas, survives font scale 1.2). Show the owner the one primary action and the pattern you chose before writing a screen.
- **Check the Expo SDK 57 docs** before using an Expo / Expo Router API.
- New code goes in `src/lib/` (there is also an older root `lib/`; `@/lib/x` resolves to the root one first).

## MUST NOT

- Never put the `service_role` key in the app. Never disable RLS. Never write `using (true)` on insert/update/delete policies.
- Never store full ID numbers, card data or passwords. Never use `user_metadata` to decide who may do something.
- Never run or ship destructive SQL (`drop`, `delete`, `truncate`) unless the owner explicitly asked, with a plain warning first.
- Never replace an existing database function or policy without seeing its current text first. Make small, marked edits.
- Never claim something exists in Supabase, or that code works, unless it is VERIFIED.
- Never add a second styling approach, a second form pattern, a second button/modal/card component, or a new tab/route group without recording why in `buildLog.md` (and `DESIGN.md` section 7 for design choices).
- Never invent new colours, radii or font sizes. Add a token to `DESIGN.md` and `COLORS` (and `tailwind.config.js`) first, with the owner's approval.
- Never mass-edit existing screens "to match the design system" unasked. Fix deviations only in files you are already changing, or in a pass the owner requested. List the rest.
- Never ship UI that promises something not built, or fake data (ratings, counts, names) in real screens.
- Never use the dev-only host toggle (`devForceHost`) for data access or publishing logic. It is UI only.
- Never edit files during a design review. Reviews report; fixes are a separate, opt-in step.

## Skills are advisory; the project wins
Design skills (ours or third-party) may suggest libraries or patterns that differ from this repo (for example React Native Reusables, `Pressable`, different colours). If they conflict with the code or with `DESIGN.md`, follow the code and `DESIGN.md`, and mention the suggestion to the owner instead of applying it.

The full database rules, the registry of what exists, and the migration log are in `DATABASE.md`. When in doubt, ask the owner before acting.