'use server';

import { createAction } from '@/services/shared';
import {
  applyPaginationToQuery,
  DEFAULT_PAGE_SIZE,
  paginateResult,
  type PaginatedResult,
} from '@/services/shared/pagination';
import {
  applySearchFilter,
  applySoftDeleteFilter,
  applySortFilter,
  buildSearchFilter,
} from '@/services/shared/query-helpers';

import {
  CLIENT_SEARCHABLE_COLUMNS,
  clientFilterSchema,
  clientIdSchema,
  createClientSchema,
  deleteClientSchema,
  updateClientSchema,
  type ClientFilter,
  type ClientIdInput,
  type CreateClientInput,
  type DeleteClientInput,
  type UpdateClientInput,
} from './schemas';
import { Client } from '@/types';

/**
 * Creates a new client.
 *
 * @param input - Client data (name, email, phone, address)
 * @returns Created client record
 *
 * @example
 * const result = await createClient({
 *   name: 'Acme Corp',
 *   email: 'contact@acme.com',
 *   phone: '+48 123 456 789',
 *   address: 'ul. Główna 1, 00-001 Warszawa',
 * });
 */
export const createClient = createAction<CreateClientInput, Client>(
  async (input, { supabase }) => {
    const { data, error } = await supabase
      .from('clients')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  { schema: createClientSchema }
);

/**
 * Retrieves a single client by ID.
 *
 * @param input - Object with client ID
 * @returns Client record or NOT_FOUND error
 *
 * @example
 * const result = await getClient({ id: '123e4567-e89b-12d3-a456-426614174000' });
 */
export const getClient = createAction<ClientIdInput, Client>(
  async (input, { supabase }) => {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', input.id)
      .is('deleted_at', null)
      .single();

    if (error) throw error;
    return data;
  },
  { schema: clientIdSchema }
);

/**
 * Retrieves a paginated list of clients with optional filtering and sorting.
 *
 * @param input - Filter options (page, pageSize, search, sortBy, sortOrder, includeDeleted)
 * @returns Paginated list of clients with metadata
 *
 * @example
 * const result = await getClients({
 *   page: 1,
 *   pageSize: 20,
 *   search: 'Acme',
 *   sortBy: 'name',
 *   sortOrder: 'asc',
 * });
 */
export const getClients = createAction<ClientFilter, PaginatedResult<Client>>(
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
    const searchFilter = buildSearchFilter<Client>(search, CLIENT_SEARCHABLE_COLUMNS);

    // Build count query
    let countQuery = supabase.from('clients').select('*', { count: 'exact', head: true });
    countQuery = applySoftDeleteFilter(countQuery, includeDeleted);
    countQuery = applySearchFilter(countQuery, searchFilter);

    // Build data query
    let dataQuery = supabase.from('clients').select('*');
    dataQuery = applySoftDeleteFilter(dataQuery, includeDeleted);
    dataQuery = applySearchFilter(dataQuery, searchFilter);
    dataQuery = applySortFilter(dataQuery, sortBy, sortOrder);
    dataQuery = applyPaginationToQuery(dataQuery, page, pageSize);

    // Execute both queries in parallel
    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    if (countResult.error) throw countResult.error;
    if (dataResult.error) throw dataResult.error;

    return paginateResult(dataResult.data ?? [], countResult.count ?? 0, page, pageSize);
  },
  { schema: clientFilterSchema }
);

/**
 * Updates an existing client.
 * Only provided fields will be updated (partial update).
 *
 * @param input - Object with client ID and fields to update
 * @returns Updated client record
 *
 * @example
 * const result = await updateClient({
 *   id: '123e4567-e89b-12d3-a456-426614174000',
 *   name: 'Acme Corporation',
 *   email: 'new-contact@acme.com',
 * });
 */
export const updateClient = createAction<UpdateClientInput, Client>(
  async (input, { supabase }) => {
    const { id, ...updateData } = input;

    const updates = Object.fromEntries(
      Object.entries(updateData).filter(([, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  { schema: updateClientSchema }
);

/**
 * Soft deletes a client by setting deleted_at timestamp.
 * The client record is preserved in the database but excluded from normal queries.
 *
 * @param input - Object with client ID
 * @returns Deleted client record
 *
 * @example
 * const result = await deleteClient({ id: '123e4567-e89b-12d3-a456-426614174000' });
 */
export const deleteClient = createAction<DeleteClientInput, Client>(
  async (input, { supabase }) => {
    const { data, error } = await supabase
      .from('clients')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', input.id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  { schema: deleteClientSchema }
);
