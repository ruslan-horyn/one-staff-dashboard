-- ============================================================================
-- Migration: 20260414000000_create_waitlist_subscribers.sql
-- Purpose: Create waitlist subscribers table for landing page email signup
-- Tables created:
--   - waitlist_subscribers (email waitlist for product launch)
-- Notes:
--   - RLS enabled; INSERT allowed for both anon and authenticated, SELECT only for authenticated
--   - Email is forced to lowercase + basic format check at DB level (defence in depth)
--   - source field tracks signup origin (hero section, CTA, etc.)
-- ============================================================================

-- ==========================
-- Table: waitlist_subscribers
-- ==========================
create table waitlist_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       varchar(254) not null unique
              check (email = lower(email))
              check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  source      varchar(100),
  created_at  timestamptz not null default now()
);

alter table waitlist_subscribers enable row level security;

-- INSERT: both anonymous (typical landing page visitor) and authenticated users
-- (logged-in coordinator browsing the public landing page) can subscribe.
create policy waitlist_subscribers_insert_anon
  on waitlist_subscribers
  for insert
  to anon
  with check (true);

create policy waitlist_subscribers_insert_authenticated
  on waitlist_subscribers
  for insert
  to authenticated
  with check (true);

-- SELECT: only authenticated users (admins/coordinators) can read the list
create policy waitlist_subscribers_select_authenticated
  on waitlist_subscribers
  for select
  to authenticated
  using (true);

comment on table waitlist_subscribers is 'Email waitlist for product launch notifications';
comment on column waitlist_subscribers.source is 'Origin of signup: hero | cta_bottom | other';
