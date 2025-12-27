# Server Actions & Data Layer Plan

## 1. Data Modules

List of modules corresponding to business entities:

| Module | Database Table(s) | Responsibility |
|--------|-------------------|----------------|
| **Auth** | `profiles`, `auth.users` | User authentication, session management, profile data |
| **Clients** | `clients` | Client company CRUD operations (admin only) |
| **WorkLocations** | `work_locations` | Work location CRUD operations (admin only) |
| **Positions** | `positions` | Position CRUD operations (any authenticated) |
| **Workers** | `temporary_workers` | Temporary worker CRUD operations (any authenticated) |
| **Assignments** | `assignments` | Assignment lifecycle management (create, end, cancel) |
| **Reports** | `assignments`, `temporary_workers`, aggregations | Hours reports and exports |

### Recommended File Structure

```
/services/
  /shared/
    result.ts            # ActionResult<T> type and utilities
    errors.ts            # Error codes and Supabase error mapping
    pagination.ts        # Pagination helpers and constants
    index.ts             # Barrel exports
  /auth/
    actions.ts           # Server actions for auth
    queries.ts           # Data fetching functions
    schemas.ts           # Zod validation schemas
    types.ts             # Module-specific types
  /clients/
    actions.ts
    queries.ts
    schemas.ts
    types.ts
  /work-locations/
    actions.ts
    queries.ts
    schemas.ts
    types.ts
  /positions/
    actions.ts
    queries.ts
    schemas.ts
    types.ts
  /workers/
    actions.ts
    queries.ts
    schemas.ts
    types.ts
  /assignments/
    actions.ts
    queries.ts
    schemas.ts
    types.ts
  /reports/
    actions.ts
    queries.ts
    schemas.ts
    types.ts
  index.ts               # Barrel exports
```

---

## 2. Server Actions (Mutations)

### Auth Module

#### signIn
- **Description**: Authenticate user with email/password via Supabase Auth
- **Input Parameters**:
  - `email` (string, required): User email address
  - `password` (string, required): User password
- **Return Type**: `ActionResult<{ user: User; session: Session }>`
- **Validation**:
  - `email`: Valid email format
  - `password`: Minimum 8 characters
- **Authorization**: Public (no auth required)
- **Error Handling**:
  - `INVALID_CREDENTIALS`: Wrong email or password
  - `USER_NOT_FOUND`: User does not exist
- **Supabase**: `supabase.auth.signInWithPassword()`

#### signOut
- **Description**: Sign out current user and invalidate session
- **Input Parameters**: None
- **Return Type**: `ActionResult<void>`
- **Validation**: None
- **Authorization**: Any authenticated user
- **Error Handling**:
  - `NOT_AUTHENTICATED`: No active session
- **Supabase**: `supabase.auth.signOut()`

#### updateProfile
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

---

### Clients Module

#### createClient
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

#### updateClient
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
- **Supabase**: `supabase.from('clients').update().eq('id', id)`

#### deleteClient
- **Description**: Soft-delete a client (sets deleted_at timestamp)
- **Input Parameters**:
  - `id` (string, required): Client UUID
- **Return Type**: `ActionResult<void>`
- **Validation**:
  - `id`: Valid UUID format
- **Authorization**: Admin only (RLS enforced)
- **Error Handling**:
  - `FORBIDDEN`: User is not admin
  - `NOT_FOUND`: Client does not exist
  - `HAS_DEPENDENCIES`: Client has active work locations
- **Supabase**: `supabase.from('clients').update({ deleted_at: new Date().toISOString() }).eq('id', id)`

---

### WorkLocations Module

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

### Positions Module

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

### Workers Module

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

### Assignments Module

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

### Reports Module

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

### Auth Module

#### getCurrentUser
- **Description**: Get the currently authenticated user
- **Parameters**: None
- **Return Type**: `User | null`
- **Authorization**: Returns null if not authenticated
- **Supabase**: `supabase.auth.getUser()`

