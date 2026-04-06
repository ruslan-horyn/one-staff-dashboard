# Architecture Patterns - One Staff Dashboard

## Overview

This document describes 4 reusable patterns used across all CRUD modules. They work together to eliminate boilerplate, centralize logic, and make adding new modules a configuration task rather than a coding task.

```
┌─────────────────────────────────────────────────┐
│                   UI Component                   │
│         (DataTable, Form, Dialogs)               │
└──────────────┬──────────────────┬────────────────┘
               │                  │
         form data           display data
               │                  │
        ┌──────▼──────┐   ┌──────▼──────┐
        │   Mapper     │   │   Mapper     │
        │  .toDb()     │   │  .toForm()   │
        │  .toDisplay()│   │              │
        └──────┬───────┘   └──────────────┘
               │
        ┌──────▼──────────────────────────┐
        │        CRUD Factory              │
        │  create / getMany / update /     │
        │  softDelete / getById /          │
        │  getForSelect                    │
        │                                  │
        │  Uses: createAction (auth+zod)   │
        │  Uses: Query Builder (reads)     │
        │  Uses: Error Handler (errors)    │
        └──────┬──────────────────┬────────┘
               │                  │
        ┌──────▼──────┐   ┌──────▼──────┐
        │ Query Builder│   │Error Handler │
        │ (fluent API) │   │  Factory     │
        └──────┬───────┘   └─────────────┘
               │
        ┌──────▼──────┐
        │  Supabase    │
        │  (PostgreSQL) │
        └──────────────┘
```

---

## Pattern 1: CRUD Factory

### Problem

Every module (clients, workers, locations, positions) has the same 6 operations with the same structure. Writing them manually means ~150 lines of near-identical code per module.

### Solution

A factory function that generates all CRUD server actions from a configuration object.

### How it works

```typescript
// services/shared/crud-factory.ts

interface CrudServiceConfig<
  TTable extends keyof Database['public']['Tables'],
  TCreate,
  TUpdate extends { id: string },
  TDelete extends { id: string },
  TFilter,
  TEntity,
> {
  /** Supabase table name */
  table: TTable;

  /** Select expression (e.g., '*, clients(name)' for joins) */
  select?: string;

  /** Columns to search with ilike */
  searchColumns?: string[];

  /** Allowed sort columns */
  sortColumns?: readonly string[];

  /** Default sort configuration */
  defaultSort?: { by: string; order: 'asc' | 'desc' };

  /** Zod schemas for validation */
  schemas: {
    create: ZodType<TCreate>;
    update: ZodType<TUpdate>;
    delete: ZodType<TDelete>;
    filter: ZodType<TFilter>;
  };

  /** Enable soft delete (default: true) */
  softDelete?: boolean;

  /** Entity mapper for DB ↔ form conversion */
  mapper: EntityMapper<TEntity, TCreate>;

  /** Error handler for this module */
  errors: ErrorHandler;

  /** Lifecycle hooks for module-specific logic */
  hooks?: {
    /** Transform input before INSERT (e.g., add organization_id) */
    beforeCreate?: (input: Record<string, unknown>, ctx: ActionContext) => Promise<Record<string, unknown>>;
    /** Transform input before UPDATE */
    beforeUpdate?: (input: Record<string, unknown>, ctx: ActionContext) => Promise<Record<string, unknown>>;
  };

  /** Fields for the lightweight "for select" query */
  selectFields?: string;
}
```

### What it generates

```typescript
const service = createCrudService(config);

service.create(input)        // INSERT → validated, auth'd, mapped to DB columns
service.getById({ id })      // SELECT by id, soft-delete filtered
service.getMany(filter)      // Paginated list with search/sort (uses Query Builder)
service.update(input)        // Partial UPDATE, soft-delete filtered
service.softDelete({ id })   // SET deleted_at = now()
service.getForSelect()       // Lightweight [{id, name}] for ComboBox
```

### Usage per module

```typescript
// services/clients/service.ts
import { createCrudService } from '@/services/shared/crud-factory';
import { clientMapper } from './mapper';
import { clientErrors } from './error-handlers';
import * as schemas from './schemas';

export const clientService = createCrudService({
  table: 'clients',
  select: '*',
  searchColumns: ['name', 'email', 'phone', 'address'],
  sortColumns: ['name', 'created_at'],
  defaultSort: { by: 'created_at', order: 'desc' },
  schemas: {
    create: schemas.createClientSchema,
    update: schemas.updateClientSchema,
    delete: schemas.deleteClientSchema,
    filter: schemas.clientFilterSchema,
  },
  mapper: clientMapper,
  errors: clientErrors,
  hooks: {
    beforeCreate: async (dbData, { supabase, user }) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
      return { ...dbData, organization_id: profile!.organization_id };
    },
  },
  selectFields: 'id, name',
});
```

