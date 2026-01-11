# Server Actions & Data Layer Plan

## Implementation Status

| Module | Actions | Schemas | Status |
|--------|---------|---------|--------|
| **Shared** | ✅ `createAction` wrapper | ✅ | Complete |
| **Auth** | ✅ All implemented | ✅ | Complete |
| **Organizations** | ❌ Not implemented | ❌ | Not started |
| **Users** | ❌ Not implemented | ❌ | Not started |
| **Clients** | ✅ All implemented | ✅ | Complete |
| **WorkLocations** | ❌ Not implemented | ✅ | Schemas only |
| **Positions** | ❌ Not implemented | ✅ | Schemas only |
| **Workers** | ❌ Not implemented | ✅ | Schemas only |
| **Assignments** | ❌ Not implemented | ✅ | Schemas only |
| **Reports** | ❌ Not implemented | ✅ | Schemas only |

---

## 1. Data Modules

List of modules corresponding to business entities:

| Module | Database Table(s) | Responsibility |
|--------|-------------------|----------------|
| **Auth** | `profiles`, `auth.users` | User authentication, session management, profile data |
| **Organizations** | `organizations` | Organization settings, name management |
| **Users** | `profiles`, `auth.users` | User management within organization (invite, deactivate, list) |
| **Clients** | `clients` | Client company CRUD operations (admin only) |
| **WorkLocations** | `work_locations` | Work location CRUD operations (admin only) |
| **Positions** | `positions` | Position CRUD operations (any authenticated) |
| **Workers** | `temporary_workers` | Temporary worker CRUD operations (any authenticated) |
| **Assignments** | `assignments` | Assignment lifecycle management (create, end, cancel) |
| **Reports** | `assignments`, `temporary_workers`, aggregations | Hours reports and exports |

### File Structure

```
/services/
  /shared/
    action-wrapper.ts    # createAction HOF wrapper
    auth.ts              # Authentication helpers (AuthenticationError)
    errors.ts            # Error codes and Supabase/Auth/Zod error mapping
    pagination.ts        # Pagination helpers and constants
    query-helpers.ts     # Search, sort, soft-delete query builders
    result.ts            # ActionResult<T> type and utilities
    schemas.ts           # Shared validation schemas (uuid, pagination)
    index.ts             # Barrel exports
  /auth/
    actions.ts           # Server actions (mutations + queries)
    schemas.ts           # Zod validation schemas
    index.ts             # Barrel exports
  /organizations/
    actions.ts           # Server actions (get, update)
    schemas.ts           # Zod validation schemas
    index.ts             # Barrel exports
  /users/
    actions.ts           # Server actions (getUsers, invite, deactivate, reactivate)
    schemas.ts           # Zod validation schemas
    index.ts             # Barrel exports
  /clients/
    actions.ts           # Server actions (mutations + queries)
    schemas.ts           # Zod validation schemas
    index.ts             # Barrel exports
  /work-locations/
    actions.ts           # Server actions (mutations + queries)
    schemas.ts           # Zod validation schemas
    index.ts             # Barrel exports
  /positions/
    actions.ts           # Server actions (mutations + queries)
    schemas.ts           # Zod validation schemas
    index.ts             # Barrel exports
  /workers/
    actions.ts           # Server actions (mutations + queries)
    schemas.ts           # Zod validation schemas
    index.ts             # Barrel exports
  /assignments/
    actions.ts           # Server actions (mutations + queries)
    schemas.ts           # Zod validation schemas
    index.ts             # Barrel exports
  /reports/
    actions.ts           # Server actions (mutations + queries)
    schemas.ts           # Zod validation schemas
    index.ts             # Barrel exports
  index.ts               # Barrel exports
```

**Note:** Both mutations and queries are implemented in `actions.ts` using the `createAction` wrapper. This simplifies the architecture and provides consistent error handling for all operations.

---

## 2. Server Actions (Mutations)

### Auth Module ✅ IMPLEMENTED

#### signIn ✅

- **Description**: Authenticate user with email/password via Supabase Auth
- **Input Parameters**:
  - `email` (string, required): User email address
  - `password` (string, required): User password
- **Return Type**: `ActionResult<AuthResponse>`
- **Validation**:
  - `email`: Valid email format
  - `password`: Minimum 8 characters
- **Authorization**: Public (`requireAuth: false`)
- **Error Handling**:
  - `INVALID_CREDENTIALS`: Wrong email or password (via `error.code`)
  - `SESSION_EXPIRED`: JWT issues
- **Supabase**: `supabase.auth.signInWithPassword()`

#### signUp ✅

- **Description**: Register a new user with organization. Creates new organization and assigns user as Administrator.
- **Input Parameters**:
  - `email` (string, required): User email address
  - `password` (string, required): User password (min 8 chars)
  - `firstName` (string, required): First name (1-100 chars)
  - `lastName` (string, required): Last name (1-100 chars)
  - `organizationName` (string, required): Organization name (1-255 chars)
- **Return Type**: `ActionResult<AuthResponse>`
- **Validation**:
  - `email`: Valid email format
  - `password`: Minimum 8 characters
  - `firstName`: 1-100 characters
  - `lastName`: 1-100 characters
  - `organizationName`: 1-255 characters, required, trimmed