#### getCurrentProfile
- **Description**: Get the profile of the currently authenticated user
- **Parameters**: None
- **Return Type**: `Profile | null`
- **Authorization**: Returns null if not authenticated
- **Supabase**: `supabase.from('profiles').select('*').eq('id', userId).single()`

#### getUserRole
- **Description**: Get the role of the current user
- **Parameters**: None
- **Return Type**: `'admin' | 'coordinator' | null`
- **Authorization**: Returns null if not authenticated
- **Supabase**: `supabase.rpc('user_role')`

---

### Clients Module

#### getClients
- **Description**: Get paginated list of clients with optional filtering
- **Parameters**:
  - `search` (string, optional): Text search on name
  - `page` (number, optional): Page number (default: 1)
  - `pageSize` (number, optional): Items per page (default: 20, max: 100)
  - `sortBy` ('name' | 'created_at', optional): Sort field (default: 'name')
  - `sortOrder` ('asc' | 'desc', optional): Sort direction (default: 'asc')
  - `includeDeleted` (boolean, optional): Include soft-deleted records (default: false)
- **Return Type**: `PaginatedResult<Client>`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: Query with filters, ordering, and range

#### getClientById
- **Description**: Get a single client by ID
- **Parameters**:
  - `id` (string): Client UUID
- **Return Type**: `Client | null`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: `supabase.from('clients').select('*').eq('id', id).single()`

#### getClientWithLocations
- **Description**: Get a client with all its work locations
- **Parameters**:
  - `id` (string): Client UUID
- **Return Type**: `ClientWithLocations | null`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: Nested select with work_locations

---

### WorkLocations Module

#### getWorkLocations
- **Description**: Get paginated list of work locations with client info
- **Parameters**:
  - `clientId` (string, optional): Filter by client
  - `search` (string, optional): Text search on name/address
  - `page` (number, optional): Page number (default: 1)
  - `pageSize` (number, optional): Items per page (default: 20)
  - `sortBy` ('name' | 'created_at', optional): Sort field (default: 'name')
  - `sortOrder` ('asc' | 'desc', optional): Sort direction (default: 'asc')
- **Return Type**: `PaginatedResult<WorkLocationWithClient>`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: Query with client relation, filters, and ordering

#### getWorkLocationById
- **Description**: Get a single work location with client info
- **Parameters**:
  - `id` (string): Work location UUID
- **Return Type**: `WorkLocationWithClient | null`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: Select with client relation

#### getWorkLocationWithPositions
- **Description**: Get a work location with all its positions
- **Parameters**:
  - `id` (string): Work location UUID
- **Return Type**: `WorkLocationWithPositions | null`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: Nested select with client and positions

---

### Positions Module

#### getPositions
- **Description**: Get paginated list of positions with location info
- **Parameters**:
  - `workLocationId` (string, optional): Filter by work location
  - `isActive` (boolean, optional): Filter by active status
  - `search` (string, optional): Text search on name
  - `page` (number, optional): Page number
  - `pageSize` (number, optional): Items per page
- **Return Type**: `PaginatedResult<PositionWithLocation>`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: Query with work_location and client relations

#### getPositionById
- **Description**: Get a single position with location info
- **Parameters**:
  - `id` (string): Position UUID
- **Return Type**: `PositionWithLocation | null`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: Select with work_location and client relations

---

### Workers Module

#### getWorkers
- **Description**: Get paginated list of workers with computed stats (Main Board View)
- **Parameters**:
  - `search` (string, optional): Text search on name/phone (uses pg_trgm for fuzzy matching)
  - `availableAt` (string, optional): Filter workers available at specific datetime
  - `page` (number, optional): Page number (default: 1)
  - `pageSize` (number, optional): Items per page (default: 20)
  - `sortBy` ('name' | 'total_hours' | 'created_at', optional): Sort field
  - `sortOrder` ('asc' | 'desc', optional): Sort direction
- **Return Type**: `PaginatedResult<WorkerWithStats>`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: Complex query with aggregations for total hours and active assignments

#### getWorkerById
- **Description**: Get a single worker by ID
- **Parameters**:
  - `id` (string): Worker UUID
