-- ============================================================================
-- Seed: Development test users
-- Purpose: Create test users for local development
-- WARNING: This file runs only on `npx supabase db reset` (local only)
-- ============================================================================

-- ===================
-- Test Users
-- ===================

-- Create test users in auth.users
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
  role
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
    '{"full_name": "Test Admin"}',
    'authenticated',
    'authenticated'
  ),
  (
    'd0d0d0d0-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'coordinator@test.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Test Coordinator"}',
    'authenticated',
    'authenticated'
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
  ),
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

-- Create profiles for test users
INSERT INTO profiles (id, first_name, last_name, role) VALUES
  ('d0d0d0d0-0000-0000-0000-000000000001', 'Test', 'Admin', 'admin'),
  ('d0d0d0d0-0000-0000-0000-000000000002', 'Test', 'Coordinator', 'coordinator');
