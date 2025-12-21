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

// ============================================================================
// Command Models (Input Types)
// ============================================================================

/** Input for creating a new client */
export interface CreateClientInput {
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}

/** Input for updating an existing client */
export interface UpdateClientInput {
  id: string;
  name?: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
}
