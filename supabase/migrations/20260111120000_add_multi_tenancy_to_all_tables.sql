-- ============================================================================
-- Migration: add_multi_tenancy_to_all_tables
-- Purpose: Add organization_id to clients and temporary_workers tables,
--          update RLS policies for proper multi-tenant data isolation
-- ============================================================================

-- ===================
-- Phase 1: Add organization_id to clients table
-- ===================
ALTER TABLE public.clients
ADD COLUMN organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT;

CREATE INDEX idx_clients_organization_id ON public.clients(organization_id);

COMMENT ON COLUMN public.clients.organization_id IS 'Organization that owns this client - enables multi-tenant isolation';

-- ===================
-- Phase 2: Add organization_id to temporary_workers table
-- ===================
ALTER TABLE public.temporary_workers
ADD COLUMN organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT;

CREATE INDEX idx_workers_organization_id ON public.temporary_workers(organization_id);

COMMENT ON COLUMN public.temporary_workers.organization_id IS 'Organization that owns this worker - enables multi-tenant isolation';

-- ===================
-- Phase 3: Drop old RLS policies for clients
-- ===================
DROP POLICY IF EXISTS clients_select_authenticated ON public.clients;
DROP POLICY IF EXISTS clients_select_anon ON public.clients;
DROP POLICY IF EXISTS clients_insert_authenticated ON public.clients;
DROP POLICY IF EXISTS clients_insert_anon ON public.clients;
DROP POLICY IF EXISTS clients_update_authenticated ON public.clients;
DROP POLICY IF EXISTS clients_update_anon ON public.clients;
DROP POLICY IF EXISTS clients_delete_authenticated ON public.clients;
DROP POLICY IF EXISTS clients_delete_anon ON public.clients;

-- ===================
-- Phase 4: Drop old RLS policies for work_locations
-- ===================
DROP POLICY IF EXISTS work_locations_select_authenticated ON public.work_locations;
DROP POLICY IF EXISTS work_locations_select_anon ON public.work_locations;
DROP POLICY IF EXISTS work_locations_insert_authenticated ON public.work_locations;
DROP POLICY IF EXISTS work_locations_insert_anon ON public.work_locations;
DROP POLICY IF EXISTS work_locations_update_authenticated ON public.work_locations;
DROP POLICY IF EXISTS work_locations_update_anon ON public.work_locations;
DROP POLICY IF EXISTS work_locations_delete_authenticated ON public.work_locations;
DROP POLICY IF EXISTS work_locations_delete_anon ON public.work_locations;

-- ===================
-- Phase 5: Drop old RLS policies for positions
-- ===================
DROP POLICY IF EXISTS positions_select_authenticated ON public.positions;
DROP POLICY IF EXISTS positions_select_anon ON public.positions;
DROP POLICY IF EXISTS positions_insert_authenticated ON public.positions;
DROP POLICY IF EXISTS positions_insert_anon ON public.positions;
DROP POLICY IF EXISTS positions_update_authenticated ON public.positions;
DROP POLICY IF EXISTS positions_update_anon ON public.positions;
DROP POLICY IF EXISTS positions_delete_authenticated ON public.positions;
DROP POLICY IF EXISTS positions_delete_anon ON public.positions;

-- ===================
-- Phase 6: Drop old RLS policies for temporary_workers
-- ===================
DROP POLICY IF EXISTS workers_select_authenticated ON public.temporary_workers;
DROP POLICY IF EXISTS workers_select_anon ON public.temporary_workers;
DROP POLICY IF EXISTS workers_insert_authenticated ON public.temporary_workers;
DROP POLICY IF EXISTS workers_insert_anon ON public.temporary_workers;
DROP POLICY IF EXISTS workers_update_authenticated ON public.temporary_workers;
DROP POLICY IF EXISTS workers_update_anon ON public.temporary_workers;
DROP POLICY IF EXISTS workers_delete_authenticated ON public.temporary_workers;
DROP POLICY IF EXISTS workers_delete_anon ON public.temporary_workers;

