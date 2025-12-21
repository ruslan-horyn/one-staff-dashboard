import type { Tables } from './database';
import type { Profile } from './auth';
import type { Worker } from './worker';
import type { PositionWithLocation } from './position';

// ============================================================================
// Base Entity Types
// ============================================================================

/** Assignment entity from database */
export type Assignment = Tables<'assignments'>;

/** Assignment audit log entry from database */
export type AuditLogEntry = Tables<'assignment_audit_log'>;

// ============================================================================
// Extended DTOs (with relations)
// ============================================================================

/** Assignment with full details (worker, position, profiles) */
export interface AssignmentWithDetails extends Assignment {
  worker: Pick<Worker, 'id' | 'first_name' | 'last_name' | 'phone'>;
  position: PositionWithLocation;
  created_by_profile: Pick<Profile, 'id' | 'first_name' | 'last_name'>;
  ended_by_profile?: Pick<Profile, 'id' | 'first_name' | 'last_name'> | null;
  cancelled_by_profile?: Pick<Profile, 'id' | 'first_name' | 'last_name'> | null;
}

/** Audit log entry with performer profile info */
export interface AuditLogEntryWithProfile extends AuditLogEntry {
  performed_by_profile: Pick<Profile, 'id' | 'first_name' | 'last_name'>;
}

