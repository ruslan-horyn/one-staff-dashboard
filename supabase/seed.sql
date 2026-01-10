-- ============================================================================
-- Seed: Development test users
-- Purpose: Create test users for local development
-- WARNING: This file runs only on `npx supabase db reset` (local only)
-- ============================================================================

-- ===================
-- Test Users
-- ===================
-- Note: The trigger `on_auth_user_created` automatically creates:
--   - Organization from raw_user_meta_data->>'organization_name'
--   - Profile with role='admin', linked to the organization

-- Create test users in auth.users
-- The trigger will create organizations and profiles automatically
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES
  (
    'd0d0d0d0-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Test", "last_name": "Admin", "organization_name": "Test Organization"}',
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  );

-- Create identities for test users (required for Supabase Auth)
INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  (
    'd0d0d0d0-0000-0000-0000-000000000001',
    'd0d0d0d0-0000-0000-0000-000000000001',
    'admin@test.com',
    '{"sub": "d0d0d0d0-0000-0000-0000-000000000001", "email": "admin@test.com"}',
    'email',
    now(),
    now(),
    now()
  );

-- ===================
-- Add coordinator to the same organization
-- ===================
-- First, get the organization created by admin and add coordinator manually
-- (since coordinator shouldn't create a new organization)

-- Create coordinator user (trigger will create org + profile, but we'll fix it below)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  aud,
  role,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
) VALUES
  (
    'd0d0d0d0-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'coordinator@test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"first_name": "Test", "last_name": "Coordinator", "organization_name": "Coordinator Org"}',
    'authenticated',
    'authenticated',
    '',
    '',
    '',
    ''
  );

INSERT INTO auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES
  (
    'd0d0d0d0-0000-0000-0000-000000000002',
    'd0d0d0d0-0000-0000-0000-000000000002',
    'coordinator@test.com',
    '{"sub": "d0d0d0d0-0000-0000-0000-000000000002", "email": "coordinator@test.com"}',
    'email',
    now(),
    now(),
    now()
  );

-- Update coordinator to be in the same org as admin and change role to coordinator
UPDATE profiles
SET
  organization_id = (SELECT organization_id FROM profiles WHERE id = 'd0d0d0d0-0000-0000-0000-000000000001'),
  role = 'coordinator'
WHERE id = 'd0d0d0d0-0000-0000-0000-000000000002';

-- Delete the extra organization created for coordinator
DELETE FROM organizations
WHERE id NOT IN (SELECT organization_id FROM profiles WHERE id = 'd0d0d0d0-0000-0000-0000-000000000001');