-- ===================
-- Phase 7: Drop old RLS policies for assignments
-- ===================
DROP POLICY IF EXISTS assignments_select_authenticated ON public.assignments;
DROP POLICY IF EXISTS assignments_select_anon ON public.assignments;
DROP POLICY IF EXISTS assignments_insert_authenticated ON public.assignments;
DROP POLICY IF EXISTS assignments_insert_anon ON public.assignments;
DROP POLICY IF EXISTS assignments_update_authenticated ON public.assignments;
DROP POLICY IF EXISTS assignments_update_anon ON public.assignments;
DROP POLICY IF EXISTS assignments_delete_authenticated ON public.assignments;
DROP POLICY IF EXISTS assignments_delete_anon ON public.assignments;

-- ===================
-- Phase 8: Drop old RLS policies for assignment_audit_log
-- ===================
DROP POLICY IF EXISTS audit_log_select_authenticated ON public.assignment_audit_log;
DROP POLICY IF EXISTS audit_log_select_anon ON public.assignment_audit_log;
DROP POLICY IF EXISTS audit_log_insert_authenticated ON public.assignment_audit_log;
DROP POLICY IF EXISTS audit_log_insert_anon ON public.assignment_audit_log;
DROP POLICY IF EXISTS audit_log_update_authenticated ON public.assignment_audit_log;
DROP POLICY IF EXISTS audit_log_update_anon ON public.assignment_audit_log;
DROP POLICY IF EXISTS audit_log_delete_authenticated ON public.assignment_audit_log;
DROP POLICY IF EXISTS audit_log_delete_anon ON public.assignment_audit_log;

-- ============================================================================
-- Phase 9: Create new multi-tenant RLS policies for clients
-- ============================================================================

-- SELECT: users see only clients in their organization
CREATE POLICY clients_select ON public.clients
  FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

-- INSERT: admin can create clients in their organization
CREATE POLICY clients_insert ON public.clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    organization_id = public.user_organization_id()
    AND public.user_role() = 'admin'
  );

-- UPDATE: admin can update clients in their organization
CREATE POLICY clients_update ON public.clients
  FOR UPDATE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.user_role() = 'admin'
  );

-- DELETE: admin can delete clients in their organization
CREATE POLICY clients_delete ON public.clients
  FOR DELETE
  TO authenticated
  USING (
    organization_id = public.user_organization_id()
    AND public.user_role() = 'admin'
  );

-- ANON: no access for unauthenticated users
CREATE POLICY clients_anon ON public.clients
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- Phase 10: Create new multi-tenant RLS policies for work_locations
-- ============================================================================

-- SELECT: through client -> organization
CREATE POLICY work_locations_select ON public.work_locations
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients
      WHERE organization_id = public.user_organization_id()
    )
  );

-- INSERT: admin, through client -> organization
CREATE POLICY work_locations_insert ON public.work_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    client_id IN (
      SELECT id FROM public.clients
      WHERE organization_id = public.user_organization_id()
    )
    AND public.user_role() = 'admin'
  );

-- UPDATE: admin, through client -> organization
CREATE POLICY work_locations_update ON public.work_locations
  FOR UPDATE
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients
      WHERE organization_id = public.user_organization_id()
    )
    AND public.user_role() = 'admin'
  );

-- DELETE: admin, through client -> organization
CREATE POLICY work_locations_delete ON public.work_locations
  FOR DELETE
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM public.clients
      WHERE organization_id = public.user_organization_id()
    )
    AND public.user_role() = 'admin'
  );

-- ANON: no access
CREATE POLICY work_locations_anon ON public.work_locations
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- Phase 11: Create new multi-tenant RLS policies for positions
-- ============================================================================

-- SELECT: through work_location -> client -> organization
CREATE POLICY positions_select ON public.positions
  FOR SELECT
  TO authenticated
  USING (
    work_location_id IN (
      SELECT wl.id FROM public.work_locations wl
      JOIN public.clients c ON wl.client_id = c.id
      WHERE c.organization_id = public.user_organization_id()
    )
  );

-- INSERT: all authenticated, through work_location -> client -> organization
CREATE POLICY positions_insert ON public.positions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    work_location_id IN (
      SELECT wl.id FROM public.work_locations wl
      JOIN public.clients c ON wl.client_id = c.id
      WHERE c.organization_id = public.user_organization_id()
    )
  );

-- UPDATE: all authenticated, through work_location -> client -> organization
CREATE POLICY positions_update ON public.positions
  FOR UPDATE
  TO authenticated
  USING (
    work_location_id IN (
      SELECT wl.id FROM public.work_locations wl
      JOIN public.clients c ON wl.client_id = c.id
      WHERE c.organization_id = public.user_organization_id()
    )
  );

