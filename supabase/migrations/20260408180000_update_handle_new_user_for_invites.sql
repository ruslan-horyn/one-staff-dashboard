-- ============================================================================
-- Migration: update_handle_new_user_for_invites
-- Purpose: Update handle_new_user() to support invite flow.
--          Invited users join existing organization instead of creating a new one.
--          Invite metadata: organization_id, role, first_name, last_name
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_org_id UUID;
  v_org_name TEXT;
  v_first_name TEXT;
  v_last_name TEXT;
  v_role public.user_role;
BEGIN
  v_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', '');
  v_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', '');

  -- Check if user was invited (has organization_id in metadata)
  IF NEW.raw_user_meta_data->>'organization_id' IS NOT NULL THEN
    -- Invited user: join existing organization
    v_org_id := (NEW.raw_user_meta_data->>'organization_id')::uuid;
    v_role := COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'coordinator');
  ELSE
    -- Self-registered user: create new organization
    v_org_name := NEW.raw_user_meta_data->>'organization_name';
    INSERT INTO public.organizations (name)
    VALUES (COALESCE(v_org_name, 'My Organization'))
    RETURNING id INTO v_org_id;
    v_role := 'admin';
  END IF;

  INSERT INTO public.profiles (id, organization_id, role, first_name, last_name)
  VALUES (NEW.id, v_org_id, v_role, v_first_name, v_last_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_user() IS 'Creates profile when new user registers. Invited users join an existing organization; self-registered users get a new organization with admin role.';