- **Authorization**: Public (`requireAuth: false`)
- **Error Handling**:
  - `DUPLICATE_ENTRY`: Email already exists
  - `VALIDATION_ERROR`: Weak password or invalid organization name
- **Supabase**:

  ```typescript
  supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        organization_name: organizationName, // Trigger handle_new_user() uses this
      },
    },
  })
  ```

#### signOut ✅

- **Description**: Sign out current user and invalidate session
- **Input Parameters**: None (empty object)
- **Return Type**: `ActionResult<{ success: boolean }>`
- **Validation**: None
- **Authorization**: Any authenticated user
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
- **Supabase**: `supabase.auth.signOut()`

#### updateProfile ✅

- **Description**: Update current user's profile information
- **Input Parameters**:
  - `firstName` (string, required): First name (1-100 chars)
  - `lastName` (string, required): Last name (1-100 chars)
- **Return Type**: `ActionResult<Profile>`
- **Validation**:
  - `firstName`: 1-100 characters, trimmed
  - `lastName`: 1-100 characters, trimmed
- **Authorization**: Any authenticated user (RLS enforces own profile only)
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `VALIDATION_ERROR`: Invalid input data
- **Supabase**: `supabase.from('profiles').update()`

#### getCurrentUser ✅

- **Description**: Get current authenticated user with profile data
- **Input Parameters**: None (empty object)
- **Return Type**: `ActionResult<UserWithProfile>`
- **Validation**: None
- **Authorization**: Any authenticated user
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `NOT_FOUND`: Profile not found
- **Supabase**: `supabase.from('profiles').select().eq('id', user.id)`

#### resetPassword ✅

- **Description**: Send password reset email (always returns success for security)
- **Input Parameters**:
  - `email` (string, required): User email address
- **Return Type**: `ActionResult<{ success: boolean }>`
- **Validation**:
  - `email`: Valid email format
- **Authorization**: Public (`requireAuth: false`)
- **Error Handling**: Always returns success (security best practice)
- **Supabase**: `supabase.auth.resetPasswordForEmail()`

#### updatePassword ✅

- **Description**: Update password for current user (after reset link)
- **Input Parameters**:
  - `newPassword` (string, required): New password (min 8 chars)
- **Return Type**: `ActionResult<{ success: boolean }>`
- **Validation**:
  - `newPassword`: Minimum 8 characters
- **Authorization**: Any authenticated user
- **Error Handling**:
  - `VALIDATION_ERROR`: Weak password or same as current
- **Supabase**: `supabase.auth.updateUser()`

---

### Organizations Module ⏳ TODO

#### getOrganization

- **Description**: Get current user's organization
- **Input Parameters**: None (empty object)
- **Return Type**: `ActionResult<Organization>`
- **Validation**: None
- **Authorization**: Any authenticated user
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `NOT_FOUND`: Organization not found (should not happen)
- **Supabase**: `supabase.from('organizations').select().eq('id', user_organization_id()).single()`

#### updateOrganization

- **Description**: Update organization name
- **Input Parameters**:
  - `name` (string, required): Organization name (1-255 chars)
- **Return Type**: `ActionResult<Organization>`
- **Validation**:
  - `name`: 1-255 characters, trimmed, required
- **Authorization**: Admin only (RLS enforced via `organizations_update` policy)
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `FORBIDDEN`: User is not admin
  - `VALIDATION_ERROR`: Invalid input (empty name, too long)
- **Supabase**: `supabase.from('organizations').update({ name }).select().single()`

---

### Users Module ⏳ TODO

#### getUsers

- **Description**: List all users in current organization
- **Input Parameters**:
  - `page` (number, optional): Page number (default: 1)
  - `pageSize` (number, optional): Items per page (default: 20, max: 100)
  - `search` (string, optional): Search by name or email
- **Return Type**: `ActionResult<PaginatedResult<Profile>>`
- **Validation**:
  - `page`: Positive integer
  - `pageSize`: 1-100
  - `search`: Optional string, max 100 chars
- **Authorization**: Admin only
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `FORBIDDEN`: User is not admin
  - `VALIDATION_ERROR`: Invalid pagination params
- **Supabase**:

  ```typescript
  supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .eq('organization_id', user_organization_id())
    .ilike('first_name || last_name || email', `%${search}%`)
    .range(offset, offset + pageSize - 1)
  ```

#### inviteUser

- **Description**: Invite a new Coordinator to the organization
- **Input Parameters**:
  - `email` (string, required): User email address
  - `firstName` (string, required): First name (1-100 chars)
  - `lastName` (string, required): Last name (1-100 chars)
- **Return Type**: `ActionResult<{ success: boolean }>`
- **Validation**:
  - `email`: Valid email format, required
  - `firstName`: 1-100 characters, trimmed
  - `lastName`: 1-100 characters, trimmed
- **Authorization**: Admin only
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `FORBIDDEN`: User is not admin
  - `DUPLICATE_ENTRY`: Email already exists in system
  - `VALIDATION_ERROR`: Invalid input
- **Supabase**:

  ```typescript
  // Use Supabase Admin API (requires service role key)
  supabase.auth.admin.inviteUserByEmail(email, {
    data: {
      first_name: firstName,
      last_name: lastName,
      invited_to_organization_id: currentUser.organization_id,
      role: 'coordinator',
    },
  })
  ```

