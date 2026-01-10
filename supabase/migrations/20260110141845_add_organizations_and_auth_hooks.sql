-- ============================================================================
-- Migration: add_organizations_and_auth_hooks
-- Purpose: Add organizations table, link to profiles, create auth hooks
-- ============================================================================

-- ===================
-- Table: organizations
-- ===================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.organizations IS 'Organizations/companies that use the system';

-- Trigger for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================
-- Modify profiles table
-- ===================
ALTER TABLE public.profiles
ADD COLUMN organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE RESTRICT;

CREATE INDEX idx_profiles_organization_id ON public.profiles(organization_id);

-- ===================
-- Function: handle_new_user()
-- ===================
-- Creates organization and profile when new user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_org_name TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
BEGIN
  -- Get data from user_metadata
  v_org_name := NEW.raw_user_meta_data->>'organization_name';
  v_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  v_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');

  -- Create new organization
  INSERT INTO public.organizations (name)
  VALUES (COALESCE(v_org_name, 'My Organization'))
  RETURNING id INTO v_org_id;

  -- Create user profile as admin
  INSERT INTO public.profiles (id, organization_id, role, first_name, last_name)
  VALUES (NEW.id, v_org_id, 'admin', v_first_name, v_last_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates organization and profile when new user registers via Supabase Auth';

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===================
-- Function: custom_access_token_hook()
-- ===================
-- Auth Hook to embed user_role and organization_id in JWT
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  profile_role public.user_role;
  profile_org_id uuid;
BEGIN
  -- Get role and organization_id from profiles
  SELECT role, organization_id
  INTO profile_role, profile_org_id
  FROM public.profiles
  WHERE id = (event->>'user_id')::uuid;

  claims := event->'claims';

  -- Set custom claims
  IF profile_role IS NOT NULL THEN
    claims := jsonb_set(claims, '{user_role}', to_jsonb(profile_role));
  ELSE
    claims := jsonb_set(claims, '{user_role}', '"coordinator"');
  END IF;

  IF profile_org_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{organization_id}', to_jsonb(profile_org_id));
  END IF;

  event := jsonb_set(event, '{claims}', claims);
  RETURN event;
END;
$$;

COMMENT ON FUNCTION public.custom_access_token_hook(jsonb) IS 'Auth Hook: embeds user_role and organization_id into JWT claims';

-- Permissions for supabase_auth_admin
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
GRANT SELECT ON TABLE public.profiles TO supabase_auth_admin;
GRANT SELECT ON TABLE public.organizations TO supabase_auth_admin;

-- ===================
-- Updated helper functions (use JWT)
-- ===================
-- Update user_role() to read from JWT
CREATE OR REPLACE FUNCTION public.user_role()
RETURNS user_role AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'user_role')::user_role,
    'coordinator'::user_role
  )
$$ LANGUAGE sql STABLE;

-- New function: get organization_id from JWT
CREATE OR REPLACE FUNCTION public.user_organization_id()
RETURNS uuid AS $$
  SELECT (auth.jwt() ->> 'organization_id')::uuid
$$ LANGUAGE sql STABLE;

COMMENT ON FUNCTION public.user_organization_id() IS 'Returns the organization_id of the current user from JWT claims';

-- ===================
-- RLS Policies for organizations
-- ===================
-- Users can only see their own organization
-- Uses subquery to profiles (no recursion since profiles doesn't query organizations)
CREATE POLICY organizations_select ON public.organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
  );

-- Insert: allowed via SECURITY DEFINER trigger
CREATE POLICY organizations_insert ON public.organizations
  FOR INSERT WITH CHECK (true);

-- Only admin can update organization name
CREATE POLICY organizations_update ON public.organizations
  FOR UPDATE USING (
    id IN (SELECT organization_id FROM public.profiles WHERE id = auth.uid())
    AND public.user_role() = 'admin'
  );

-- ===================
-- Update RLS for profiles (organization-scoped)
-- ===================
-- Uses user_organization_id() which reads from JWT (no recursion)
DROP POLICY IF EXISTS profiles_select ON public.profiles;
CREATE POLICY profiles_select ON public.profiles
  FOR SELECT USING (
    organization_id = public.user_organization_id()
    OR id = auth.uid()
  );
