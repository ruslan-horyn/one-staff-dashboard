-- ============================================================================
-- Migration: 20251209220747_indexes.sql
-- Purpose: Create indexes for optimal query performance
-- Tables affected: work_locations, positions, assignments, assignment_audit_log,
--                  clients, temporary_workers
-- Notes:
--   - Foreign key indexes for efficient JOINs
--   - Composite indexes for common query patterns (reports, scheduling)
--   - Partial indexes for soft-deleted records optimization
--   - GIN index for fuzzy text search on workers
-- ============================================================================

-- ===================
-- Foreign Key Indexes
-- ===================
-- PostgreSQL does not automatically create indexes on foreign key columns
-- These indexes are essential for JOIN performance

-- work_locations: index on client_id for client->locations queries
create index idx_work_locations_client_id on work_locations(client_id);

-- positions: index on work_location_id for location->positions queries
create index idx_positions_work_location_id on positions(work_location_id);

-- assignments: indexes on all foreign keys
create index idx_assignments_worker_id on assignments(worker_id);
create index idx_assignments_position_id on assignments(position_id);
create index idx_assignments_created_by on assignments(created_by);

-- assignment_audit_log: indexes for common queries
create index idx_audit_log_assignment_id on assignment_audit_log(assignment_id);
create index idx_audit_log_performed_by on assignment_audit_log(performed_by);

-- ===================
-- Composite Indexes for Reports
-- ===================
-- Optimized for common query patterns in the application

-- main index for worker assignment queries with date ranges
-- used by: worker schedule view, availability checks, hours reports
create index idx_assignments_worker_dates on assignments(worker_id, start_at, end_at);

-- index for position-based queries
-- used by: position schedule view, seeing who's assigned to a position
create index idx_assignments_position_start on assignments(position_id, start_at);

-- index for active positions at a location
-- used by: listing available positions for assignment
create index idx_positions_location_active on positions(work_location_id, is_active)
  where deleted_at is null;

-- ===================
-- Partial Indexes
-- ===================
-- Optimized indexes that only include relevant subset of data

-- index for completed assignments (hours reports optimization)
-- used by: generating worked hours reports
create index idx_assignments_completed on assignments(worker_id, start_at, end_at)
  where status = 'completed';

-- indexes for active (non-deleted) records
-- used by: all listing queries that filter out soft-deleted records
create index idx_clients_active on clients(id)
  where deleted_at is null;

create index idx_work_locations_active on work_locations(client_id)
  where deleted_at is null;

create index idx_positions_active on positions(work_location_id)
  where deleted_at is null;

create index idx_temporary_workers_active on temporary_workers(id)
  where deleted_at is null;

-- ===================
-- GIN Index for Fuzzy Search
-- ===================
-- Trigram-based index for fast fuzzy text search on workers
-- used by: worker search feature (searching by name or phone)
create index idx_workers_search on temporary_workers
  using gin ((first_name || ' ' || last_name || ' ' || phone) gin_trgm_ops)
  where deleted_at is null;

-- ===================
-- Audit Log Chronological Index
-- ===================
-- index for viewing audit logs in reverse chronological order
-- used by: audit log viewer, recent activity displays
create index idx_audit_log_created_at on assignment_audit_log(created_at desc);