- **Notes**:
  - Requires trigger `handle_user_invitation()` to create profile for invited users
  - Invited user receives email with link to set password

#### deactivateUser

- **Description**: Deactivate a user account (soft ban)
- **Input Parameters**:
  - `userId` (string, required): User UUID
- **Return Type**: `ActionResult<Profile>`
- **Validation**:
  - `userId`: Valid UUID
  - Cannot deactivate self
  - User must belong to same organization
- **Authorization**: Admin only
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `FORBIDDEN`: User is not admin or trying to deactivate self
  - `NOT_FOUND`: User not found in organization
  - `VALIDATION_ERROR`: Invalid UUID or trying to deactivate self
- **Supabase**:

  ```typescript
  // Use Supabase Admin API to ban user
  supabase.auth.admin.updateUserById(userId, {
    ban_duration: 'none', // Permanent ban (until reactivated)
    banned: true,
  })
  ```

- **Notes**:
  - Banned users cannot log in
  - Consider adding `is_active` column to profiles for RLS filtering

#### reactivateUser

- **Description**: Reactivate a deactivated user
- **Input Parameters**:
  - `userId` (string, required): User UUID
- **Return Type**: `ActionResult<Profile>`
- **Validation**:
  - `userId`: Valid UUID
  - User must belong to same organization
- **Authorization**: Admin only
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `FORBIDDEN`: User is not admin
  - `NOT_FOUND`: User not found in organization
  - `VALIDATION_ERROR`: Invalid UUID
- **Supabase**:

  ```typescript
  supabase.auth.admin.updateUserById(userId, {
    banned: false,
  })
  ```

---

### Clients Module ✅ IMPLEMENTED

#### createClient ✅

- **Description**: Create a new client company
- **Input Parameters**:
  - `name` (string, required): Company name (1-255 chars)
  - `email` (string, optional): Contact email
  - `phone` (string, optional): Contact phone
  - `address` (string, optional): Business address
- **Return Type**: `ActionResult<Client>`
- **Validation**:
  - `name`: 1-255 characters, required
  - `email`: Valid email format if provided
  - `phone`: Valid phone format if provided (digits, spaces, dashes, parens)
  - `address`: 1-500 characters if provided
- **Authorization**: Admin only (RLS enforced)
- **Error Handling**:
  - `FORBIDDEN`: User is not admin
  - `VALIDATION_ERROR`: Invalid input
  - `DUPLICATE_ENTRY`: Client with same name exists
- **Supabase**: `supabase.from('clients').insert()`

#### getClient ✅

- **Description**: Retrieve a single client by ID
- **Input Parameters**:
  - `id` (string, required): Client UUID
- **Return Type**: `ActionResult<Client>`
- **Validation**:
  - `id`: Valid UUID format
- **Authorization**: Any authenticated user (RLS enforced)
- **Error Handling**:
  - `NOT_FOUND`: Client does not exist or is deleted
- **Supabase**: `supabase.from('clients').select().eq('id', id).is('deleted_at', null)`

#### getClients ✅

- **Description**: Retrieve paginated list of clients with filtering and sorting
- **Input Parameters**:
  - `page` (number, optional): Page number (default: 1)
  - `pageSize` (number, optional): Items per page (default: 20, max: 100)
  - `search` (string, optional): Text search on name, email, phone, address
  - `sortBy` ('name' | 'created_at', optional): Sort field
  - `sortOrder` ('asc' | 'desc', optional): Sort direction (default: 'asc')
  - `includeDeleted` (boolean, optional): Include soft-deleted records (default: false)
- **Return Type**: `ActionResult<PaginatedResult<Client>>`
- **Validation**: All fields validated via Zod schema
- **Authorization**: Any authenticated user (RLS enforced)
- **Error Handling**:
  - `VALIDATION_ERROR`: Invalid pagination or filter params
- **Supabase**: Complex query with count + data in parallel

#### updateClient ✅

- **Description**: Update an existing client's information
- **Input Parameters**:
  - `id` (string, required): Client UUID
  - `name` (string, optional): Company name
  - `email` (string | null, optional): Contact email (null to remove)
  - `phone` (string | null, optional): Contact phone (null to remove)
  - `address` (string | null, optional): Business address (null to remove)
- **Return Type**: `ActionResult<Client>`
- **Validation**: Same as createClient for provided fields
- **Authorization**: Admin only (RLS enforced)
- **Error Handling**:
  - `FORBIDDEN`: User is not admin
  - `NOT_FOUND`: Client does not exist
  - `VALIDATION_ERROR`: Invalid input
- **Supabase**: `supabase.from('clients').update().eq('id', id).is('deleted_at', null)`

#### deleteClient ✅

- **Description**: Soft-delete a client (sets deleted_at timestamp)
- **Input Parameters**:
  - `id` (string, required): Client UUID
- **Return Type**: `ActionResult<Client>`
- **Validation**:
  - `id`: Valid UUID format
- **Authorization**: Admin only (RLS enforced)
- **Error Handling**:
  - `FORBIDDEN`: User is not admin
  - `NOT_FOUND`: Client does not exist
  - `HAS_DEPENDENCIES`: Client has active work locations