- **Return Type**: `Worker | null`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: `supabase.from('temporary_workers').select('*').eq('id', id).single()`

#### getWorkerWithAssignments
- **Description**: Get a worker with their assignments (for expanded row view)
- **Parameters**:
  - `id` (string): Worker UUID
  - `assignmentStatus` (AssignmentStatus[], optional): Filter assignments by status
  - `dateFrom` (string, optional): Filter assignments starting from date
  - `dateTo` (string, optional): Filter assignments ending before date
- **Return Type**: `WorkerWithAssignments | null`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: Nested select with assignments, positions, and locations

#### checkWorkerAvailability
- **Description**: Check if a worker is available at a specific datetime
- **Parameters**:
  - `workerId` (string): Worker UUID
  - `checkDatetime` (string): ISO datetime to check
- **Return Type**: `boolean`
- **Authorization**: Any authenticated user
- **Supabase**: `supabase.rpc('is_worker_available', { p_worker_id, p_check_datetime })`

---

### Assignments Module

#### getAssignments
- **Description**: Get paginated list of assignments with full details
- **Parameters**:
  - `workerId` (string, optional): Filter by worker
  - `positionId` (string, optional): Filter by position
  - `status` (AssignmentStatus[], optional): Filter by status(es)
  - `dateFrom` (string, optional): Filter by start date (>= dateFrom)
  - `dateTo` (string, optional): Filter by start date (<= dateTo)
  - `page` (number, optional): Page number
  - `pageSize` (number, optional): Items per page
  - `sortBy` ('start_at' | 'created_at', optional): Sort field
  - `sortOrder` ('asc' | 'desc', optional): Sort direction
- **Return Type**: `PaginatedResult<AssignmentWithDetails>`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: Query with worker, position, location, client, and profile relations

#### getAssignmentById
- **Description**: Get a single assignment with full details
- **Parameters**:
  - `id` (string): Assignment UUID
- **Return Type**: `AssignmentWithDetails | null`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: Select with all relations

#### getAssignmentAuditLog
- **Description**: Get audit log entries for an assignment
- **Parameters**:
  - `assignmentId` (string): Assignment UUID
  - `page` (number, optional): Page number
  - `pageSize` (number, optional): Items per page
- **Return Type**: `PaginatedResult<AuditLogEntry>`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: Select from assignment_audit_log with profile relation

---

### Reports Module

#### getHoursReport
- **Description**: Get hours report data for a date range
- **Parameters**:
  - `startDate` (string): Report start date (ISO)
  - `endDate` (string): Report end date (ISO)
  - `clientId` (string, optional): Optional client filter
- **Return Type**: `HoursReportData[]`
- **Authorization**: Any authenticated user (RLS enforced)
- **Supabase**: `supabase.rpc('get_hours_report', { p_start_date, p_end_date, p_client_id })`

---

## 4. Supabase RPC Mapping

| RPC Function | Description | Mapped To | Type |
|--------------|-------------|-----------|------|
| `is_worker_available(p_worker_id, p_check_datetime)` | Check if worker is available at datetime | `checkWorkerAvailability()` query | Query |
| `get_hours_report(p_start_date, p_end_date, p_client_id)` | Generate hours report | `getHoursReport()` query, `generateHoursReport()` action | Both |
| `end_assignment(p_assignment_id, p_end_at)` | End an assignment | `endAssignment()` action | Mutation |
| `cancel_assignment(p_assignment_id)` | Cancel a scheduled assignment | `cancelAssignment()` action | Mutation |
| `user_role()` | Get current user's role | `getUserRole()` query | Query |
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
export type Client = Tables<'clients'>;
export type WorkLocation = Tables<'work_locations'>;
export type Position = Tables<'positions'>;
export type Worker = Tables<'temporary_workers'>;
export type Assignment = Tables<'assignments'>;
export type Profile = Tables<'profiles'>;
export type AuditLogEntry = Tables<'assignment_audit_log'>;

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

## 6. Error Handling

### Error Codes

