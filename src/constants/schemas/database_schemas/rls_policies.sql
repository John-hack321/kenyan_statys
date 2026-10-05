-- =========================================================
-- ENABLE RLS ON EVERY NEW TABLE
-- =========================================================
alter table ventures enable row level security;
alter table listings enable row level security;
alter table media enable row level security;
alter table listing_media enable row level security;
alter table availability enable row level security;
alter table bookings enable row level security;
alter table reviews enable row level security;
alter table reports enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;

-- =========================================================
-- VENTURES — anyone can view, only the owner can manage
-- =========================================================
create policy "Public can view ventures"
    on ventures for select
    using (true);

create policy "Owner can insert own venture"
    on ventures for insert
    to authenticated
    with check (admin_id = auth.uid());

create policy "Owner can update own venture"
    on ventures for update
    to authenticated
    using (admin_id = auth.uid());

create policy "Owner can delete own venture"
    on ventures for delete
    to authenticated
    using (admin_id = auth.uid());

-- =========================================================
-- LISTINGS — anyone can view, only the owning venture's admin can manage
-- =========================================================
create policy "Public can view listings"
    on listings for select
    using (true)  ;

create policy "Venture owner can insert listing"
    on listings for insert
    to authenticated
    with check (
        exists (select 1 from ventures v where v.id = venture_id and v.admin_id = auth.uid())
    );

create policy "Venture owner can update listing"
    on listings for update
    to authenticated
    using (
        exists (select 1 from ventures v where v.id = venture_id and v.admin_id = auth.uid())
    );

create policy "Venture owner can delete listing"
    on listings for delete
    to authenticated
    using (
        exists (select 1 from ventures v where v.id = venture_id and v.admin_id = auth.uid())
    );

-- =========================================================
-- MEDIA — anyone can view, only the owning venture's admin can manage
-- =========================================================
create policy "Public can view media"
    on media for select
    using (true);

create policy "Venture owner can manage media"
    on media for all
    to authenticated
    using (
        exists (select 1 from ventures v where v.id = venture_id and v.admin_id = auth.uid())
    )
    with check (
        exists (select 1 from ventures v where v.id = venture_id and v.admin_id = auth.uid())
    );

-- =========================================================
-- LISTING_MEDIA — anyone can view, only the listing's venture admin can link/unlink
-- =========================================================
create policy "Public can view listing_media"
  on listing_media for select
  using (true);

create policy "Venture owner can manage listing_media"
  on listing_media for all
  to authenticated
  using (
    exists (
      select 1 from listings l
      join ventures v on v.id = l.venture_id
      where l.id = listing_id and v.admin_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from listings l
      join ventures v on v.id = l.venture_id
      where l.id = listing_id and v.admin_id = auth.uid()
    )
  );

-- =========================================================
-- AVAILABILITY — anyone can view (so guests see blocked dates),
-- only the listing's venture admin can manage
-- =========================================================
create policy "Public can view availability"
  on availability for select
  using (true);

create policy "Venture owner can manage availability"
  on availability for all
  to authenticated
  using (
    exists (
      select 1 from listings l
      join ventures v on v.id = l.venture_id
      where l.id = listing_id and v.admin_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from listings l
      join ventures v on v.id = l.venture_id
      where l.id = listing_id and v.admin_id = auth.uid()
    )
  );

-- =========================================================
-- BOOKINGS — only the guest who made it, or the host who owns the listing, can see it
-- =========================================================
create policy "Guest or host can view booking"
  on bookings for select
  to authenticated
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from listings l
      join ventures v on v.id = l.venture_id
      where l.id = listing_id and v.admin_id = auth.uid()
    )
  );

create policy "Guest can create own booking"
  on bookings for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "Guest or host can update booking"
  on bookings for update
  to authenticated
  using (
    profile_id = auth.uid()
    or exists (
      select 1 from listings l
      join ventures v on v.id = l.venture_id
      where l.id = listing_id and v.admin_id = auth.uid()
    )
  );

-- =========================================================
-- REVIEWS — anyone can view, only the author can write/edit their own
-- =========================================================
create policy "Public can view reviews"
  on reviews for select
  using (true);

create policy "Author can insert own review"
  on reviews for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "Author can update own review"
  on reviews for update
  to authenticated
  using (profile_id = auth.uid());

create policy "Author can delete own review"
  on reviews for delete
  to authenticated
  using (profile_id = auth.uid());

-- =========================================================
-- REPORTS — only the reporter can see/create their own report
-- =========================================================
create policy "Reporter can view own report"
  on reports for select
  to authenticated
  using (reporter_id = auth.uid());

create policy "User can file a report"
  on reports for insert
  to authenticated
  with check (reporter_id = auth.uid());

-- =========================================================
-- CONVERSATIONS — only the two participants can see/create it
-- =========================================================
create policy "Participant can view conversation"
  on conversations for select
  to authenticated
  using (guest_id = auth.uid() or host_id = auth.uid());

create policy "Participant can create conversation"
  on conversations for insert
  to authenticated
  with check (guest_id = auth.uid() or host_id = auth.uid());

-- =========================================================
-- MESSAGES — only participants of the parent conversation can see/send
-- =========================================================
create policy "Participant can view messages"
  on messages for select
  to authenticated
  using (
    exists (
      select 1 from conversations c
      where c.id = conversation_id
      and (c.guest_id = auth.uid() or c.host_id = auth.uid())
    )
  );

create policy "Participant can send message"
  on messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from conversations c
      where c.id = conversation_id
      and (c.guest_id = auth.uid() or c.host_id = auth.uid())
    )
  );