- **Supabase**: `supabase.from('clients').update({ deleted_at }).eq('id', id).is('deleted_at', null)`

---

### WorkLocations Module ⏳ TODO

#### createWorkLocation

- **Description**: Create a new work location for a client
- **Input Parameters**:
  - `clientId` (string, required): Parent client UUID
  - `name` (string, required): Location name (1-255 chars)
  - `address` (string, optional): Physical address
  - `email` (string, optional): Location contact email
  - `phone` (string, optional): Location contact phone
- **Return Type**: `ActionResult<WorkLocation>`
- **Validation**:
  - `clientId`: Valid UUID, client must exist and not be deleted
  - `name`: 1-255 characters
  - `address`: 1-500 characters if provided
  - `email`: Valid email format if provided
  - `phone`: Valid phone format if provided
- **Authorization**: Admin only (RLS enforced)
- **Error Handling**:
  - `FORBIDDEN`: User is not admin
  - `NOT_FOUND`: Referenced client does not exist
  - `VALIDATION_ERROR`: Invalid input
- **Supabase**: `supabase.from('work_locations').insert()`

#### updateWorkLocation

- **Description**: Update an existing work location
- **Input Parameters**:
  - `id` (string, required): Work location UUID
  - `name` (string, optional): Location name
  - `address` (string | null, optional): Physical address (null to remove)
  - `email` (string | null, optional): Contact email (null to remove)
  - `phone` (string | null, optional): Contact phone (null to remove)
- **Return Type**: `ActionResult<WorkLocation>`
- **Validation**: Same as create for provided fields
- **Authorization**: Admin only (RLS enforced)
- **Error Handling**:
  - `FORBIDDEN`: User is not admin
  - `NOT_FOUND`: Work location does not exist
  - `VALIDATION_ERROR`: Invalid input
- **Supabase**: `supabase.from('work_locations').update().eq('id', id)`

#### deleteWorkLocation

- **Description**: Soft-delete a work location
- **Input Parameters**:
  - `id` (string, required): Work location UUID
- **Return Type**: `ActionResult<void>`
- **Validation**:
  - `id`: Valid UUID format
- **Authorization**: Admin only (RLS enforced)
- **Error Handling**:
  - `FORBIDDEN`: User is not admin
  - `NOT_FOUND`: Work location does not exist
  - `HAS_DEPENDENCIES`: Location has active positions
- **Supabase**: `supabase.from('work_locations').update({ deleted_at }).eq('id', id)`

---

### Positions Module ⏳ TODO

#### createPosition

- **Description**: Create a new position at a work location
- **Input Parameters**:
  - `workLocationId` (string, required): Parent work location UUID
  - `name` (string, required): Position name (1-255 chars)
- **Return Type**: `ActionResult<Position>`
- **Validation**:
  - `workLocationId`: Valid UUID, work location must exist and not be deleted
  - `name`: 1-255 characters
- **Authorization**: Any authenticated user (RLS enforced)
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `NOT_FOUND`: Referenced location does not exist
  - `VALIDATION_ERROR`: Invalid input
- **Supabase**: `supabase.from('positions').insert()`

#### updatePosition

- **Description**: Update an existing position
- **Input Parameters**:
  - `id` (string, required): Position UUID
  - `name` (string, optional): Position name
  - `isActive` (boolean, optional): Active status
- **Return Type**: `ActionResult<Position>`
- **Validation**: Same as create for provided fields
- **Authorization**: Any authenticated user (RLS enforced)
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `NOT_FOUND`: Position does not exist
  - `VALIDATION_ERROR`: Invalid input
- **Supabase**: `supabase.from('positions').update().eq('id', id)`

#### deletePosition

- **Description**: Soft-delete a position
- **Input Parameters**:
  - `id` (string, required): Position UUID
- **Return Type**: `ActionResult<void>`
- **Validation**:
  - `id`: Valid UUID format
- **Authorization**: Any authenticated user (RLS enforced)
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `NOT_FOUND`: Position does not exist
  - `HAS_DEPENDENCIES`: Position has active/scheduled assignments
- **Supabase**: `supabase.from('positions').update({ deleted_at }).eq('id', id)`

---

### Workers Module ⏳ TODO

#### createWorker

- **Description**: Create a new temporary worker
- **Input Parameters**:
  - `firstName` (string, required): First name (1-100 chars)
  - `lastName` (string, required): Last name (1-100 chars)
  - `phone` (string, required): Phone number (will be normalized by DB trigger)
- **Return Type**: `ActionResult<Worker>`
- **Validation**:
  - `firstName`: 1-100 characters, trimmed
  - `lastName`: 1-100 characters, trimmed
  - `phone`: 9-20 digits
- **Authorization**: Any authenticated user (RLS enforced)
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `VALIDATION_ERROR`: Invalid input
  - `DUPLICATE_ENTRY`: Phone number already exists
- **Supabase**: `supabase.from('temporary_workers').insert()`

#### updateWorker

- **Description**: Update an existing temporary worker
- **Input Parameters**:
  - `id` (string, required): Worker UUID
  - `firstName` (string, optional): First name
  - `lastName` (string, optional): Last name
  - `phone` (string, optional): Phone number
