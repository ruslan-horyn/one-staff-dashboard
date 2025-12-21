import type { Tables } from './database';

// ============================================================================
// Base Entity Type
// ============================================================================

/** Temporary worker entity from database */
export type Worker = Tables<'temporary_workers'>;

// ============================================================================
// Extended DTOs (with relations)
// ============================================================================

/** Worker with computed statistics (for main board view) */
export interface WorkerWithStats extends Worker {
  totalHours: number;
  activeAssignments: number;
  assignedLocations: string[];
}

/**
 * Worker with assignments (for expanded row view)
 * Note: AssignmentWithDetails is imported in assignment.ts to avoid circular deps.
 * When using this type, import AssignmentWithDetails separately.
 */
export interface WorkerWithAssignments extends Worker {
  assignments: Array<{
    id: string;
    position_id: string;
    start_at: string;
    end_at: string | null;
    status: string;
    position: {
      id: string;
      name: string;
      work_location: {
        id: string;
        name: string;
        client: {
          id: string;
          name: string;
        };
      };
    };
  }>;
}

// ============================================================================
// Command Models (Input Types)
// ============================================================================

/** Input for creating a new worker */
export interface CreateWorkerInput {
  firstName: string;
  lastName: string;
  phone: string;
}

/** Input for updating an existing worker */
export interface UpdateWorkerInput {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}
