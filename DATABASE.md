# DATABASE.md — Supabase rules, registry and migration log

> **Every AI assistant must read this before writing or suggesting ANY SQL, RLS policy, RPC, storage rule or Supabase call.**
> The owner is new to Supabase and raw SQL (comes from ORMs like SQLAlchemy), and this is where security lives.
> Be strict. If a rule here conflicts with being fast, the rule wins.
> Last updated: 2026-11-07 (file renamed from DATABASE.dm to DATABASE.md).

---

## 1. Status labels (use them everywhere, never blur them)

| Label | Meaning |
|---|---|
| **VERIFIED** | The owner ran a check query and pasted the result in a chat (date given). Safe to build on. |
| **REPORTED** | An earlier note or chat says it was done, but nobody re-checked it. Treat as likely, verify before depending on it. |
| **UNVERIFIED** | Written by an AI, or assumed. Do not build on it. |
| **NOT RUN** | A migration file exists but the owner has not confirmed running it. |

Never write "the table has X" or "this runs" without one of these labels.

---

## 2. THE RULES

### MUST (always)

1. **Check before you change.** Ask the owner to run a read-only check query and paste the result. Do not write SQL about existing objects from memory.
2. **Edit, do not replace.** To change an existing function, get its current text first (`select pg_get_functiondef('public.<name>(<args>)'::regprocedure);`), then make small marked changes. Never swap in a different version.
3. **Every change is a numbered, idempotent migration file** in `supabase/migrations/NN_name.sql` (`if not exists`, `create or replace`, `drop ... if exists`). Top of the file: what it does, why, what it assumes. Log it in section 6 with its status.
4. **RLS on for every table in `public`.** Default deny. One policy per action (select / insert / update / delete), each with explicit roles (`to authenticated` or `to anon`). Use `(select auth.uid())`, not bare `auth.uid()`.
5. **Writes that have rules go through an RPC** (a Postgres function): validate inputs, check `auth.uid()`, compute prices/status/coordinates on the server. The app never writes those columns directly.
6. **`security definer` functions must `set search_path`** and must `revoke ... from public, anon` then `grant execute ... to authenticated` explicitly.
7. **Sensitive data goes in a private table** with an owner-only select policy (like `host_private`, `host_identity`, `listing_private`). Tables with public select (`ventures`, `listings`, `media`, `reviews`) must never hold phone numbers, IDs or exact addresses.
8. **Column grants for fields a user must not set** (`ventures.is_verified`, booking `status`, ...). RLS limits rows, not columns.
9. **Never trust a value from the app** for money, status, verification, ownership, or location precision. Recompute or reject on the server.
10. **Views use `security_invoker = true`**, otherwise they bypass RLS.
11. **Storage:** one folder per user (`<user-id>/...`) with policies on `storage.objects` that check `(storage.foldername(name))[1] = (select auth.uid())::text`. Private documents (ID photos, later) go in a PRIVATE bucket.
12. **After every DB change** give a verification query with the expected result, then update section 4 (registry), section 6 (migration log) and `buildLog.md` in the same session.
13. **Test policies by simulating roles** (`set local role anon` / `authenticated` with JWT claims; see `AFRICAN_SPACES_PROJECT_NOTES` section 6.5). The SQL editor bypasses RLS, so "it works in the editor" proves nothing.

### MUST NOT (never)

1. Never put the `service_role` key in the app, in `.env` files shipped to the phone, or ask the owner to. Only the publishable (anon) key is allowed in the app.
2. Never disable RLS, and never write `using (true)` / `with check (true)` on insert/update/delete policies "to make it work".
3. Never store full ID numbers, card data, passwords or tokens in tables. Only the last 4 digits and a server-side keyed hash.
4. Never use `user_metadata` for authorization (the user can edit it). Use `app_metadata`, a table, or `auth.uid()` joins.
5. Never run or ship destructive SQL (`drop table/column`, `delete`, `truncate`, `drop policy` without recreating) unless the owner explicitly asked, with a plain-language warning first. Test/reset helpers go in comments, clearly marked.
6. Never make a function callable by `anon` unless that is the point, and say so.
7. Never rename or reuse an id that is already stored in data (amenity ids, status strings) without a data migration.
8. Never tell the owner a statement "should be fine" if it touches security. Say what you did not verify.
9. Never rely on app-side checks, hidden buttons or hidden tabs as security. They are UX only.
10. Never write a migration that replaces a function/policy without first seeing the current one (rule MUST 2).