- **Return Type**: `ActionResult<Worker>`
- **Validation**: Same as create for provided fields
- **Authorization**: Any authenticated user (RLS enforced)
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `NOT_FOUND`: Worker does not exist
  - `VALIDATION_ERROR`: Invalid input
  - `DUPLICATE_ENTRY`: Phone already used by another worker
- **Supabase**: `supabase.from('temporary_workers').update().eq('id', id)`

#### deleteWorker

- **Description**: Soft-delete a temporary worker
- **Input Parameters**:
  - `id` (string, required): Worker UUID
- **Return Type**: `ActionResult<void>`
- **Validation**:
  - `id`: Valid UUID format
- **Authorization**: Any authenticated user (RLS enforced)
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `NOT_FOUND`: Worker does not exist
  - `HAS_DEPENDENCIES`: Worker has active/scheduled assignments
- **Supabase**: `supabase.from('temporary_workers').update({ deleted_at }).eq('id', id)`

---

### Assignments Module ⏳ TODO

#### createAssignment

- **Description**: Create a new assignment for a worker to a position
- **Input Parameters**:
  - `workerId` (string, required): Worker UUID
  - `positionId` (string, required): Position UUID
  - `startAt` (string, required): Start datetime (ISO format)
  - `endAt` (string, optional): End datetime (ISO format)
- **Return Type**: `ActionResult<Assignment>`
- **Validation**:
  - `workerId`: Valid UUID, worker must exist and not be deleted
  - `positionId`: Valid UUID, position must exist and not be deleted
  - `startAt`: Valid ISO datetime
  - `endAt`: If provided, must be after startAt
- **Authorization**: Any authenticated user (RLS enforced)
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `NOT_FOUND`: Worker or position does not exist
  - `VALIDATION_ERROR`: Invalid input
  - `INVALID_DATE_RANGE`: endAt is before startAt
- **Supabase**: `supabase.from('assignments').insert({ ...data, created_by: userId, status: 'scheduled' })`

**Note**: Per PRD, overlapping assignments are allowed. The `is_worker_available` RPC can be used to warn users but does not block creation.

#### endAssignment

- **Description**: End an active or scheduled assignment
- **Input Parameters**:
  - `assignmentId` (string, required): Assignment UUID
  - `endAt` (string, optional): End datetime (defaults to NOW())
- **Return Type**: `ActionResult<Assignment>`
- **Validation**:
  - `assignmentId`: Valid UUID
  - `endAt`: If provided, must be after the assignment's startAt
- **Authorization**: Any authenticated user (RLS enforced)
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `NOT_FOUND`: Assignment does not exist
  - `ALREADY_ENDED`: Assignment already has end_at or is completed/cancelled
  - `INVALID_DATE_RANGE`: endAt is before startAt
- **Supabase**: `supabase.rpc('end_assignment', { p_assignment_id, p_end_at })`

#### cancelAssignment

- **Description**: Cancel a scheduled assignment (only before it starts)
- **Input Parameters**:
  - `assignmentId` (string, required): Assignment UUID
- **Return Type**: `ActionResult<Assignment>`
- **Validation**:
  - `assignmentId`: Valid UUID
- **Authorization**: Any authenticated user (RLS enforced)
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `NOT_FOUND`: Assignment does not exist
  - `CANNOT_CANCEL`: Assignment has already started or is not in scheduled status
- **Supabase**: `supabase.rpc('cancel_assignment', { p_assignment_id })`

---

### Reports Module ⏳ TODO

#### generateHoursReport

- **Description**: Generate a report of worked hours for a date range
- **Input Parameters**:
  - `startDate` (string, required): Report start date (ISO format)
  - `endDate` (string, required): Report end date (ISO format)
  - `clientId` (string, optional): Filter by specific client
- **Return Type**: `ActionResult<HoursReportData[]>`
- **Validation**:
  - `startDate`: Valid ISO date
  - `endDate`: Valid ISO date, must be >= startDate
  - `clientId`: Valid UUID if provided
- **Authorization**: Any authenticated user (RLS enforced)
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
  - `VALIDATION_ERROR`: Invalid date range
  - `NOT_FOUND`: Client filter ID does not exist
- **Supabase**: `supabase.rpc('get_hours_report', { p_start_date, p_end_date, p_client_id })`

#### exportReportToCsv

- **Description**: Generate CSV export of hours report
- **Input Parameters**: Same as generateHoursReport
- **Return Type**: `ActionResult<{ csv: string; filename: string }>`
- **Validation**: Same as generateHoursReport
- **Authorization**: Any authenticated user
- **Error Handling**: Same as generateHoursReport
- **Supabase**: Uses `get_hours_report` RPC, then transforms to CSV string

---

## 3. Data Fetching Functions (Queries)

> **Note:** In the current architecture, queries are implemented as server actions using the `createAction` wrapper. This provides consistent error handling and authentication for both mutations and queries. See Section 2 for implemented query actions (e.g., `getClient`, `getClients`, `getCurrentUser`).

### Planned Query Actions (Not Yet Implemented)

The following query actions should be implemented in their respective module `actions.ts` files:

#### Auth Module

- ~~`getCurrentUser`~~ → ✅ Implemented in Section 2
- `getUserRole` - Get current user's role via `supabase.rpc('user_role')`