-- DELETE: all authenticated, through work_location -> client -> organization
CREATE POLICY positions_delete ON public.positions
  FOR DELETE
  TO authenticated
  USING (
    work_location_id IN (
      SELECT wl.id FROM public.work_locations wl
      JOIN public.clients c ON wl.client_id = c.id
      WHERE c.organization_id = public.user_organization_id()
    )
  );

-- ANON: no access
CREATE POLICY positions_anon ON public.positions
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- Phase 12: Create new multi-tenant RLS policies for temporary_workers
-- ============================================================================

-- SELECT: users see only workers in their organization
CREATE POLICY workers_select ON public.temporary_workers
  FOR SELECT
  TO authenticated
  USING (organization_id = public.user_organization_id());

-- INSERT: all authenticated can create workers in their organization
CREATE POLICY workers_insert ON public.temporary_workers
  FOR INSERT
  TO authenticated
  WITH CHECK (organization_id = public.user_organization_id());

-- UPDATE: all authenticated can update workers in their organization
CREATE POLICY workers_update ON public.temporary_workers
  FOR UPDATE
  TO authenticated
  USING (organization_id = public.user_organization_id());

-- DELETE: all authenticated can delete workers in their organization
CREATE POLICY workers_delete ON public.temporary_workers
  FOR DELETE
  TO authenticated
  USING (organization_id = public.user_organization_id());

-- ANON: no access
CREATE POLICY workers_anon ON public.temporary_workers
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- Phase 13: Create new multi-tenant RLS policies for assignments
-- ============================================================================

-- SELECT: through worker -> organization
CREATE POLICY assignments_select ON public.assignments
  FOR SELECT
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM public.temporary_workers
      WHERE organization_id = public.user_organization_id()
    )
  );

-- INSERT: all authenticated, worker AND position must belong to organization
CREATE POLICY assignments_insert ON public.assignments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id IN (
      SELECT id FROM public.temporary_workers
      WHERE organization_id = public.user_organization_id()
    )
    AND position_id IN (
      SELECT p.id FROM public.positions p
      JOIN public.work_locations wl ON p.work_location_id = wl.id
      JOIN public.clients c ON wl.client_id = c.id
      WHERE c.organization_id = public.user_organization_id()
    )
  );

-- UPDATE: all authenticated, through worker -> organization
CREATE POLICY assignments_update ON public.assignments
  FOR UPDATE
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM public.temporary_workers
      WHERE organization_id = public.user_organization_id()
    )
  );

-- DELETE: only admin, through worker -> organization
CREATE POLICY assignments_delete ON public.assignments
  FOR DELETE
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM public.temporary_workers
      WHERE organization_id = public.user_organization_id()
    )
    AND public.user_role() = 'admin'
  );

-- ANON: no access
CREATE POLICY assignments_anon ON public.assignments
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ============================================================================
-- Phase 14: Create new multi-tenant RLS policies for assignment_audit_log
-- ============================================================================

-- SELECT: through assignment -> worker -> organization
CREATE POLICY audit_log_select ON public.assignment_audit_log
  FOR SELECT
  TO authenticated
  USING (
    assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.temporary_workers tw ON a.worker_id = tw.id
      WHERE tw.organization_id = public.user_organization_id()
    )
  );

-- INSERT: through assignment -> worker -> organization (created by triggers)
CREATE POLICY audit_log_insert ON public.assignment_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.temporary_workers tw ON a.worker_id = tw.id
      WHERE tw.organization_id = public.user_organization_id()
    )
  );

-- UPDATE: only admin, with isolation
CREATE POLICY audit_log_update ON public.assignment_audit_log
  FOR UPDATE
  TO authenticated
  USING (
    assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.temporary_workers tw ON a.worker_id = tw.id
      WHERE tw.organization_id = public.user_organization_id()
    )
    AND public.user_role() = 'admin'
  );

-- DELETE: only admin, with isolation
CREATE POLICY audit_log_delete ON public.assignment_audit_log
  FOR DELETE
  TO authenticated
  USING (
    assignment_id IN (
      SELECT a.id FROM public.assignments a
      JOIN public.temporary_workers tw ON a.worker_id = tw.id
      WHERE tw.organization_id = public.user_organization_id()
    )
    AND public.user_role() = 'admin'
  );

-- ANON: no access
CREATE POLICY audit_log_anon ON public.assignment_audit_log
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
