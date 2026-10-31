# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

# African Spaces — project policies for every AI assistant

Read these files, in this order, before changing anything:
1. `AGENTS.md` (this file: the rules)
2. `BUILD_LOG.md` (what the app is, how it is built, conventions, status, known issues, changelog)
3. `DATABASE.md` (**Supabase / SQL rules, what really exists in the database, migration log**)
4. `HOST_GUEST_PLAN.md` (how the host side and guest side share the app)
5. `AFRICAN_SPACES_PROJECT_NOTES` (older deep reference; the files above win when they disagree)

## The owner
Builds and is learning. New to Supabase and raw SQL (used to ORMs like SQLAlchemy). Explain the why in plain language.

## MUST

- **Deliver code as real files** (create the file and present it) with the exact destination path in the project, and say whether it replaces or adds a file.
- **Check before you change.** For anything in the database, ask the owner to run a read-only check and paste the result. Never write SQL about existing objects from memory.
- **Say what you did not test or verify.** You usually cannot run the app or the database. Use the labels VERIFIED / REPORTED / UNVERIFIED / NOT RUN from `DATABASE.md`.
- **Keep the logs current in the same session:** a new entry at the top of the `BUILD_LOG.md` changelog, and for any database change update `DATABASE.md` (registry + migration log). Fix sections your change made wrong; do not only append.
- **Security lives in the database** (RLS, column grants, RPCs). UI hiding, tab hiding and route guards are UX only.
- **Writes with rules go through an RPC**; reads with filters through a view with `security_invoker = true`.
- **Keep sensitive data in private tables** (phone, ID, exact address). Public tables (`ventures`, `listings`, `media`, `reviews`) never hold it.
- **UI conventions:** sizes with `rs()/rv()/rm()`, text with `AppText`, colours from `COLORS`, fields with `TextField` / `PhoneField` / `SelectField` (floating label), covering modals with `ModalSheet` (black top, white status-bar icons), auth-gated actions with `useRequireAuth()`.
- **Check the Expo SDK 57 docs** before using an Expo / Expo Router API.
- New code goes in `src/lib/` (there is also an older root `lib/`; `@/lib/x` resolves to the root one first).

## MUST NOT

- Never put the `service_role` key in the app. Never disable RLS. Never write `using (true)` on insert/update/delete policies.
- Never store full ID numbers, card data or passwords. Never use `user_metadata` to decide who may do something.
- Never run or ship destructive SQL (`drop`, `delete`, `truncate`) unless the owner explicitly asked, with a plain warning first.
- Never replace an existing database function or policy without seeing its current text first. Make small, marked edits.
- Never claim something exists in Supabase, or that code works, unless it is VERIFIED.
- Never add a second styling approach, a second form pattern, or a new tab/route group without recording why in `BUILD_LOG.md`.
- Never use the dev-only host toggle (`devForceHost`) for data access or publishing logic. It is UI only.

The full database rules, the registry of what exists, and the migration log are in `DATABASE.md`. When in doubt, ask the owner before acting.