### Working with the SQL editor (tips for the owner)

- The editor shows only the result of the LAST query in the box. To run checks, run them one at a time, or join them with `union all`.
- "Success. No rows returned" is the normal result for create/alter statements.
- If a migration errors, stop. Do not run it again or run parts of it. Send a screenshot.
- Policies and functions do not show up in the table editor; look in Database > Policies / Functions, or query `pg_policies` / `pg_proc`.

### Translating from ORM thinking (SQLAlchemy / Alembic)

| ORM world | Supabase / Postgres here |
|---|---|
| Model class | Table (`create table`) |
| Alembic migration | A `.sql` file in `supabase/migrations/`, run by hand in the SQL editor (nothing runs it automatically) |
| Relationship / ForeignKey | `references other_table(id)` + `on delete cascade/set null` |
| Permission checks in the service layer | **RLS policies** (the database filters rows per user) |
| Service function / business logic | **RPC**: a Postgres function called with `supabase.rpc("name", {...})`, runs as ONE transaction |
| `session.commit()` / rollback | A function body is one transaction: an error rolls back everything |
| Query builder | `supabase.from("table").select(...).eq(...)` (PostgREST); RLS applies to every call |
| Admin / superuser session | The SQL editor (`postgres` role) and the `service_role` key: both bypass RLS. Never in the app |

---

## 3. Roles you will see

`anon` = signed out (guests browsing). `authenticated` = signed in. `service_role` / `postgres` = bypass RLS (SQL editor, server functions only).
`auth.uid()` = the signed-in user's id (null for guests).

---

## 4. Live schema registry

### 4.1 VERIFIED on 2026-10-29 (the owner ran queries and pasted results)

**Storage buckets:** `avatars` (private), `listing-media` (public).
**Functions in `public`:** `publish_listing(p jsonb) returns jsonb` (security definer; full text seen), `search_places`. NOT present at that time: `refresh_venture_verification`.
**Tables present:** `host_private`, `listing_private`, `places`. NOT present at that time: `host_identity`.

| Table | Columns seen |
|---|---|
| `host_private` | `user_id uuid`, `contact_phone text`, `contact_email text`, `created_at timestamptz` |
| `listing_private` | `listing_id uuid`, `street_address text`, `building_name text`, `unit text`, `landmark text`, `exact_latitude double`, `exact_longitude double`, `created_at timestamptz` |
| `listings` | `id uuid`, `venture_id uuid`, `title text`, `type text`, `description text`, `price numeric`, `max_guests int`, `bedrooms int`, `beds int`, `bathrooms int`, `amenities jsonb`, `guest_access text`, `address text`, `latitude double`, `longitude double`, `region text`, `area text`, `area_pending boolean`, `country text`, `place_id bigint`, `check_in_time time`, `check_out_time time`, `is_active boolean`, `created_at timestamptz` |
| `ventures` | `id uuid`, `admin_id uuid`, `venture_name text`, `description text`, `phone text`, `is_verified boolean`, `cover_media_id uuid`, `created_at timestamptz` |

Notes:
- `listings.area_pending` is the database name of the app's `area_is_new` (the function maps it).
- `ventures.phone` exists and `ventures` is publicly readable: **never write a phone number into it.**
- `publish_listing` behaviour (VERIFIED by reading its text): checks sign-in; returns the existing listing on a retry with the same id; validates the listing; reuses the host's venture or creates one (first time); writes `host_private`, `host_identity`, `listing_private`, `media`, `listing_media`; sets the listing `is_active = venture.is_verified`; rounds public coordinates to 2 decimals; checks photo paths start with the caller's user id. Whether it has ever run successfully is **UNVERIFIED** (it needs `host_identity`).

### 4.2 REPORTED (earlier notes say done, not re-checked)

