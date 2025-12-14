-- ============================================================================
-- Migration: 20251209220749_rls_policies.sql
-- Purpose: Create Row Level Security (RLS) policies for all tables
-- Tables affected: profiles, clients, work_locations, positions,
--                  temporary_workers, assignments, assignment_audit_log
-- Notes:
--   - Policies are granular: one policy per operation (select, insert, update, delete)
--   - Policies are separated by role where applicable (anon, authenticated)
--   - Each policy includes comments explaining its purpose
--   - Admin role has elevated privileges for management operations
--   - Coordinator role can manage daily operations (workers, assignments)
-- ============================================================================

-- ===================
-- Policies for: profiles
-- ===================

-- select: all authenticated users can view all profiles
-- rationale: users need to see coordinator names, profile info for collaboration
create policy profiles_select_authenticated on profiles
  for select
  to authenticated
  using (true);

-- select: anonymous users cannot view profiles
-- rationale: profile data is only for logged-in users
create policy profiles_select_anon on profiles
  for select
  to anon
  using (false);

-- insert: users can only insert their own profile (during registration)
-- rationale: profile creation is tied to auth.users via the id foreign key
create policy profiles_insert_authenticated on profiles
  for insert
  to authenticated
  with check (id = auth.uid());

-- insert: anonymous users cannot create profiles
create policy profiles_insert_anon on profiles
  for insert
  to anon
  with check (false);

-- update: admin can update all profiles, users can update only their own
-- rationale: self-service profile updates + admin management capability
create policy profiles_update_authenticated on profiles
  for update
  to authenticated
  using (
    user_role() = 'admin' or id = auth.uid()
  );

-- update: anonymous users cannot update profiles
create policy profiles_update_anon on profiles
  for update
  to anon
  using (false);

-- delete: only admin can delete profiles (emergency/moderation use)
-- rationale: profile deletion should be rare and controlled
create policy profiles_delete_authenticated on profiles
  for delete
  to authenticated
  using (user_role() = 'admin');

-- delete: anonymous users cannot delete profiles
create policy profiles_delete_anon on profiles
  for delete
  to anon
  using (false);

-- ===================
-- Policies for: clients
-- ===================

-- select: all authenticated users can view clients
-- rationale: coordinators need client info to create assignments
create policy clients_select_authenticated on clients
  for select
  to authenticated
  using (true);

-- select: anonymous users cannot view clients
create policy clients_select_anon on clients
  for select
  to anon
  using (false);

-- insert: only admin can create clients
-- rationale: client management is an admin responsibility
create policy clients_insert_authenticated on clients
  for insert
  to authenticated
  with check (user_role() = 'admin');

-- insert: anonymous users cannot create clients
create policy clients_insert_anon on clients
  for insert
  to anon
  with check (false);

-- update: only admin can update clients
-- rationale: client data modifications are admin responsibility
create policy clients_update_authenticated on clients
  for update
  to authenticated
  using (user_role() = 'admin');

-- update: anonymous users cannot update clients
create policy clients_update_anon on clients
  for update
  to anon
  using (false);

-- delete: only admin can delete clients (soft delete via update is preferred)
-- rationale: physical deletion should be very rare
create policy clients_delete_authenticated on clients
  for delete
  to authenticated
  using (user_role() = 'admin');

-- delete: anonymous users cannot delete clients
create policy clients_delete_anon on clients
  for delete
  to anon
  using (false);

-- ===================
-- Policies for: work_locations
-- ===================

-- select: all authenticated users can view work locations
-- rationale: coordinators need location info to create assignments
create policy work_locations_select_authenticated on work_locations
  for select
  to authenticated
  using (true);

-- select: anonymous users cannot view work locations
create policy work_locations_select_anon on work_locations
  for select
  to anon
  using (false);

-- insert: only admin can create work locations
-- rationale: location management is an admin responsibility
create policy work_locations_insert_authenticated on work_locations
  for insert
  to authenticated
  with check (user_role() = 'admin');

-- insert: anonymous users cannot create work locations
create policy work_locations_insert_anon on work_locations
  for insert
  to anon
  with check (false);

-- update: only admin can update work locations
-- rationale: location data modifications are admin responsibility
create policy work_locations_update_authenticated on work_locations
  for update
  to authenticated
  using (user_role() = 'admin');

-- update: anonymous users cannot update work locations
create policy work_locations_update_anon on work_locations
  for update
  to anon
  using (false);

-- delete: only admin can delete work locations
-- rationale: physical deletion should be very rare
create policy work_locations_delete_authenticated on work_locations
  for delete
  to authenticated
  using (user_role() = 'admin');

-- delete: anonymous users cannot delete work locations
create policy work_locations_delete_anon on work_locations
  for delete
  to anon
  using (false);

-- ===================
-- Policies for: positions
-- ===================

-- select: all authenticated users can view positions
-- rationale: coordinators need position info to create assignments
create policy positions_select_authenticated on positions
  for select
  to authenticated
  using (true);

-- select: anonymous users cannot view positions
create policy positions_select_anon on positions
  for select
  to anon
  using (false);

-- insert: all authenticated users (coordinators and admins) can create positions
-- rationale: coordinators can add positions as part of daily operations
create policy positions_insert_authenticated on positions
  for insert
  to authenticated
  with check (true);

