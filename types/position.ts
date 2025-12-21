import type { Tables } from './database';
import type { WorkLocationWithClient } from './work-location';

// ============================================================================
// Base Entity Type
// ============================================================================

/** Position entity from database */
export type Position = Tables<'positions'>;

// ============================================================================
// Extended DTOs (with relations)
// ============================================================================

/** Position with work location and client info */
export interface PositionWithLocation extends Position {
  work_location: WorkLocationWithClient;
}

