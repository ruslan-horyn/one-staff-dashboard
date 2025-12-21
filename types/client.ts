import type { Tables } from './database';

// ============================================================================
// Base Entity Type
// ============================================================================

/** Client entity from database */
export type Client = Tables<'clients'>;

// ============================================================================
// Extended DTOs (with relations)
// ============================================================================

/** Client with nested work locations */
export interface ClientWithLocations extends Client {
  work_locations: Tables<'work_locations'>[];
}