-- insert: anonymous users cannot create positions
create policy positions_insert_anon on positions
  for insert
  to anon
  with check (false);

-- update: all authenticated users can update positions
-- rationale: coordinators can modify positions (activate/deactivate, rename)
create policy positions_update_authenticated on positions
  for update
  to authenticated
  using (true);

-- update: anonymous users cannot update positions
create policy positions_update_anon on positions
  for update
  to anon
  using (false);

-- delete: all authenticated users can delete positions (soft delete preferred)
-- rationale: coordinators may need to remove positions they created
create policy positions_delete_authenticated on positions
  for delete
  to authenticated
  using (true);

-- delete: anonymous users cannot delete positions
create policy positions_delete_anon on positions
  for delete
  to anon
  using (false);

-- ===================
-- Policies for: temporary_workers
-- ===================

-- select: all authenticated users can view workers
-- rationale: coordinators need worker info to create assignments
create policy workers_select_authenticated on temporary_workers
  for select
  to authenticated
  using (true);

-- select: anonymous users cannot view workers
create policy workers_select_anon on temporary_workers
  for select
  to anon
  using (false);

-- insert: all authenticated users can create workers
-- rationale: coordinators onboard new temporary workers
create policy workers_insert_authenticated on temporary_workers
  for insert
  to authenticated
  with check (true);

-- insert: anonymous users cannot create workers
create policy workers_insert_anon on temporary_workers
  for insert
  to anon
  with check (false);

-- update: all authenticated users can update workers
-- rationale: coordinators update worker info (contact details, etc.)
create policy workers_update_authenticated on temporary_workers
  for update
  to authenticated
  using (true);

-- update: anonymous users cannot update workers
create policy workers_update_anon on temporary_workers
  for update
  to anon
  using (false);

-- delete: all authenticated users can delete workers (soft delete preferred)
-- rationale: coordinators may need to remove workers
create policy workers_delete_authenticated on temporary_workers
  for delete
  to authenticated
  using (true);

-- delete: anonymous users cannot delete workers
create policy workers_delete_anon on temporary_workers
  for delete
  to anon
  using (false);

-- ===================
-- Policies for: assignments
-- ===================

-- select: all authenticated users can view assignments
-- rationale: coordinators need to see all assignments for scheduling
create policy assignments_select_authenticated on assignments
  for select
  to authenticated
  using (true);

-- select: anonymous users cannot view assignments
create policy assignments_select_anon on assignments
  for select
  to anon
  using (false);

-- insert: all authenticated users can create assignments
-- rationale: coordinators create worker assignments as core functionality
create policy assignments_insert_authenticated on assignments
  for insert
  to authenticated
  with check (true);

-- insert: anonymous users cannot create assignments
create policy assignments_insert_anon on assignments
  for insert
  to anon
  with check (false);

-- update: all authenticated users can update assignments
-- rationale: coordinators modify assignments (end, update status)
create policy assignments_update_authenticated on assignments
  for update
  to authenticated
  using (true);

-- update: anonymous users cannot update assignments
create policy assignments_update_anon on assignments
  for update
  to anon
  using (false);

-- delete: only admin can physically delete assignments
-- rationale: cancellation is done via status change, physical delete is rare
create policy assignments_delete_authenticated on assignments
  for delete
  to authenticated
  using (user_role() = 'admin');

-- delete: anonymous users cannot delete assignments
create policy assignments_delete_anon on assignments
  for delete
  to anon
  using (false);

-- ===================
-- Policies for: assignment_audit_log
-- ===================
-- Note: This is an append-only table in normal operation
-- UPDATE and DELETE are restricted to admin for emergency use only

-- select: all authenticated users can view audit logs
-- rationale: audit transparency - coordinators can see what happened
create policy audit_log_select_authenticated on assignment_audit_log
  for select
  to authenticated
  using (true);

-- select: anonymous users cannot view audit logs
create policy audit_log_select_anon on assignment_audit_log
  for select
  to anon
  using (false);

-- insert: all authenticated users can create audit log entries
-- rationale: audit entries are created automatically by triggers
create policy audit_log_insert_authenticated on assignment_audit_log
  for insert
  to authenticated
  with check (true);

-- insert: anonymous users cannot create audit log entries
create policy audit_log_insert_anon on assignment_audit_log
  for insert
  to anon
  with check (false);

-- update: only admin can update audit logs (emergency corrections only)
-- rationale: audit log should be immutable in normal operation
-- WARNING: use with extreme caution - audit integrity is critical
create policy audit_log_update_authenticated on assignment_audit_log
  for update
  to authenticated
  using (user_role() = 'admin');

-- update: anonymous users cannot update audit logs
create policy audit_log_update_anon on assignment_audit_log
  for update
  to anon
  using (false);

-- delete: only admin can delete audit logs (emergency use only)
-- rationale: audit log should be immutable in normal operation
-- WARNING: use with extreme caution - audit integrity is critical
create policy audit_log_delete_authenticated on assignment_audit_log
  for delete
  to authenticated
  using (user_role() = 'admin');

-- delete: anonymous users cannot delete audit logs
create policy audit_log_delete_anon on assignment_audit_log
  for delete
  to anon
  using (false);
