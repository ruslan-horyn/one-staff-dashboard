# US-003 Backend Implementation: Client Management by Administrator

## Context

Expert full-stack developer working on One Staff Dashboard - an internal MVP web application for a temporary staffing agency. The task is to review and complete the backend implementation for US-003 (Client Management).

**Tech Stack:**

- Next.js 16 (app router) with Server Actions
- React 19, TypeScript 5
- Supabase (PostgreSQL + JWT auth)
- Zod for validation
- Vitest for unit tests

**Project Patterns:**

- Server Actions use `createAction()` wrapper from `/services/shared/`
- All actions return `ActionResult<T>` type
- Soft delete pattern with `deleted_at` timestamp
- Multi-tenancy via `organization_id` (RLS enforced)

## Source Files

### Primary (must read)

- `docs/prd.md` - US-003 acceptance criteria
- `docs/tech-stack.md` - Technology stack details
- `docs/directory-architecture.md` - Project structure and patterns
- `docs/ui-architecture.md` - Section 2.5 and 2.6 for clients views requirements

### Database Schema

- `types/database.ts` - Supabase types (clients table: id, name, email, phone, address, organization_id, deleted_at)

### Existing Backend

- `services/clients/actions.ts` - Current server actions
- `services/clients/schemas.ts` - Zod validation schemas
- `services/clients/index.ts` - Barrel exports

### Reference Patterns

- `services/shared/action-wrapper.ts` - createAction() HOF
- `services/shared/errors.ts` - Error codes (HAS_DEPENDENCIES, FORBIDDEN)
- `services/shared/auth.ts` - Authentication utilities
- `services/workers/actions.ts` - Example of similar CRUD implementation

## Tasks

### Phase 1: Analysis

1. Read `docs/prd.md` and extract US-003 acceptance criteria:
   - View list of all clients
   - Add new client (name required)
   - Edit client name
   - Delete client (only if no work_locations)

2. Read `docs/ui-architecture.md` sections 2.5 and 2.6 to understand:
   - Clients page requires Admin role only
   - Expected fields: name, email, phone, address, location count
   - Delete validation for HAS_DEPENDENCIES

3. Read `types/database.ts` to understand:
   - `clients` table structure
   - `work_locations` table and its `client_id` foreign key
   - Available Supabase functions

4. Read existing `services/clients/actions.ts` and identify gaps:
   - Is admin role authorization implemented?
   - Does deleteClient check for work_locations dependencies?
   - Is location count included in getClients response?

### Phase 2: Implementation

Based on analysis, implement missing functionality:

1. **Admin Role Authorization** (if missing):
   - Add role check in createAction options or manually
   - Return FORBIDDEN error for non-admin users

2. **Delete with Dependency Check** (if missing):
   - Before soft delete, check if `work_locations` exist for the client
   - Return `HAS_DEPENDENCIES` error with count of related locations

3. **Location Count in List** (if missing for UI):
   - Consider adding `getClientsWithLocationCount` query
   - Or extend getClients to include location count via join

4. **Unit Tests**:
   - Create `services/clients/__tests__/actions.test.ts`
   - Test happy paths and error cases
   - Test admin role authorization
   - Test HAS_DEPENDENCIES error

### Phase 3: Validation

1. Run TypeScript compiler: `pnpm tsc --noEmit`
2. Run linter fix: `pnpm lint:fix`
3. Run tests: `pnpm test services/clients`
4. Verify all US-003 acceptance criteria are met

## Output Format

### Code Structure

Server action with dependency check example:

```typescript
export const deleteClient = createAction<DeleteClientInput, Client>(
  async (input, { supabase }) => {
    // Check for work_locations dependencies
    const { count } = await supabase
      .from('work_locations')
      .select('*', { count: 'exact', head: true })
      .eq('client_id', input.id)
      .is('deleted_at', null);

    if (count && count > 0) {
      throw new ActionError('HAS_DEPENDENCIES', `Cannot delete: ${count} work locations exist`);
    }

    // Proceed with soft delete...
  },
  { schema: deleteClientSchema, requireAdmin: true }
);
```

### Test Structure

```typescript
describe('clients actions', () => {
  describe('deleteClient', () => {
    it('should return HAS_DEPENDENCIES error when work_locations exist', async () => {
      // Arrange: create client with work_location
      // Act: call deleteClient
      // Assert: expect failure with HAS_DEPENDENCIES code
    });
  });
});
```

## Success Criteria

### Measurable Goals

- [ ] All server actions pass TypeScript compilation
- [ ] Admin-only actions reject coordinator role with FORBIDDEN error
- [ ] deleteClient returns HAS_DEPENDENCIES when work_locations exist
- [ ] Unit tests cover all CRUD operations and error cases
- [ ] Test coverage >= 90% for clients module

### Validation Method

- Run `pnpm tsc --noEmit` - zero errors
- Run `pnpm test services/clients --coverage` - all pass, >= 90%
- Manual test via Supabase MCP tools to verify RLS and business logic

## Constraints

- DO NOT modify database schema or migrations
- DO NOT create new API routes in `/app/api/` - use Server Actions only
- DO NOT add new dependencies without approval
- ONLY implement backend logic, no UI components
- Preserve existing patterns from `services/shared/`
- Follow conventional commits format for any commits
- Use Polish for user-facing error messages (if i18n is implemented)
