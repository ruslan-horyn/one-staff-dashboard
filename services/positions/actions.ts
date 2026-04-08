'use server';

import type { Position } from '@/types/position';
import { createAction } from '../shared/action-wrapper';
import {
	type CreatePositionInput,
	createPositionSchema,
	type DeletePositionInput,
	deletePositionSchema,
	type UpdatePositionInput,
	updatePositionSchema,
} from './schemas';

// ============================================================================
// Queries
// ============================================================================

/**
 * Get positions for a work location (no pagination - few per location)
 *
 * @param input - Object with workLocationId
 * @returns Array of positions
 *
 * @example
 * const result = await getPositions({ workLocationId: '123e4567-e89b-12d3-a456-426614174000' });
 */
export const getPositions = createAction<
	{ workLocationId: string },
	Position[]
>(async (input, { supabase }) => {
	const { data, error } = await supabase
		.from('positions')
		.select('*')
		.eq('work_location_id', input.workLocationId)
		.is('deleted_at', null)
		.order('name');

	if (error) throw error;
	return data ?? [];
});

/**
 * Lightweight position list for ComboBox (filtered by work location)
 *
 * @param input - Object with workLocationId
 * @returns Array of positions with id and name only
 *
 * @example
 * const result = await getPositionsForSelect({ workLocationId: '123e4567-e89b-12d3-a456-426614174000' });
 */
export const getPositionsForSelect = createAction<
	{ workLocationId: string },
	{ id: string; name: string }[]
>(async (input, { supabase }) => {
	const { data, error } = await supabase
		.from('positions')
		.select('id, name')
		.eq('work_location_id', input.workLocationId)
		.eq('is_active', true)
		.is('deleted_at', null)
		.order('name');

	if (error) throw error;
	return data ?? [];
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Creates a new position.
 *
 * @param input - Position data (workLocationId, name)
 * @returns Created position record
 *
 * @example
 * const result = await createPosition({
 *   workLocationId: '123e4567-e89b-12d3-a456-426614174000',
 *   name: 'Warehouse Manager',
 * });
 */
export const createPosition = createAction<CreatePositionInput, Position>(
	async (input, { supabase }) => {
		const { data, error } = await supabase
			.from('positions')
			.insert({
				work_location_id: input.workLocationId,
				name: input.name,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: createPositionSchema }
);

/**
 * Updates an existing position.
 * Only provided fields will be updated (partial update).
 *
 * @param input - Object with position ID and fields to update
 * @returns Updated position record
 *
 * @example
 * const result = await updatePosition({
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   name: 'Senior Warehouse Manager',
 *   isActive: false,
 * });
 */
export const updatePosition = createAction<UpdatePositionInput, Position>(
	async (input, { supabase }) => {
		const { id, ...updateData } = input;

		const dbData: Record<string, unknown> = {};
		if (updateData.name !== undefined) dbData.name = updateData.name;
		if (updateData.isActive !== undefined)
			dbData.is_active = updateData.isActive;

		const { data, error } = await supabase
			.from('positions')
			.update(dbData)
			.eq('id', id)
			.is('deleted_at', null)
			.select()
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: updatePositionSchema }
);

/**
 * Soft deletes a position by setting deleted_at timestamp.
 * The position record is preserved in the database but excluded from normal queries.
 *
 * @param input - Object with position ID
 * @returns Deleted position record
 *
 * @example
 * const result = await deletePosition({ id: '123e4567-e89b-12d3-a456-426614174000' });
 */
export const deletePosition = createAction<DeletePositionInput, Position>(
	async (input, { supabase }) => {
		const { data, error } = await supabase
			.from('positions')
			.update({ deleted_at: new Date().toISOString() })
			.eq('id', input.id)
			.is('deleted_at', null)
			.select()
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: deletePositionSchema }
);