```typescript
// services/clients/actions.ts
'use server';

// Re-export as named server actions
// ('use server' directive makes these callable from client)
export const createClient = clientService.create;
export const getClient = clientService.getById;
export const getClients = clientService.getMany;
export const updateClient = clientService.update;
export const deleteClient = clientService.softDelete;
export const getClientsForSelect = clientService.getForSelect;
```

### Flow for `service.create(input)`:

```
1. createAction wrapper: auth check → Zod validation
2. mapper.toDb(input) → converts camelCase to snake_case columns
3. hooks.beforeCreate(dbData, ctx) → adds organization_id
4. supabase.from(table).insert(dbData).select(selectExpr).single()
5. Returns ActionResult<TEntity>
```

### Flow for `service.getMany(filter)`:

```
1. createAction wrapper: auth check → Zod validation
2. Query Builder: builds count + data queries in parallel
   - applySoftDelete → applySearch → applyFilters → applySort → applyPaginate
3. Promise.all([countQuery, dataQuery])
4. paginateResult(data, count, page, pageSize)
5. Returns ActionResult<PaginatedResult<TEntity>>
```

---

## Pattern 2: Error Handler Factory

### Problem

Every module has an `error-handlers.ts` with identical logic (~40 lines) differing only in messages and which codes are "blocking".

### Solution

A factory that creates a complete error handler from a config object.

### How it works

```typescript
// services/shared/error-handler-factory.ts

interface ErrorHandlerConfig {
  /** Error code → user-friendly message */
  messages: Record<string, string>;
  /** Error codes that should keep dialog open (shown inline) */
  blockingCodes?: string[];
  /** Default field for DUPLICATE_ENTRY errors */
  duplicateField?: string;
}

interface ErrorHandler {
  getMessage(error: ActionError): string;
  isBlocking(code: string): boolean;
  getDuplicateField(error: ActionError): string;
}

function createErrorHandler(config: ErrorHandlerConfig): ErrorHandler;
```

### Usage

```typescript
// services/clients/error-handlers.ts
import { createErrorHandler } from '@/services/shared/error-handler-factory';

export const clientErrors = createErrorHandler({
  messages: {
    DUPLICATE_ENTRY: 'A client with this email already exists',
    HAS_DEPENDENCIES: 'Cannot delete — has associated work locations.',
    NOT_FOUND: 'Client not found. It may have been deleted.',
  },
  blockingCodes: ['HAS_DEPENDENCIES'],
  duplicateField: 'email',
});
```

That's it. 10 lines instead of 40. The factory provides `getMessage()`, `isBlocking()`, and `getDuplicateField()` with consistent behavior.

### Default messages

The factory includes sensible defaults for common codes (FORBIDDEN, VALIDATION_ERROR, DATABASE_ERROR, INTERNAL_ERROR). Module-specific messages override these:

```typescript
const DEFAULT_MESSAGES: Record<string, string> = {
  FORBIDDEN: 'You do not have permission to perform this action.',
  VALIDATION_ERROR: 'Please check the form for errors.',
  DATABASE_ERROR: 'A database error occurred. Please try again.',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
};
```

---

## Pattern 3: Query Builder

### Problem

Every `getMany` action builds two parallel queries (count + data) with the same filter/search/sort logic applied to both. This is ~30 lines of repetitive query construction.

### Solution

A fluent query builder that constructs both queries and executes them in parallel.

### How it works

