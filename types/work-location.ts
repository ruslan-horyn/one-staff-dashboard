import type { Tables } from './database';
import type { Client } from './client';

// ============================================================================
// Base Entity Type
// ============================================================================

/** Work location entity from database */
export type WorkLocation = Tables<'work_locations'>;

// ============================================================================
// Extended DTOs (with relations)
// ============================================================================

/** Work location with client info (minimal) */
export interface WorkLocationWithClient extends WorkLocation {
  client: Pick<Client, 'id' | 'name'>;
}

/** Work location with client and positions */
export interface WorkLocationWithPositions extends WorkLocationWithClient {
  positions: Tables<'positions'>[];
}

