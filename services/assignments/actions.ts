'use server';

import type { Assignment, AssignmentWithPosition } from '@/types/assignment';
import { createAction } from '../shared/action-wrapper';
import {
	type CancelAssignmentInput,
	type CreateAssignmentInput,
	cancelAssignmentSchema,
	createAssignmentSchema,
	type EndAssignmentInput,
	endAssignmentSchema,
} from './schemas';

// ============================================================================
// Queries
// ============================================================================

/**
 * Get assignments for a worker
 *
 * @param input - Object with workerId
 * @returns Array of assignments for the worker
 *
 * @example
 * const result = await getWorkerAssignments({ workerId: '123e4567-e89b-12d3-a456-426614174000' });
 */
export const getWorkerAssignments = createAction<
	{ workerId: string },
	AssignmentWithPosition[]
>(async (input, { supabase }) => {
	const { data, error } = await supabase
		.from('assignments')
		.select(
			'*, positions(id, name, work_location_id, work_locations(id, name))'
		)
		.eq('worker_id', input.workerId)
		.order('start_at', { ascending: false });

	if (error) throw error;

	return (data ?? []).map((row) => ({
		...row,
		position: row.positions
			? {
					id: row.positions.id,
					name: row.positions.name,
					work_location_id: row.positions.work_location_id,
					work_location: row.positions.work_locations
						? {
								id: row.positions.work_locations.id,
								name: row.positions.work_locations.name,
							}
						: { id: '', name: 'Unknown' },
				}
			: null,
	})) as AssignmentWithPosition[];
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Creates a new assignment.
 *
 * @param input - Assignment data (workerId, positionId, startAt, endAt)
 * @returns Created assignment record
 *
 * @example
 * const result = await createAssignment({
 *   workerId: '123e4567-e89b-12d3-a456-426614174000',
 *   positionId: '987fcdeb-51a2-43d1-8765-234567890abc',
 *   startAt: '2026-04-08T08:00:00Z',
 *   endAt: '2026-04-08T17:00:00Z',
 * });
 */
export const createAssignment = createAction<CreateAssignmentInput, Assignment>(
	async (input, { supabase, user }) => {
		const { data, error } = await supabase
			.from('assignments')
			.insert({
				worker_id: input.workerId,
				position_id: input.positionId,
				start_at: input.startAt,
				end_at: input.endAt ?? null,
				created_by: user.id,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: createAssignmentSchema }
);

/**
 * End an assignment via RPC function.
 *
 * @param input - Object with assignmentId and optional endAt
 * @returns Updated assignment record
 *
 * @example
 * const result = await endAssignment({
 *   assignmentId: '123e4567-e89b-12d3-a456-426614174000',
 *   endAt: '2026-04-08T17:00:00Z',
 * });
 */
export const endAssignment = createAction<EndAssignmentInput, Assignment>(
	async (input, { supabase }) => {
		const { data, error } = await supabase.rpc('end_assignment', {
			p_assignment_id: input.assignmentId,
			...(input.endAt ? { p_end_at: input.endAt } : {}),
		});

		if (error) throw error;
		return data;
	},
	{ schema: endAssignmentSchema }
);

/**
 * Cancel a scheduled assignment via RPC function.
 *
 * @param input - Object with assignmentId
 * @returns Updated assignment record
 *
 * @example
 * const result = await cancelAssignment({ assignmentId: '123e4567-e89b-12d3-a456-426614174000' });
 */
export const cancelAssignment = createAction<CancelAssignmentInput, Assignment>(
	async (input, { supabase }) => {
		const { data, error } = await supabase.rpc('cancel_assignment', {
			p_assignment_id: input.assignmentId,
		});

		if (error) throw error;
		return data;
	},
	{ schema: cancelAssignmentSchema }
);
