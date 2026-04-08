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
import type { Worker } from '@/types/worker';
import { createAction } from '../shared/action-wrapper';
import {
	type CreateWorkerInput,
	createWorkerSchema,
	type DeleteWorkerInput,
	deleteWorkerSchema,
	type UpdateWorkerInput,
	updateWorkerSchema,
	WORKER_SEARCHABLE_COLUMNS,
	type WorkerFilter,
	type WorkerIdInput,
	workerFilterSchema,
	workerIdSchema,
} from './schemas';

// ============================================================================
// Queries
// ============================================================================

/**
 * Retrieves a single worker by ID.
 *
 * @param input - Object with worker ID
 * @returns Worker record or NOT_FOUND error
 *
 * @example
 * const result = await getWorker({ id: '123e4567-e89b-12d3-a456-426614174000' });
 */
export const getWorker = createAction<WorkerIdInput, Worker>(
	async (input, { supabase }) => {
		const { data, error } = await supabase
			.from('temporary_workers')
			.select('*')
			.eq('id', input.id)
			.is('deleted_at', null)
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: workerIdSchema }
);

/**
 * Retrieves a paginated list of workers with optional filtering and sorting.
 *
 * @param input - Filter options (page, pageSize, search, sortBy, sortOrder, includeDeleted)
 * @returns Paginated list of workers with metadata
 *
 * @example
 * const result = await getWorkers({
 *   page: 1,
 *   pageSize: 20,
 *   search: 'John',
 *   sortBy: 'name',
 *   sortOrder: 'asc',
 * });
 */
export const getWorkers = createAction<WorkerFilter, PaginatedResult<Worker>>(
	async (input, { supabase }) => {
		const {
			page = 1,
			pageSize = DEFAULT_PAGE_SIZE,
			search,
			sortBy,
			sortOrder = 'asc',
			includeDeleted = false,
		} = input;

		// Build search filter once (reused for count and data queries)
		const searchFilter = buildSearchFilter<Worker>(
			search,
			WORKER_SEARCHABLE_COLUMNS
		);

		// Build count query
		let countQuery = supabase
			.from('temporary_workers')
			.select('*', { count: 'exact', head: true });
		countQuery = applySoftDeleteFilter(countQuery, includeDeleted);
		countQuery = applySearchFilter(countQuery, searchFilter);

		// Build data query
		let dataQuery = supabase.from('temporary_workers').select('*');
		dataQuery = applySoftDeleteFilter(dataQuery, includeDeleted);
		dataQuery = applySearchFilter(dataQuery, searchFilter);
		// Map 'name' to 'first_name' since workers table has no 'name' column
		const dbSortBy = sortBy === 'name' ? 'first_name' : sortBy;
		dataQuery = applySortFilter(dataQuery, dbSortBy, sortOrder);
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
	{ schema: workerFilterSchema }
);

/** Lightweight worker list for ComboBox selectors (no pagination) */
export const getWorkersForSelect = createAction<
	void,
	{ id: string; name: string }[]
>(async (_input, { supabase }) => {
	const { data, error } = await supabase
		.from('temporary_workers')
		.select('id, first_name, last_name')
		.is('deleted_at', null)
		.order('first_name');

	if (error) throw error;

	return (data ?? []).map((worker) => ({
		id: worker.id,
		name: `${worker.first_name} ${worker.last_name}`,
	}));
});

// ============================================================================
// Mutations
// ============================================================================

/**
 * Creates a new worker.
 *
 * @param input - Worker data (firstName, lastName, phone)
 * @returns Created worker record
 *
 * @example
 * const result = await createWorker({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   phone: '+48 123 456 789',
 * });
 */
export const createWorker = createAction<CreateWorkerInput, Worker>(
	async (input, { supabase, user }) => {
		// Get user's organization_id from their profile
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('organization_id')
			.eq('id', user.id)
			.single();

		if (profileError) throw profileError;

		const { data, error } = await supabase
			.from('temporary_workers')
			.insert({
				first_name: input.firstName,
				last_name: input.lastName,
				phone: input.phone,
				organization_id: profile.organization_id,
			})
			.select()
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: createWorkerSchema }
);

/**
 * Updates an existing worker.
 * Only provided fields will be updated (partial update).
 *
 * @param input - Object with worker ID and fields to update
 * @returns Updated worker record
 *
 * @example
 * const result = await updateWorker({
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   firstName: 'Jane',
 *   phone: '+48 987 654 321',
 * });
 */
export const updateWorker = createAction<UpdateWorkerInput, Worker>(
	async (input, { supabase }) => {
		const { id, ...updateData } = input;

		const updates = Object.fromEntries(
			Object.entries(updateData)
				.filter(([, value]) => value !== undefined)
				.map(([key, value]) => {
					// Map camelCase input fields to snake_case database fields
					if (key === 'firstName') return ['first_name', value];
					if (key === 'lastName') return ['last_name', value];
					return [key, value];
				})
		);

		const { data, error } = await supabase
			.from('temporary_workers')
			.update(updates)
			.eq('id', id)
			.is('deleted_at', null)
			.select()
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: updateWorkerSchema }
);

/**
 * Soft deletes a worker by setting deleted_at timestamp.
 * The worker record is preserved in the database but excluded from normal queries.
 *
 * @param input - Object with worker ID
 * @returns Deleted worker record
 *
 * @example
 * const result = await deleteWorker({ id: '123e4567-e89b-12d3-a456-426614174000' });
 */
export const deleteWorker = createAction<DeleteWorkerInput, Worker>(
	async (input, { supabase }) => {
		const { data, error } = await supabase
			.from('temporary_workers')
			.update({ deleted_at: new Date().toISOString() })
			.eq('id', input.id)
			.is('deleted_at', null)
			.select()
			.single();

		if (error) throw error;
		return data;
	},
	{ schema: deleteWorkerSchema }
);
