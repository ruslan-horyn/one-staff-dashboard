-- ============================================================================
-- Migration: fix_profiles_rls_for_auth_hook
-- Purpose: Allow supabase_auth_admin to read profiles during JWT creation
-- ============================================================================
--
-- Problem: The custom_access_token_hook function runs as supabase_auth_admin
-- and needs to read the profiles table to get user_role and organization_id.
-- However, the profiles_select RLS policy uses user_organization_id() and
-- auth.uid() which depend on JWT claims - but the JWT hasn't been created yet
-- when the hook runs.
--
-- Solution: Add an RLS policy that allows supabase_auth_admin to read any
-- profile. This is safe because:
-- 1. supabase_auth_admin is a privileged role used only by Supabase Auth
-- 2. The hook only reads the profile for the user being authenticated
-- 3. This role is not accessible to regular users or API calls
-- ============================================================================

CREATE POLICY profiles_select_auth_admin ON public.profiles
  FOR SELECT
  TO supabase_auth_admin
  USING (true);

COMMENT ON POLICY profiles_select_auth_admin ON public.profiles IS
  'Allows supabase_auth_admin to read profiles during JWT creation (auth hook)';
