-- ============================================================================
-- Migration: 20260414000000_create_waitlist_subscribers.sql
-- Purpose: Create waitlist subscribers table for landing page email signup
-- Tables created:
--   - waitlist_subscribers (email waitlist for product launch)
-- Notes:
--   - RLS enabled with policies for anonymous insert and authenticated read
--   - source field tracks signup origin (hero section, CTA, etc.)
-- ============================================================================

-- ==========================
-- Table: waitlist_subscribers
-- ==========================
-- Email waitlist for product launch notifications
-- Allows anonymous users to sign up and coordinators to view submissions
create table waitlist_subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       varchar(255) not null unique,
  source      varchar(100),
  created_at  timestamptz not null default now()
);

alter table waitlist_subscribers enable row level security;

create policy waitlist_subscribers_insert_anon
  on waitlist_subscribers
  for insert
  to anon
  with check (true);

create policy waitlist_subscribers_select_authenticated
  on waitlist_subscribers
  for select
  to authenticated
  using (true);

comment on table waitlist_subscribers is 'Email waitlist for product launch notifications';
comment on column waitlist_subscribers.source is 'Origin of signup: hero | cta_bottom | other';