#### Clients Module

- ~~`getClient`~~ → ✅ Implemented in Section 2
- ~~`getClients`~~ → ✅ Implemented in Section 2
- `getClientWithLocations` - Client with nested work_locations

#### WorkLocations Module ⏳

- `getWorkLocation` - Single work location with client info
- `getWorkLocations` - Paginated list with filtering
- `getWorkLocationWithPositions` - Location with nested positions

#### Positions Module ⏳

- `getPosition` - Single position with location info
- `getPositions` - Paginated list with filtering

#### Workers Module ⏳

- `getWorker` - Single worker by ID
- `getWorkers` - Paginated list with stats (total hours, active assignments)
- `getWorkerWithAssignments` - Worker with nested assignments
- `checkWorkerAvailability` - RPC call to check availability

#### Assignments Module ⏳

- `getAssignment` - Single assignment with full details
- `getAssignments` - Paginated list with filtering
- `getAssignmentAuditLog` - Audit log entries for assignment

#### Reports Module ⏳

- `getHoursReport` - Hours report via RPC

---

## 4. Supabase RPC Mapping

| RPC Function | Description | Mapped To | Type |
|--------------|-------------|-----------|------|
| `user_organization_id()` | Get user's organization ID from JWT | Internal use (RLS policies) | Helper |
| `user_role()` | Get current user's role from JWT | `getUserRole()` query | Query |
| `is_worker_available(p_worker_id, p_check_datetime)` | Check if worker is available at datetime | `checkWorkerAvailability()` query | Query |
| `get_hours_report(p_start_date, p_end_date, p_client_id)` | Generate hours report | `getHoursReport()` query, `generateHoursReport()` action | Both |
| `end_assignment(p_assignment_id, p_end_at)` | End an assignment | `endAssignment()` action | Mutation |
| `cancel_assignment(p_assignment_id)` | Cancel a scheduled assignment | `cancelAssignment()` action | Mutation |
| `normalize_phone(phone)` | Normalize phone number | Used internally by DB trigger | N/A |

---

## 5. Shared Types

### Result Types

```typescript
// /services/shared/result.ts

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: ActionError };

export interface ActionError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}
```

### Pagination Types

```typescript
// /services/shared/pagination.ts

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface SortParams<T extends string> {
  sortBy?: T;
  sortOrder?: 'asc' | 'desc';
}

export interface DateRangeParams {
  dateFrom?: string;
  dateTo?: string;
}

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
```

### Domain Types (DTOs)

```typescript
// /types/entities.ts

import type { Tables, Enums } from './database';

// Base entity types (from database.ts Tables)
export type Organization = Tables<'organizations'>;
export type Client = Tables<'clients'>;
export type WorkLocation = Tables<'work_locations'>;
export type Position = Tables<'positions'>;
export type Worker = Tables<'temporary_workers'>;
export type Assignment = Tables<'assignments'>;
export type Profile = Tables<'profiles'>;
export type AuditLogEntry = Tables<'assignment_audit_log'>;

// Extended organization types
export interface OrganizationWithStats extends Organization {
  userCount: number;
  activeUserCount: number;
}

// Extended types with relations
export interface ClientWithLocations extends Client {
  work_locations: WorkLocation[];
}

export interface WorkLocationWithClient extends WorkLocation {
  client: Pick<Client, 'id' | 'name'>;
}

export interface WorkLocationWithPositions extends WorkLocationWithClient {
  positions: Position[];
}

export interface PositionWithLocation extends Position {
  work_location: WorkLocationWithClient;
}

export interface WorkerWithStats extends Worker {
  totalHours: number;
  activeAssignments: number;
  assignedLocations: string[];
}

export interface WorkerWithAssignments extends Worker {
  assignments: AssignmentWithDetails[];
}

export interface AssignmentWithDetails extends Assignment {
  worker: Pick<Worker, 'id' | 'first_name' | 'last_name' | 'phone'>;
  position: PositionWithLocation;
  created_by_profile: Pick<Profile, 'id' | 'first_name' | 'last_name'>;
  ended_by_profile?: Pick<Profile, 'id' | 'first_name' | 'last_name'>;
  cancelled_by_profile?: Pick<Profile, 'id' | 'first_name' | 'last_name'>;
}

// Report types
export interface HoursReportData {
  worker_id: string;
  worker_name: string;
  work_location_name: string;
  client_name: string;
  total_hours: number;
}

// Enum types
export type UserRole = Enums<'user_role'>;
export type AssignmentStatus = Enums<'assignment_status'>;
```

### Input Types (Zod Schemas)

Input validation schemas are defined in `/services/[module]/schemas.ts`.

See `.ai/promts/generate-schemas.md` for schema generation instructions and `.ai/promts/execution-order.md` for the implementation sequence.

---

## 6. Error Handling ✅ IMPLEMENTED

### Error Codes

```typescript
// /services/shared/errors.ts

export const ErrorCodes = {
  // Authentication Errors (user identity)
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Authorization Errors (user permissions)
  FORBIDDEN: 'FORBIDDEN',

  // Validation Errors (input data)
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Resource Errors (database entities)
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  HAS_DEPENDENCIES: 'HAS_DEPENDENCIES',

  // Business Logic Errors (domain rules)
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',

  // System Errors (infrastructure)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
```