From `AFRICAN_SPACES_PROJECT_NOTES` and the SQL files in `src/constants/schemas/database_schemas/`:
- Tables: `profiles`, `ventures`, `listings`, `media`, `listing_media` (with `is_cover`), `availability`, `bookings`, `reviews`, `reports`, `conversations`, `messages` (definitions in `tabels.sql`).
- RLS enabled and the policies in `rls_policies.sql` (notes section 6.2: "run by you").
- View `listing_cards` with `security_invoker = true` (notes section 7.3).
- Seed data: 70 listings under the owner's account, venture "Okello Stays" (notes section 8; marked unconfirmed there).

### 4.3 UNVERIFIED / unknown (do not build on these; check first)

- Whether `listing_media.position` exists (the existing `publish_listing` writes it; migration 05 adds it if missing).
- The RLS state and policies on `host_private` and `listing_private`.
- Storage policies on `storage.objects` for `listing-media` (migration 05 creates folder-scoped ones only if none mention the bucket).
- The hardening from the project notes section 6.3 (column grants on `ventures`, bookings RPC/trigger, review/conversation policies, active-only listings policy). Written, never confirmed.
- RLS on `profiles` (will hold phone/ID/date of birth later).
- The profiles trigger that creates a row on signup.

**A first task for any AI doing DB work:** ask the owner to run the checks in `AFRICAN_SPACES_PROJECT_NOTES` Appendix A and paste the results, then move items out of this section.

---

## 5. Design decisions that depend on the database (do not undo without asking)

- A venture is **verified** only when email confirmed + phone confirmed + ID check = `verified`. A server function switches it (and its waiting listings) on; the app cannot.
- An **unverified host may have one listing**; more are rejected by `publish_listing`.
- A new host's listing is saved hidden (`is_active = false`, `awaiting_verification = true` once migration 05 is run).
- **Public vs private location:** public `listings.latitude/longitude` are rounded (about 1 km); the exact address and pin live in `listing_private`.
- **Contact details and identity are private:** `host_private`, `host_identity` (the app can only read its own status).
- Publishing = photos to Storage first (own folder, retry overwrites), then ONE `publish_listing` call (all-or-nothing, retry-safe by `listing_id`).

---

## 6. Migration log (newest first)

| File | What | Status |
|---|---|---|
| `supabase/migrations/05_publish_atomic.sql` | Adds `host_identity`, `listings.awaiting_verification`, `listing_media.is_cover/position`, `refresh_venture_verification()` + 2 triggers, three small changes to `publish_listing`, storage policies if none exist | **NOT RUN** (written 2026-10-29). First draft was wrong and was rewritten after the live DB was checked |
| `supabase/migrations/04_publishing.sql` (name inferred from a code comment; file not seen) | Created `publish_listing`, `host_private`, `listing_private` (and probably `places`/`search_places` setup) | **REPORTED** by existence of the objects (VERIFIED 2026-10-29) but the file itself was never seen |
| `src/constants/schemas/database_schemas/01_host_identity.sql` | `host_identity` table | **NOT RUN** as of the 2026-10-29 check (table missing). Included in 05 |
| `src/constants/schemas/database_schemas/rls_policies.sql` | RLS on all tables + policies | **REPORTED** run |
| `src/constants/schemas/database_schemas/tabels.sql` | Core tables | **REPORTED** run |
| Project notes sections 5.3, 7.3, 8 | Region/area/cover columns, `listing_cards` view, seed data | **REPORTED** (seed marked unconfirmed in the notes) |
| Project notes section 6.3 | RLS hardening | **UNVERIFIED** (written, never confirmed) |

Rule: a migration is "RUN" only after the owner says so AND a verification query result is pasted.

---

## 7. Checklist before you hand SQL to the owner

- [ ] I looked at the current definition (or asked for it) instead of assuming.
- [ ] The file is idempotent and has a header (what / why / assumes).
- [ ] RLS is on and policies are explicit; no `using (true)` on writes.
- [ ] Sensitive data is in a private table.
- [ ] Anything a user must not set is protected by a column grant or an RPC.
- [ ] I gave a verification query and the expected result.
- [ ] I updated sections 4 and 6 here and the changelog in `buildLog.md`.
- [ ] I said plainly what I did NOT verify.