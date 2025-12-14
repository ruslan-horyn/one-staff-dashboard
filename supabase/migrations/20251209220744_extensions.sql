-- ============================================================================
-- Migration: 20251209220744_extensions.sql
-- Purpose: Enable required PostgreSQL extensions for the One Staff Dashboard
-- Tables affected: None (system extensions only)
-- Notes:
--   - pgcrypto: Required for gen_random_uuid() function used in UUID generation
--   - pg_trgm: Required for trigram-based fuzzy text search (worker search feature)
-- ============================================================================

-- enable pgcrypto extension for uuid generation
-- this extension provides gen_random_uuid() function used by all tables with uuid primary keys
create extension if not exists pgcrypto;

-- enable pg_trgm extension for trigram-based fuzzy text search
-- this extension is used for worker search functionality (searching by name/phone)
create extension if not exists pg_trgm;
