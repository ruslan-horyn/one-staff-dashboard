You are an experienced TypeScript developer tasked with creating Zod validation schemas for a Next.js application. Your task is to analyze the database models, server actions plan, and existing type definitions, then generate comprehensive Zod schemas for all server actions.

First, carefully review the following inputs:

1. Database models:
<database_models>
types/database.ts
</database_models>

2. Server Actions Plan (containing validation requirements):
<server_actions_plan>
.ai/server-actions-plan.md
</server_actions_plan>

3. Existing Type Definitions:
<type_definitions>
types/client.ts
types/work-location.ts
types/position.ts
types/worker.ts
types/assignment.ts
types/report.ts
types/common.ts
</type_definitions>

Your task is to create Zod validation schemas for each module following these guidelines:

## Schema Naming Conventions

- `create[Entity]Schema` - for create operations (e.g., `createClientSchema`)
- `update[Entity]Schema` - for update operations (e.g., `updateClientSchema`)
- `delete[Entity]Schema` - for delete operations (simple UUID validation)
- `[entity]FilterSchema` - for query filter parameters (e.g., `clientFilterSchema`)
- `[entity]IdSchema` - for single ID parameter validation

## Output Structure

Generate one schema file per module in `/services/[module]/schemas.ts`:

- `/services/auth/schemas.ts`
- `/services/clients/schemas.ts`
- `/services/work-locations/schemas.ts`
- `/services/positions/schemas.ts`
- `/services/workers/schemas.ts`
- `/services/assignments/schemas.ts`
- `/services/reports/schemas.ts`

## Schema Requirements

For each schema, ensure:

1. **String validations:**
   - Use `.trim()` for text inputs
   - Apply `.min(1)` for required strings
   - Apply `.max(n)` based on database constraints (e.g., name: 255 chars)
   - Use `.email()` for email fields
   - Use `.uuid()` for ID fields
   - Use `.regex()` for phone numbers: `/^[\d\s\-\(\)\+]+$/`

2. **Optional vs Nullable:**
   - Use `.optional()` for fields that can be omitted
   - Use `.nullable()` for fields that can be explicitly set to null
   - Use `.optional().nullable()` for fields that can be both

3. **Date/DateTime:**
   - Use `.datetime()` for ISO datetime strings
   - Use `.date()` for date-only strings
   - Add `.refine()` for date range validations (e.g., endAt > startAt)

4. **Enums:**
   - Use `z.enum()` for status fields matching database enums
   - Reference: `assignment_status: "scheduled" | "active" | "completed" | "cancelled"`
   - Reference: `user_role: "admin" | "coordinator"`

5. **Pagination and Sorting:**
   - Create reusable `paginationSchema` and `sortSchema` in `/services/shared/schemas.ts`
   - Compose these into filter schemas using `.merge()` or `.extend()`

## Type Exports

For each schema, export the inferred TypeScript type:

```typescript
export const createClientSchema = z.object({ ... });
export type CreateClientInput = z.infer<typeof createClientSchema>;
```

## Example Schema Structure

```typescript
// /services/clients/schemas.ts
import { z } from 'zod';

// Create schema
export const createClientSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format').optional().nullable(),
  phone: z
    .string()
    .regex(/^[\d\s\-\(\)\+]+$/, 'Invalid phone format')
    .min(9)
    .max(20)
    .optional()
    .nullable(),
  address: z.string().trim().min(1).max(500).optional().nullable(),
});

// Update schema (all fields optional except id)
export const updateClientSchema = z.object({
  id: z.string().uuid('Invalid client ID'),
  name: z.string().trim().min(1).max(255).optional(),
  email: z.string().email().optional().nullable(),
  phone: z
    .string()
    .regex(/^[\d\s\-\(\)\+]+$/)
    .min(9)
    .max(20)
    .optional()
    .nullable(),
  address: z.string().trim().min(1).max(500).optional().nullable(),
});

// Delete schema
export const deleteClientSchema = z.object({
  id: z.string().uuid('Invalid client ID'),
});

// Filter schema for queries
export const clientFilterSchema = z.object({
  search: z.string().optional(),
  includeDeleted: z.boolean().optional().default(false),
});

// Inferred types
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type DeleteClientInput = z.infer<typeof deleteClientSchema>;
export type ClientFilter = z.infer<typeof clientFilterSchema>;
```

## Process

Before creating the final output, work inside <schema_analysis> tags in your thinking block to:

1. List all Server Actions from the plan, grouped by module
2. For each action, identify:
   - Input parameters and their types
   - Validation rules specified in the plan
   - Database constraints from types/database.ts
3. Map Command Models from type files to corresponding schemas
4. Identify shared schemas (pagination, sorting, date ranges)

## Output

Generate complete schema files for all modules. Each file should:

1. Import Zod at the top
2. Import shared schemas if needed
3. Define all schemas for that module
4. Export inferred types for each schema
5. Include JSDoc comments describing each schema's purpose

Remember:
- Ensure consistency with existing Command Model types in /types/
- Use descriptive error messages for better UX
- Keep schemas DRY by extracting common patterns