```typescript
// services/shared/query-builder.ts

class QueryBuilder<TEntity> {
  private supabase: SupabaseClient;
  private tableName: string;
  private selectExpr: string;
  private filters: Array<(query: any) => any> = [];
  private sortConfig: { column: string; order: 'asc' | 'desc' } | null = null;
  private paginationConfig: { page: number; pageSize: number } | null = null;

  constructor(supabase: SupabaseClient, table: string, select: string = '*') {
    this.supabase = supabase;
    this.tableName = table;
    this.selectExpr = select;
  }

  /** Filter out soft-deleted records */
  softDelete(includeDeleted = false): this {
    if (!includeDeleted) {
      this.filters.push((q) => q.is('deleted_at', null));
    }
    return this;
  }

  /** Add ilike search across multiple columns */
  search(term: string | undefined, columns: string[]): this {
    if (term && columns.length > 0) {
      const filter = columns.map((col) => `${col}.ilike.%${term}%`).join(',');
      this.filters.push((q) => q.or(filter));
    }
    return this;
  }

  /** Add an equality filter (skipped if value is undefined) */
  eq(column: string, value: string | undefined): this {
    if (value !== undefined) {
      this.filters.push((q) => q.eq(column, value));
    }
    return this;
  }

  /** Add a custom filter */
  where(fn: (query: any) => any): this {
    this.filters.push(fn);
    return this;
  }

  /** Set sort column and direction */
  sort(column: string | undefined, order: 'asc' | 'desc' = 'asc'): this {
    if (column) {
      this.sortConfig = { column, order };
    }
    return this;
  }

  /** Set pagination */
  paginate(page: number, pageSize: number): this {
    this.paginationConfig = { page, pageSize };
    return this;
  }

  /** Execute count + data queries in parallel, return PaginatedResult */
  async executeWithCount(): Promise<PaginatedResult<TEntity>> {
    const page = this.paginationConfig?.page ?? 1;
    const pageSize = this.paginationConfig?.pageSize ?? DEFAULT_PAGE_SIZE;

    // Build count query
    let countQuery = this.supabase
      .from(this.tableName)
      .select(this.selectExpr, { count: 'exact', head: true });

    // Build data query
    let dataQuery = this.supabase
      .from(this.tableName)
      .select(this.selectExpr);

    // Apply all filters to both
    for (const filter of this.filters) {
      countQuery = filter(countQuery);
      dataQuery = filter(dataQuery);
    }

    // Sort (data only)
    if (this.sortConfig) {
      dataQuery = dataQuery.order(this.sortConfig.column, {
        ascending: this.sortConfig.order === 'asc',
      });
    }

    // Paginate (data only)
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    dataQuery = dataQuery.range(from, to);

    // Execute in parallel
    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    if (countResult.error) throw countResult.error;
    if (dataResult.error) throw dataResult.error;

    return paginateResult(
      dataResult.data ?? [],
      countResult.count ?? 0,
      page,
      pageSize
    );
  }

  /** Execute single data query (no count, no pagination) */
  async execute(): Promise<TEntity[]> {
    let query = this.supabase.from(this.tableName).select(this.selectExpr);

    for (const filter of this.filters) {
      query = filter(query);
    }

    if (this.sortConfig) {
      query = query.order(this.sortConfig.column, {
        ascending: this.sortConfig.order === 'asc',
      });
    }

    const { data, error } = await query;
    if (error) throw error;
    return data ?? [];
  }
}

/** Entry point */
function queryBuilder<TEntity>(
  supabase: SupabaseClient,
  table: string,
  select?: string,
): QueryBuilder<TEntity> {
  return new QueryBuilder<TEntity>(supabase, table, select);
}
```

### Usage in CRUD Factory (internal)

```typescript
// Inside createCrudService → getMany handler:
const result = await queryBuilder<TEntity>(supabase, config.table, config.select)
  .softDelete(filter.includeDeleted)
  .search(filter.search, config.searchColumns)
  .eq('client_id', filter.clientId)  // optional filter
  .sort(filter.sortBy, filter.sortOrder)
  .paginate(filter.page, filter.pageSize)
  .executeWithCount();

return result;
```

### Usage standalone (for custom queries)

```typescript
// When CRUD Factory doesn't fit (e.g., reports, board view)
const workers = await queryBuilder<Worker>(supabase, 'temporary_workers')
  .softDelete()
  .search(search, ['first_name', 'last_name', 'phone'])
  .sort('first_name', 'asc')
  .paginate(1, 50)
  .executeWithCount();
```

---

## Pattern 4: Mapper

### Problem

DB uses `snake_case`, frontend forms use `camelCase`. This mapping is scattered across hooks, actions, and components — different places for different modules, error-prone, hard to find.

### Solution

One mapper per entity with three standard methods.

### How it works

```typescript
// services/shared/mapper.ts

interface EntityMapper<TEntity, TFormInput> {
  /** Entity from DB → form default values (for editing) */
  toForm(entity: TEntity): TFormInput;

  /** Form input → DB columns (for create/update) */
  toDb(input: TFormInput): Record<string, unknown>;

  /** Default empty form values (for creating) */
  defaultValues: TFormInput;
}
```