> **Note:** `ALREADY_ENDED` and `CANNOT_CANCEL` were removed - use `VALIDATION_ERROR` with descriptive message instead.

### Error Response Structure

```typescript
export interface ActionError {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

// Helper to create errors
export function createError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>
): ActionError {
  return { code, message, ...(details && { details }) };
}
```

### Supabase PostgrestError Mapping

```typescript
import type { PostgrestError } from '@supabase/supabase-js';

const PG_ERROR_CODES = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  NOT_NULL_VIOLATION: '23502',
  CHECK_VIOLATION: '23514',
  INSUFFICIENT_PRIVILEGE: '42501',
} as const;

const POSTGREST_ERROR_CODES = {
  NO_ROWS_RETURNED: 'PGRST116',
  JWT_EXPIRED: 'PGRST301',
  JWT_INVALID: 'PGRST302',
} as const;

export function mapSupabaseError(error: PostgrestError): ActionError {
  switch (error.code) {
    case PG_ERROR_CODES.UNIQUE_VIOLATION:
      return createError(
        ErrorCodes.DUPLICATE_ENTRY,
        extractDuplicateFieldMessage(error.details),
        { constraint: error.details, hint: error.hint }
      );
    case PG_ERROR_CODES.FOREIGN_KEY_VIOLATION:
      return createError(
        ErrorCodes.HAS_DEPENDENCIES,
        'This record cannot be deleted because other records depend on it',
        { constraint: error.details }
      );
    case PG_ERROR_CODES.NOT_NULL_VIOLATION:
      return createError(
        ErrorCodes.VALIDATION_ERROR,
        'A required field is missing',
        { field: extractFieldFromError(error.message) }
      );
    case PG_ERROR_CODES.INSUFFICIENT_PRIVILEGE:
      return createError(
        ErrorCodes.FORBIDDEN,
        'You do not have permission to perform this action'
      );
    case POSTGREST_ERROR_CODES.NO_ROWS_RETURNED:
      return createError(
        ErrorCodes.NOT_FOUND,
        'The requested resource was not found'
      );
    case POSTGREST_ERROR_CODES.JWT_EXPIRED:
    case POSTGREST_ERROR_CODES.JWT_INVALID:
      return createError(
        ErrorCodes.SESSION_EXPIRED,
        'Your session has expired. Please log in again.'
      );
    default:
      return createError(
        ErrorCodes.DATABASE_ERROR,
        'An unexpected database error occurred. Please try again.',
        { originalCode: error.code, originalMessage: error.message }
      );
  }
}
```

### Supabase AuthError Mapping

Uses `error.code` for reliable error identification per Supabase best practices:

```typescript
import type { AuthError } from '@supabase/supabase-js';

export function mapAuthError(error: AuthError): ActionError {
  switch (error.code) {
    case 'invalid_credentials':
      return createError(ErrorCodes.INVALID_CREDENTIALS, 'Invalid email or password');
    case 'email_not_confirmed':
      return createError(ErrorCodes.FORBIDDEN, 'Please confirm your email address');
    case 'session_expired':
    case 'refresh_token_not_found':
    case 'bad_jwt':
      return createError(ErrorCodes.SESSION_EXPIRED, 'Your session has expired');
    case 'weak_password':
      return createError(ErrorCodes.VALIDATION_ERROR, 'Password does not meet requirements');
    case 'user_not_found':
      return createError(ErrorCodes.NOT_FOUND, 'No account found with this email');
    case 'user_already_exists':
    case 'email_exists':
      return createError(ErrorCodes.DUPLICATE_ENTRY, 'An account with this email already exists');
    case 'over_request_rate_limit':
      return createError(ErrorCodes.FORBIDDEN, 'Too many requests. Please wait and try again.');
    default:
      return createError(ErrorCodes.NOT_AUTHENTICATED, 'An authentication error occurred');
  }
}
```

### Zod Validation Error Mapping

```typescript
import type { ZodError } from 'zod';

export function mapZodError(error: ZodError): ActionError {
  const fieldErrors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || '_root';
    if (!fieldErrors[path]) fieldErrors[path] = [];
    fieldErrors[path].push(issue.message);
  }

  const firstIssue = error.issues[0];
  const mainMessage = firstIssue
    ? `${firstIssue.path.join('.') || 'Input'}: ${firstIssue.message}`
    : 'Invalid input data';

  return createError(ErrorCodes.VALIDATION_ERROR, mainMessage, {
    fieldErrors,
    issues: error.issues,
  });
}
```

### Server Action Pattern (Using createAction Wrapper)

The `createAction` wrapper handles all boilerplate automatically:

```typescript
'use server';

import { createAction } from '@/services/shared';
import { someSchema, type SomeInput } from './schemas';
import type { SomeOutput } from '@/types';

export const someAction = createAction<SomeInput, SomeOutput>(
  async (input, { supabase, user }) => {
    // Input is already validated by schema
    // User is guaranteed to exist (requireAuth: true by default)
    // supabase client is already created

    const { data, error } = await supabase
      .from('some_table')
      .insert({ ...input, created_by: user.id })
      .select()
      .single();

    // Throw errors - they're automatically mapped by the wrapper
    if (error) throw error;

    return data;
  },
  {
    schema: someSchema,
    // Optional: revalidate paths after success
    revalidatePaths: [{ path: '/dashboard' }],
  }
);
```

