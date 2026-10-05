-- =========================================================
-- BNB KENYA — CORE SCHEMA
-- Run this in the Supabase SQL Editor.
-- profiles table already exists and is left untouched.
-- =========================================================

-- ---------- VENTURES ----------
create table ventures (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references profiles(id) on delete cascade,
  venture_name text not null,
  description text,
  phone text,
  is_verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (admin_id) -- enforces: one venture per user
);

-- ---------- LISTINGS ----------
create table listings (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references ventures(id) on delete cascade,
  title text not null,
  type text not null, -- e.g. 'bedsitter', 'one_bedroom'
  description text,
  price numeric(10, 2) not null,
  max_guests int default 1,
  bedrooms int default 1,
  bathrooms int default 1,
  amenities jsonb default '[]',
  address text,
  latitude double precision,
  longitude double precision,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------- MEDIA (venture's shared library) ----------
create table media (
  id uuid primary key default gen_random_uuid(),
  venture_id uuid not null references ventures(id) on delete cascade,
  type text not null default 'image', -- 'image' | 'video'
  storage_path text not null,
  is_cover boolean default false,
  position int default 0,
  created_at timestamptz not null default now()
);

-- junction table: lets many listings reuse the same media
create table listing_media (
  listing_id uuid not null references listings(id) on delete cascade,
  media_id uuid not null references media(id) on delete cascade,
  primary key (listing_id, media_id)
);

-- ---------- AVAILABILITY (host-blocked dates) ----------
create table availability (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  date date not null,
  status text not null default 'blocked', -- 'blocked' | 'available'
  unique (listing_id, date)
);

-- ---------- BOOKINGS ----------
create table bookings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  check_in date not null,
  check_out date not null,
  guests_count int default 1,
  total_price numeric(10, 2),
  status text not null default 'pending', -- pending/confirmed/paid/cancelled/completed
  created_at timestamptz not null default now()
);

-- ---------- REVIEWS (rating + review text combined) ----------
create table reviews (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  booking_id uuid references bookings(id) on delete set null, -- ties review to a real stay
  listing_id uuid references listings(id) on delete cascade,
  venture_id uuid references ventures(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  review_text text,
  created_at timestamptz not null default now()
);

-- ---------- REPORTS (trust & safety) ----------
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  reported_type text not null, -- 'listing' | 'venture' | 'user'
  reported_id uuid not null,
  reason text not null,
  status text not null default 'open', -- open/reviewed/closed
  created_at timestamptz not null default now()
);

-- ---------- MESSAGING ----------
create table conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid references listings(id) on delete set null,
  guest_id uuid not null references profiles(id) on delete cascade,
  host_id uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- =========================================================
-- INDEXES worth adding now (cheap, saves pain later)
-- =========================================================
create index on listings (venture_id);
create index on listings (latitude, longitude);
create index on bookings (listing_id);
create index on bookings (profile_id);
create index on reviews (listing_id);
create index on reviews (venture_id);
create index on messages (conversation_id);