### Usage

```typescript
// services/clients/mapper.ts
import type { Client } from '@/types/client';
import type { CreateClientInput } from './schemas';
import type { EntityMapper } from '@/services/shared/mapper';

export const clientMapper: EntityMapper<Client, CreateClientInput> = {
  defaultValues: {
    name: '',
    email: '',
    phone: '',
    address: '',
  },

  toForm: (entity) => ({
    name: entity.name,
    email: entity.email,
    phone: entity.phone,
    address: entity.address,
  }),

  toDb: (input) => ({
    name: input.name,
    email: input.email,
    phone: input.phone,
    address: input.address,
  }),
};
```

```typescript
// services/work-locations/mapper.ts
import type { WorkLocationWithClient } from '@/types/work-location';
import type { CreateWorkLocationInput } from './schemas';

export const workLocationMapper: EntityMapper<WorkLocationWithClient, CreateWorkLocationInput> = {
  defaultValues: {
    clientId: '',
    name: '',
    address: '',
    email: '',
    phone: '',
  },

  toForm: (entity) => ({
    clientId: entity.client_id,
    name: entity.name,
    address: entity.address,
    email: entity.email ?? '',
    phone: entity.phone ?? '',
  }),

  toDb: (input) => ({
    client_id: input.clientId,
    name: input.name,
    address: input.address,
    email: input.email || null,
    phone: input.phone || null,
  }),
};
```

### Where mappers are used

| Who calls | Method | When |
|-----------|--------|------|
| CRUD Factory → create | `mapper.toDb(input)` | Before INSERT |
| CRUD Factory → update | `mapper.toDb(input)` | Before UPDATE |
| Form hook (via DI) | `mapper.toForm(entity)` | Reset form for edit mode |
| Form hook (via DI) | `mapper.defaultValues` | Reset form for create mode |

Form hooks receive the mapper via dependency injection — they never import it directly:

```typescript
// Generic form hook
function useCrudForm<TEntity, TInput>({
  mapper,
  schema,
  onSubmit,
}: {
  mapper: EntityMapper<TEntity, TInput>;
  schema: ZodType<TInput>;
  onSubmit: (data: TInput) => Promise<void>;
}) {
  const form = useForm<TInput>({
    resolver: zodResolver(schema),
    defaultValues: mapper.defaultValues,
  });
  // ...
}

// Usage in component
const { form, isPending } = useCrudForm({
  mapper: clientMapper,
  schema: createClientSchema,
  onSubmit: async (data) => {
    const result = isEdit
      ? await updateClient({ id: entity.id, ...data })
      : await createClient(data);
    // ...
  },
});
```

---

## How patterns work together (full flow)

### Adding a new module (e.g., Workers)

**Step 1: Define schemas** (already exists in `services/workers/schemas.ts`)

**Step 2: Create mapper** (~15 lines)
```typescript
export const workerMapper: EntityMapper<Worker, CreateWorkerInput> = {
  defaultValues: { firstName: '', lastName: '', phone: '' },
  toForm: (e) => ({ firstName: e.first_name, lastName: e.last_name, phone: e.phone }),
  toDb: (i) => ({ first_name: i.firstName, last_name: i.lastName, phone: i.phone }),
};
```

**Step 3: Create error handler** (~10 lines)
```typescript
export const workerErrors = createErrorHandler({
  messages: {
    DUPLICATE_ENTRY: 'A worker with this phone number already exists',
    HAS_DEPENDENCIES: 'Cannot delete — has active assignments.',
  },
  blockingCodes: ['HAS_DEPENDENCIES'],
  duplicateField: 'phone',
});
```

**Step 4: Create service** (~20 lines)
```typescript
export const workerService = createCrudService({
  table: 'temporary_workers',
  searchColumns: ['first_name', 'last_name', 'phone'],
  sortColumns: ['name', 'created_at'],
  schemas: { create: createWorkerSchema, update: updateWorkerSchema, ... },
  mapper: workerMapper,
  errors: workerErrors,
  hooks: {
    beforeCreate: async (dbData, { supabase, user }) => ({
      ...dbData,
      organization_id: await getOrgId(supabase, user),
    }),
  },
});
```

**Step 5: Export server actions** (~10 lines)
```typescript
'use server';
export const createWorker = workerService.create;
export const getWorkers = workerService.getMany;
// ...
```

**Step 6: Create page** — uses generic DataTable + hooks with config.

**Total service layer: ~55 lines** (vs ~250 lines without patterns).