```typescript
// /services/shared/errors.ts

export const ErrorCodes = {
  // Authentication errors
  NOT_AUTHENTICATED: 'NOT_AUTHENTICATED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Authorization errors
  FORBIDDEN: 'FORBIDDEN',

  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  HAS_DEPENDENCIES: 'HAS_DEPENDENCIES',

  // Business logic errors
  INVALID_DATE_RANGE: 'INVALID_DATE_RANGE',
  ALREADY_ENDED: 'ALREADY_ENDED',
  CANNOT_CANCEL: 'CANNOT_CANCEL',

  // Generic errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
```

### Error Response Structure

```typescript
export interface ActionError {
  code: ErrorCode;
  message: string;
  details?: {
    field?: string;
    constraint?: string;
    [key: string]: unknown;
  };
}

// Helper to create errors
export function createError(
  code: ErrorCode,
  message: string,
  details?: ActionError['details']
): ActionError {
  return { code, message, details };
}
```

### Supabase Error Mapping

```typescript
import type { PostgrestError } from '@supabase/supabase-js';

export function mapSupabaseError(error: PostgrestError): ActionError {
  switch (error.code) {
    case '23505': // unique_violation
      return createError(
        ErrorCodes.DUPLICATE_ENTRY,
        'A record with this value already exists',
        { constraint: error.details }
      );
    case '23503': // foreign_key_violation
      return createError(
        ErrorCodes.HAS_DEPENDENCIES,
        'Cannot delete record with existing dependencies',
        { constraint: error.details }
      );
    case 'PGRST116': // JWT expired
      return createError(
        ErrorCodes.SESSION_EXPIRED,
        'Your session has expired, please log in again'
      );
    case '42501': // insufficient_privilege
      return createError(
        ErrorCodes.FORBIDDEN,
        'You do not have permission to perform this action'
      );
    default:
      return createError(
        ErrorCodes.DATABASE_ERROR,
        'An unexpected database error occurred',
        { originalCode: error.code, originalMessage: error.message }
      );
  }
}
```

### Server Action Pattern

```typescript
'use server';

import { createClient } from '@/lib/supabase/server';
import {
  createError,
  mapSupabaseError,
  ErrorCodes,
} from '@/services/shared/errors';
import type { ActionResult } from '@/services/shared/result';

export async function someAction(
  input: SomeInput
): Promise<ActionResult<SomeOutput>> {
  try {
    // 1. Validate input
    const validationResult = someSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: createError(ErrorCodes.VALIDATION_ERROR, 'Invalid input data', {
          issues: validationResult.error.issues,
        }),
      };
    }

    // 2. Create Supabase client (handles auth)
    const supabase = await createClient();

    // 3. Perform operation (RLS handles authorization)
    const { data, error } = await supabase
      .from('some_table')
      .insert(validationResult.data)
      .select()
      .single();

    // 4. Handle Supabase errors
    if (error) {
      return {
        success: false,
        error: mapSupabaseError(error),
      };
    }

    // 5. Return success
    return {
      success: true,
      data,
    };
  } catch (error) {
    // 6. Handle unexpected errors
    console.error('Unexpected error in someAction:', error);
    return {
      success: false,
      error: createError(ErrorCodes.INTERNAL_ERROR, 'An unexpected error occurred'),
    };
  }
}
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

### Client-Side Role Check Hook

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

### Server-Side Role Check

```typescript
// /services/auth/queries.ts

export async function isAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('user_role');
  return data === 'admin';
}

// Usage in Server Component
async function AdminOnlySection() {
  const isUserAdmin = await isAdmin();
  if (!isUserAdmin) return null;

  return <div>Admin content here</div>;
}
```

### Defense-in-Depth Pattern (Optional)

```typescript
'use server';

export async function adminOnlyAction(
  input: Input
): Promise<ActionResult<Output>> {
  const supabase = await createClient();

  // Explicit role check (defense-in-depth)
  const { data: role } = await supabase.rpc('user_role');
  if (role !== 'admin') {
    return {
      success: false,
      error: createError(ErrorCodes.FORBIDDEN, 'Admin access required'),
    };
  }

  // Proceed with operation (RLS will also enforce)
  // ...
}
```
