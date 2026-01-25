-- ============================================================================
-- Migration: add_unique_email_per_org_clients
-- Purpose: Add unique constraint on clients.email per organization
-- ============================================================================

CREATE UNIQUE INDEX idx_clients_unique_email_per_org
ON public.clients (organization_id, email)
WHERE deleted_at IS NULL;

COMMENT ON INDEX idx_clients_unique_email_per_org IS 'Ensures unique email per organization for active (non-deleted) clients';
