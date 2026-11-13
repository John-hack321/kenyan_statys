-- =========================================================
-- 06_otp_codes.sql   (NOT RUN. Written by Claude, 2026-11-10)
--
-- WHAT: the storage behind our own one-time codes (confirm a host's phone or email).
--   * table  otp_codes     : one row per code we sent. Stores a HASH of the code, never the code itself.
--   * function consume_otp : checks a typed code against the newest usable row, atomically.
--
-- WHY: Supabase's built-in phone confirmation needs an SMS provider, which we do not have yet.
--      This keeps the whole flow ours, so later only the "send" step changes (see _shared/deliver.ts).
--
-- WHO TOUCHES IT: only the Edge Functions send-otp and verify-otp, with the service role.
--      The app (anon / authenticated) can read and write NOTHING here. That is on purpose:
--      RLS is ON and there are deliberately NO policies = default deny. Revoking the table grants is a
--      second lock on the same door.
--
-- ASSUMES: auth.users exists (it does on every Supabase project). Nothing else.
-- SAFE TO RUN TWICE: every statement is "if not exists" / "create or replace". No drops, no deletes.
-- =========================================================

create table if not exists otp_codes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  channel     text not null check (channel in ('phone', 'email')),
  target      text not null check (char_length(target) between 3 and 254),   -- E.164 phone or lower-case email
  code_hash   text not null,                                                  -- HMAC of the code, see _shared/otp.ts
  attempts    int  not null default 0,                                        -- wrong guesses so far
  expires_at  timestamptz not null,
  consumed_at timestamptz,                                                    -- set when used, replaced by a newer code, or locked
  created_at  timestamptz not null default now()
);

alter table otp_codes enable row level security;
revoke all on otp_codes from anon, authenticated;
grant all on otp_codes to service_role; -- service role is the used by admin I guess to have system wide access to all tables.  = > it bypasses all rls rules . 

-- the two questions the rate limiter asks: "how many codes did this user / this target get recently?"
create index if not exists otp_codes_user_idx   on otp_codes (user_id, channel, created_at desc);
create index if not exists otp_codes_target_idx on otp_codes (channel, target, created_at desc);

-- ---------------------------------------------------------
-- consume_otp: ONE transaction that (1) finds the newest usable code, (2) locks it, (3) counts a wrong
-- guess or accepts a right one. Locking matters: without it, someone could fire 50 guesses at the same
-- moment and each would see "0 attempts used". With `for update` they queue up one behind the other.
--
-- It RETURNS a status instead of raising an error, because an error would roll the transaction back and
-- erase the wrong-guess count.
--   {status:'ok'}                         right code, now used up
--   {status:'wrong', attempts_left: n}    wrong code, n tries left
--   {status:'locked'}                     too many wrong codes, this code is dead (ask for a new one)
--   {status:'none'}                       no usable code (never sent, expired, already used, other target)
--
-- It is NOT security definer: only service_role may run it, and service_role can already reach the table.
-- If somebody grants it to the app by mistake, it just fails (the app has no table access). Safe by default.
-- ---------------------------------------------------------
create or replace function consume_otp(
  p_user_id      uuid,
  p_channel      text,
  p_target       text,
  p_code_hash    text,
  p_max_attempts int default 5
) returns jsonb
language plpgsql
set search_path = public
as $$
declare
  v_row otp_codes%rowtype;
begin
  select * into v_row
  from otp_codes
  where user_id = p_user_id
    and channel = p_channel
    and target = p_target
    and consumed_at is null
    and expires_at > now()
  order by created_at desc
  limit 1
  for update;

  if not found then
    return jsonb_build_object('status', 'none');
  end if;

  if v_row.code_hash = p_code_hash then
    update otp_codes set consumed_at = now() where id = v_row.id;
    return jsonb_build_object('status', 'ok');
  end if;

  if v_row.attempts + 1 >= p_max_attempts then
    update otp_codes set attempts = attempts + 1, consumed_at = now() where id = v_row.id;
    return jsonb_build_object('status', 'locked');
  end if;

  update otp_codes set attempts = attempts + 1 where id = v_row.id;
  return jsonb_build_object('status', 'wrong', 'attempts_left', p_max_attempts - (v_row.attempts + 1));
end $$;

revoke all on function consume_otp(uuid, text, text, text, int) from public, anon, authenticated;
grant execute on function consume_otp(uuid, text, text, text, int) to service_role;

-- ---------------------------------------------------------
-- VERIFY after running (run each separately; the editor shows only the last result):
--   1) select relname, relrowsecurity from pg_class where relname = 'otp_codes';
--        expect: otp_codes | true
--   2) select count(*) from pg_policies where tablename = 'otp_codes';
--        expect: 0   (no policies on purpose)
--   3) select grantee, privilege_type from information_schema.role_table_grants
--      where table_name = 'otp_codes' and grantee in ('anon','authenticated');
--        expect: no rows
--   4) select has_function_privilege('authenticated', 'consume_otp(uuid,text,text,text,int)', 'execute');
--        expect: false
-- ---------------------------------------------------------