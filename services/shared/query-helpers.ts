/**
 * Query that supports `.is()` method for null checks.
 * Matches Supabase PostgrestFilterBuilder signature.
 */
interface IsableQuery<Q> {
  is(column: string, value: null): Q;
}

/**
 * Query that supports `.or()` method for OR filters.
 */
interface OrableQuery<Q> {
  or(filters: string): Q;
}

/**
 * Query that supports `.order()` method for sorting.
 */
interface OrderableQuery<Q> {
  order(column: string, options: { ascending: boolean }): Q;
}


/**
 * Builds an OR filter string for Supabase text search across multiple columns.
 * Returns null if search term is empty/undefined.
 *
 * @param term - Search term to filter by
 * @param columns - Column names to search in
 * @param mode - Search mode: 'ilike' (case-insensitive, default) or 'like'
 * @returns Filter string for `.or()` method, or null if no search term
 *
 * @example
 * const filter = buildSearchFilter('john', ['name', 'email', 'phone']);
 *
 * if (filter) {
 *   query = query.or(filter);
 * }
 */
export function buildSearchFilter<T extends Record<string, unknown>>(
  term: string | undefined | null,
  columns: readonly (keyof T & string)[],
  mode: 'ilike' | 'like' = 'ilike'
): string | null {
  if (!term || term.trim() === '') {
    return null;
  }

  const sanitized = term.trim();
  return columns.map((col) => `${col}.${mode}.%${sanitized}%`).join(',');
}


/**
 * Applies soft-delete filter to a query.
 * Excludes records where deleted_at is not null (unless includeDeleted is true).
 *
 * @param query - Supabase query builder
 * @param includeDeleted - Whether to include soft-deleted records
 * @param column - Column name for deleted_at (default: 'deleted_at')
 * @returns Query with filter applied
 *
 * @example
 * let query = supabase.from('clients').select('*');
 * query = applySoftDeleteFilter(query, false);
 */
export function applySoftDeleteFilter<Q extends IsableQuery<Q>>(
  query: Q,
  includeDeleted: boolean,
  column = 'deleted_at'
): Q {
  if (!includeDeleted) {
    return query.is(column, null);
  }
  return query;
}

/**
 * Applies search filter to a query using OR conditions.
 *
 * @param query - Supabase query builder
 * @param filter - Pre-built filter string from buildSearchFilter()
 * @returns Query with filter applied (unchanged if filter is null)
 *
 * @example
 * const filter = buildSearchFilter(search, ['name', 'email']);
 * query = applySearchFilter(query, filter);
 */
export function applySearchFilter<Q extends OrableQuery<Q>>(
  query: Q,
  filter: string | null
): Q {
  if (filter) {
    return query.or(filter);
  }
  return query;
}

/**
 * Applies sorting to a query.
 *
 * @param query - Supabase query builder
 * @param column - Column name to sort by
 * @param order - Sort direction: 'asc' or 'desc'
 * @returns Query with sorting applied
 *
 * @example
 * query = applySortFilter(query, 'name', 'asc');
 */
export function applySortFilter<Q extends OrderableQuery<Q>>(
  query: Q,
  column: string,
  order: 'asc' | 'desc'
): Q {
  return query.order(column, { ascending: order === 'asc' });
}


/**
 * Configuration for list query filters.
 */
export interface ListFilterConfig<T extends Record<string, unknown>> {
  /** Search term */
  search?: string | null;
  /** Columns to search in */
  searchColumns?: readonly (keyof T & string)[];
  /** Whether to include soft-deleted records */
  includeDeleted?: boolean;
  /** Column to sort by */
  sortBy?: string;
  /** Sort direction */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Combined query interface for all filter methods.
 */
type FilterableQuery<Q> = IsableQuery<Q> & OrableQuery<Q> & OrderableQuery<Q>;

/**
 * Applies all list filters to a query in one call.
 *
 * @param query - Supabase query builder
 * @param config - Filter configuration
 * @returns Query with all filters applied
 *
 * @example
 * const query = applyListFilters(
 *   supabase.from('clients').select('*'),
 *   {
 *     search: 'acme',
 *     searchColumns: ['name', 'email'],
 *     includeDeleted: false,
 *     sortBy: 'name',
 *     sortOrder: 'asc',
 *   }
 * );
 */
export function applyListFilters<T extends Record<string, unknown>, Q extends FilterableQuery<Q>>(
  query: Q,
  config: ListFilterConfig<T>
): Q {
  let result = query;

  if (config.includeDeleted !== undefined) {
    result = applySoftDeleteFilter(result, config.includeDeleted);
  }

  if (config.search && config.searchColumns?.length) {
    const filter = buildSearchFilter<T>(config.search, config.searchColumns);
    result = applySearchFilter(result, filter);
  }

  if (config.sortBy && config.sortOrder) {
    result = applySortFilter(result, config.sortBy, config.sortOrder);
  }

  return result;
}