#### createAction Options

```typescript
interface ActionOptions<TInput, RequireAuth extends boolean = true> {
  /** Zod schema for input validation (optional) */
  schema?: z.ZodType<TInput>;

  /** Whether authentication is required (default: true) */
  requireAuth?: RequireAuth;

  /** Paths to revalidate after successful action */
  revalidatePaths?: Array<{
    path: string;
    type?: 'page' | 'layout';
  }>;
}
```

#### Public Action (No Auth Required)

```typescript
export const signIn = createAction<SignInInput, AuthResponse>(
  async (input, { supabase, user }) => {
    // user is null when requireAuth: false
    const { data, error } = await supabase.auth.signInWithPassword(input);
    if (error) throw error;
    return data;
  },
  { schema: signInSchema, requireAuth: false }
);
```

---

## 7. Authorization

### Authorization Strategy

Authorization is primarily handled by **Supabase Row Level Security (RLS)** policies defined in the database:

1. **Security by Default**: All tables have RLS enabled
2. **Consistency**: Authorization enforced at database level
3. **Simplicity**: Server code doesn't need explicit checks in most cases

### Role-Based Access Summary

| Resource | Admin | Coordinator | Notes |
|----------|-------|-------------|-------|
| **Profiles** | Read all, Update all, Delete | Read all, Update own | Own profile = `id = auth.uid()` |
| **Clients** | Full CRUD | Read only | Managed by admin |
| **Work Locations** | Full CRUD | Read only | Managed by admin |
| **Positions** | Full CRUD | Full CRUD | Any authenticated user |
| **Workers** | Full CRUD | Full CRUD | Any authenticated user |
| **Assignments** | Full CRUD + hard delete | Full CRUD (soft) | Cancellation via status change |
| **Audit Log** | Full access | Read + Insert | Insert via triggers |

### Multi-Tenancy Data Isolation

All data is scoped to the user's organization via RLS policies:

#### 1. JWT Claims

Organization ID and user role are embedded in JWT via `custom_access_token_hook`:

```typescript
// JWT payload includes:
{
  user_role: 'admin' | 'coordinator',
  organization_id: 'uuid-of-organization'
}
```

#### 2. Helper Functions

```sql
-- Get current user's organization ID from JWT
public.user_organization_id() → UUID

-- Get current user's role from JWT
public.user_role() → user_role
```

#### 3. Tables with Direct Organization Scope

These tables have `organization_id` column and filter directly:

| Table | RLS Policy Pattern |
|-------|-------------------|
| `profiles` | `organization_id = user_organization_id()` |
| `clients` | `organization_id = user_organization_id()` |
| `temporary_workers` | `organization_id = user_organization_id()` |

#### 4. Tables with Indirect Organization Scope

These tables inherit organization scope through relations:

| Table | Relation Chain |
|-------|---------------|
| `work_locations` | → `clients.organization_id` |
| `positions` | → `work_locations` → `clients.organization_id` |
| `assignments` | → `worker.organization_id` AND `position` → ... → `organization_id` |
| `assignment_audit_log` | → `assignments` → ... |

#### 5. Security Best Practice

All server actions rely on RLS for data isolation. The `createAction` wrapper automatically:

1. Creates Supabase client with user's JWT
2. All queries are filtered by organization through RLS
3. No explicit organization filtering needed in application code

### Client-Side Role Check Hook ⏳ TODO

```typescript
// /hooks/useUserRole.ts
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { UserRole } from '@/types';

export function useUserRole() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRole() {
      const supabase = createClient();
      const { data } = await supabase.rpc('user_role');
      setRole(data);
      setIsLoading(false);
    }
    fetchRole();
  }, []);

  return {
    role,
    isAdmin: role === 'admin',
    isCoordinator: role === 'coordinator',
    isLoading,
  };
}
```

### Server-Side Role Check ⏳ TODO

```typescript
// /services/auth/actions.ts

export const getUserRole = createAction<object, UserRole | null>(
  async (_, { supabase }) => {
    const { data } = await supabase.rpc('user_role');
    return data;
  },
  { schema: z.object({}) }
);

// Helper for Server Components
export async function isAdmin(): Promise<boolean> {
  const result = await getUserRole({});
  return isSuccess(result) && result.data === 'admin';
}

// Usage in Server Component
async function AdminOnlySection() {
  const isUserAdmin = await isAdmin();
  if (!isUserAdmin) return null;

  return <div>Admin content here</div>;
}
```

### Defense-in-Depth Pattern (Optional)

For admin-only actions, you can add explicit role checks:

```typescript
'use server';

export const adminOnlyAction = createAction<Input, Output>(
  async (input, { supabase, user }) => {
    // Explicit role check (defense-in-depth, RLS also enforces)
    const { data: role } = await supabase.rpc('user_role');
    if (role !== 'admin') {
      throw new Error('Admin access required');
    }

    // Proceed with operation
    const { data, error } = await supabase
      .from('admin_table')
      .insert(input)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  { schema: inputSchema }
);
```
