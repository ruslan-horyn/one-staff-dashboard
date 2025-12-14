-- ============================================================================
-- Migration: 20251209220745_enum_types.sql
-- Purpose: Create custom ENUM types for the One Staff Dashboard
-- Tables affected: profiles (user_role), assignments (assignment_status)
-- Notes:
--   - user_role: Defines system user roles (admin, coordinator)
--   - assignment_status: Defines lifecycle states of worker assignments
-- ============================================================================

-- create user_role enum type
-- defines the roles available for system users in the profiles table
-- admin: full access to all features including client/location management
-- coordinator: can manage workers, positions, and assignments
create type user_role as enum ('admin', 'coordinator');

-- create assignment_status enum type
-- defines the lifecycle states of worker assignments
-- scheduled: assignment is planned but not yet started
-- active: assignment is currently in progress
-- completed: assignment has been finished normally
-- cancelled: assignment was cancelled before completion
create type assignment_status as enum ('scheduled', 'active', 'completed', 'cancelled');
