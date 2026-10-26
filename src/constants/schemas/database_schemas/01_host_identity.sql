-- =========================================================
-- HOST IDENTITY: the private record of "who is this host, and did we confirm it?"
-- Run in the Supabase SQL Editor. Safe to run again.
--
-- Rules this table follows:
--   * It is NOT the public profile. Guests can never read it.
--   * The app can only READ the host's own status. Nothing can be written from the app,
--     so nobody can mark themselves "verified". The verification function (service role) writes it.
--   * The full ID number is NOT stored. We keep the last 4 digits for display, and a keyed hash
--     (made on the server) so the same ID can't be used on many accounts.
-- =========================================================

create table if not exists host_identity (
  user_id             uuid primary key references auth.users(id) on delete cascade,
  legal_first_name    text not null check (char_length(legal_first_name) between 2 and 40),
  legal_last_name     text not null check (char_length(legal_last_name)  between 2 and 40),
  id_country          text not null check (char_length(id_country) = 2),
  id_type             text not null check (id_type in ('national_id', 'passport', 'resident_id')),
  id_last4            text check (char_length(id_last4) <= 4),
  id_fingerprint      text unique,                 -- keyed hash of the ID number, never shown to the app
  status              text not null default 'pending' check (status in ('pending', 'verified', 'failed', 'needs_review')),
  provider            text,                        -- which verification service answered
  provider_reference  text,
  failure_reason      text,                        -- for our team, never shown to the app
  verified_at         timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table host_identity enable row level security;

-- start from nothing, then give back only what the app needs
revoke all on host_identity from anon, authenticated;

-- the host may read these columns of THEIR OWN row (never the fingerprint, provider or failure reason)
grant select (user_id, legal_first_name, legal_last_name, id_country, id_type, id_last4, status, verified_at, created_at)
  on host_identity to authenticated;

drop policy if exists "Host can read own identity status" on host_identity;
create policy "Host can read own identity status" on host_identity
  for select to authenticated
  using (user_id = (select auth.uid()));

-- no insert / update / delete policy and no grant: only the service role (the verification function) can write.
