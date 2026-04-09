'use server';

import {
	applyPaginationToQuery,
	DEFAULT_PAGE_SIZE,
	type PaginatedResult,
	paginateResult,
} from '@/services/shared/pagination';
import {
	applySearchFilter,
	applySoftDeleteFilter,
	applySortFilter,
	buildSearchFilter,
} from '@/services/shared/query-helpers';
import type { WorkLocation } from '@/types/work-location';
import { createAction } from '../shared/action-wrapper';
import {
	type CreateWorkLocationInput,
	createWorkLocationSchema,
	type DeleteWorkLocationInput,
	deleteWorkLocationSchema,
	type UpdateWorkLocationInput,
	updateWorkLocationSchema,
	WORK_LOCATION_SEARCHABLE_COLUMNS,
	type WorkLocationFilter,
	type WorkLocationIdInput,
	workLocationFilterSchema,
	workLocationIdSchema,
} from './schemas';

// ============================================================================
// Queries
// ============================================================================

/**
 * Retrieves a single work location by ID with client info.
 *
 * @param input - Object with work location ID
 * @returns Work location record with client info or NOT_FOUND error
 *
 * @example
 * const result = await getWorkLocation({ id: '123e4567-e89b-12d3-a456-426614174000' });
 */
export const getWorkLocation = createAction<WorkLocationIdInput, WorkLocation>(
	async (input, { supabase }) => {
		const { data, error } = await supabase
			.from('work_locations')
			.select('*, clients(id, name)')
			.eq('id', input.id)
			.is('deleted_at', null)
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: workLocationIdSchema }
);

/**
 * Retrieves a paginated list of work locations with optional filtering and sorting.
 *
 * @param input - Filter options (page, pageSize, search, sortBy, sortOrder, clientId, includeDeleted)
 * @returns Paginated list of work locations with metadata
 *
 * @example
 * const result = await getWorkLocations({
 *   page: 1,
 *   pageSize: 20,
 *   search: 'Warehouse',
 *   sortBy: 'name',
 *   sortOrder: 'asc',
 *   clientId: 'client-123',
 * });
 */
export const getWorkLocations = createAction<
	WorkLocationFilter,
	PaginatedResult<WorkLocation>
>(
	async (input, { supabase }) => {
		const {
			page = 1,
			pageSize = DEFAULT_PAGE_SIZE,
			search,
			sortBy,
			sortOrder = 'asc',
			clientId,
			includeDeleted = false,
		} = input;

		// Build search filter once (reused for count and data queries)
		const searchFilter = buildSearchFilter<WorkLocation>(
			search,
			WORK_LOCATION_SEARCHABLE_COLUMNS
		);

		// Build count query
		let countQuery = supabase
			.from('work_locations')
			.select('*', { count: 'exact', head: true });
		countQuery = applySoftDeleteFilter(countQuery, includeDeleted);
		if (clientId) {
			countQuery = countQuery.eq('client_id', clientId);
		}
		countQuery = applySearchFilter(countQuery, searchFilter);

		// Build data query
		let dataQuery = supabase
			.from('work_locations')
			.select('*, clients(id, name)');
		dataQuery = applySoftDeleteFilter(dataQuery, includeDeleted);
		if (clientId) {
			dataQuery = dataQuery.eq('client_id', clientId);
		}
		dataQuery = applySearchFilter(dataQuery, searchFilter);
		dataQuery = applySortFilter(dataQuery, sortBy, sortOrder);
		dataQuery = applyPaginationToQuery(dataQuery, page, pageSize);

		// Execute both queries in parallel
		const [countResult, dataResult] = await Promise.all([
			countQuery,
			dataQuery,
		]);

		if (countResult.error) throw countResult.error;
		if (dataResult.error) throw dataResult.error;

		return paginateResult(
			dataResult.data ?? [],
			countResult.count ?? 0,
			page,
			pageSize
		);
	},
	{ schema: workLocationFilterSchema }
);

/** Lightweight work location list for selectors (no pagination) */
export const getWorkLocationsForSelect = createAction<
	void,
	Array<{ id: string; name: string; clientName: string }>
>(async (_input, { supabase }) => {
	const { data, error } = await supabase
		.from('work_locations')
		.select('id, name, clients(name)')
		.is('deleted_at', null)
		.order('name');

	if (error) throw error;

	// Map nested client data to flat structure
	return (
		(data as Array<{
			id: string;
			name: string;
			clients?: { name: string };
		}>) ?? []
	).map((loc) => ({
		id: loc.id,
		name: loc.name,
		clientName: loc.clients?.name ?? '',
	}));
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Creates a new work location.
 *
 * @param input - Work location data (clientId, name, address, email, phone)
 * @returns Created work location record
 *
 * @example
 * const result = await createWorkLocation({
 *   clientId: 'client-123',
 *   name: 'Main Warehouse',
 *   address: 'ul. Logistyczna 5, 02-000 Warszawa',
 *   email: 'warehouse@example.com',
 *   phone: '+48 123 456 789',
 * });
 */
export const createWorkLocation = createAction<
	CreateWorkLocationInput,
	WorkLocation
>(
	async (input, { supabase }) => {
		const { data, error } = await supabase
			.from('work_locations')
			.insert({
				client_id: input.clientId,
				name: input.name,
				address: input.address,
				email: input.email || null,
				phone: input.phone || null,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: createWorkLocationSchema }
);

/**
 * Updates an existing work location.
 * Only provided fields will be updated (partial update).
 *
 * @param input - Object with work location ID and fields to update
 * @returns Updated work location record
 *
 * @example
 * const result = await updateWorkLocation({
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   name: 'Main Warehouse - Updated',
 *   email: 'new-email@example.com',
 * });
 */
export const updateWorkLocation = createAction<
	UpdateWorkLocationInput,
	WorkLocation
>(
	async (input, { supabase }) => {
		const { id, ...updateData } = input;

		// Map clientId to client_id for database
		const dbData = Object.fromEntries(
			Object.entries(updateData)
				.filter(([, value]) => value !== undefined)
				.map(([key, value]) => {
					if (key === 'clientId') {
						return ['client_id', value];
					}
					return [key, value];
				})
		);

		const { data, error } = await supabase
			.from('work_locations')
			.update(dbData)
			.eq('id', id)
			.is('deleted_at', null)
			.select()
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: updateWorkLocationSchema }
);

/**
 * Soft deletes a work location by setting deleted_at timestamp.
 * The work location record is preserved in the database but excluded from normal queries.
 *
 * @param input - Object with work location ID
 * @returns Deleted work location record
 *
 * @example
 * const result = await deleteWorkLocation({ id: '123e4567-e89b-12d3-a456-426614174000' });
 */
export const deleteWorkLocation = createAction<
	DeleteWorkLocationInput,
	WorkLocation
>(
	async (input, { supabase }) => {
		const { data, error } = await supabase
			.from('work_locations')
			.update({ deleted_at: new Date().toISOString() })
			.eq('id', input.id)
			.is('deleted_at', null)
			.select()
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: deleteWorkLocationSchema }
);
