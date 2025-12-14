-- ============================================================================
-- Migration: 20251209220746_tables.sql
-- Purpose: Create all database tables for the One Staff Dashboard
-- Tables created:
--   - profiles (extends auth.users)
--   - clients (agency clients)
--   - work_locations (locations belonging to clients)
--   - positions (job positions at work locations)
--   - temporary_workers (agency temporary workers)
--   - assignments (worker to position assignments)
--   - assignment_audit_log (immutable audit trail for assignments)
-- Notes:
--   - All tables have RLS enabled by default (policies defined in separate migration)
--   - Soft delete pattern implemented for main business entities
--   - All timestamps use TIMESTAMPTZ for timezone awareness
-- ============================================================================

-- ===================
-- Table: profiles
-- ===================
-- Extends Supabase Auth users with application-specific data
-- One-to-one relationship with auth.users
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'coordinator',
  first_name varchar(100) not null,
  last_name varchar(100) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- enable rls on profiles table
-- all users need profiles, but access should be controlled
alter table profiles enable row level security;

-- add table comment for documentation
comment on table profiles is 'User profiles extending Supabase Auth with application-specific data';
comment on column profiles.role is 'User role: admin has full access, coordinator manages daily operations';

-- ===================
-- Table: clients
-- ===================
-- Stores agency client companies
-- Soft delete implemented via deleted_at column
create table clients (
  id uuid primary key default gen_random_uuid(),
  name varchar(255) not null,
  email varchar(255) not null,
  phone varchar(20) not null,
  address text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz -- soft delete: null means active, timestamp means deleted
);

-- enable rls on clients table
alter table clients enable row level security;

comment on table clients is 'Agency clients - companies that hire temporary workers';
comment on column clients.deleted_at is 'Soft delete timestamp: NULL = active, timestamp = deleted';

-- ===================
-- Table: work_locations
-- ===================
-- Physical work locations belonging to clients
-- Each client can have multiple work locations
create table work_locations (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete restrict,
  name varchar(255) not null,
  address text not null,
  email varchar(255),
  phone varchar(20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz -- soft delete
);

-- enable rls on work_locations table
alter table work_locations enable row level security;

comment on table work_locations is 'Physical work locations belonging to clients';
comment on column work_locations.client_id is 'Reference to owning client - RESTRICT delete to protect data integrity';

-- ===================
-- Table: positions
-- ===================
-- Job positions available at work locations
-- Each work location can have multiple positions
create table positions (
  id uuid primary key default gen_random_uuid(),
  work_location_id uuid not null references work_locations(id) on delete restrict,
  name varchar(255) not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz -- soft delete
);

-- enable rls on positions table
alter table positions enable row level security;

comment on table positions is 'Job positions available at work locations';
comment on column positions.is_active is 'Whether the position is currently accepting new assignments';

-- ===================
-- Table: temporary_workers
-- ===================
-- Temporary workers managed by the agency
-- These workers do not have system login access
create table temporary_workers (
  id uuid primary key default gen_random_uuid(),
  first_name varchar(100) not null,
  last_name varchar(100) not null,
  phone varchar(20) not null unique, -- unique constraint for phone
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz -- soft delete
);

-- enable rls on temporary_workers table
alter table temporary_workers enable row level security;

comment on table temporary_workers is 'Temporary workers managed by the agency - no system login access';
comment on column temporary_workers.phone is 'Phone number - unique identifier, normalized by trigger';

-- ===================
-- Table: assignments
-- ===================
-- Worker assignments to positions
-- Core business entity tracking who works where and when
-- Note: Overlapping assignments are permitted by design (coordinator responsibility)
create table assignments (
  id uuid primary key default gen_random_uuid(),
  worker_id uuid not null references temporary_workers(id) on delete restrict,
  position_id uuid not null references positions(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz, -- null means ongoing/open-ended assignment
  status assignment_status not null default 'scheduled',
  created_by uuid not null references profiles(id) on delete restrict,
  ended_by uuid references profiles(id) on delete restrict,
  cancelled_by uuid references profiles(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- constraint: end_at must be after start_at if provided
  constraint check_end_after_start check (end_at is null or end_at > start_at)
);

-- enable rls on assignments table
alter table assignments enable row level security;

comment on table assignments is 'Worker assignments to positions - core scheduling entity';
comment on column assignments.end_at is 'End timestamp - NULL means ongoing assignment';
comment on column assignments.status is 'Assignment lifecycle: scheduled -> active -> completed/cancelled';
comment on column assignments.created_by is 'Coordinator who created this assignment';
comment on column assignments.ended_by is 'Coordinator who marked assignment as completed';
comment on column assignments.cancelled_by is 'Coordinator who cancelled this assignment';

-- ===================
-- Table: assignment_audit_log
-- ===================
-- Immutable audit trail for all assignment operations
-- Append-only in normal operation (UPDATE/DELETE restricted to admin for emergencies)
create table assignment_audit_log (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  action varchar(50) not null, -- 'created', 'updated', 'ended', 'cancelled'
  old_values jsonb, -- previous state (null for create)
  new_values jsonb, -- new state (null for delete, not used in our case)
  performed_by uuid not null references profiles(id) on delete restrict,
  created_at timestamptz not null default now()
);

-- enable rls on assignment_audit_log table
alter table assignment_audit_log enable row level security;

comment on table assignment_audit_log is 'Immutable audit trail for assignment operations - append-only';
comment on column assignment_audit_log.action is 'Type of operation: created, updated, ended, cancelled';
comment on column assignment_audit_log.old_values is 'JSONB snapshot of record before change (null for create)';
comment on column assignment_audit_log.new_values is 'JSONB snapshot of record after change';
