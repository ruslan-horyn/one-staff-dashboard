# MVP Completion Design - One Staff Dashboard

## Overview

Complete the remaining 10 user stories (US-004 through US-014) to deliver MVP. All database tables, RLS policies, schemas (Zod), and shared infrastructure already exist. Work consists primarily of replicating the established clients module pattern for remaining modules, plus implementing the core assignment workflow and reports.

## Approach

Layer-by-layer, dependency-ordered execution with E2E tests (Playwright) as priority for each module. Pagination included on every list view, hidden when `totalItems < pageSize` (default 20).

## Phases

### Phase 1: CRUD Clones (US-004, US-005)

#### 1A: Work Locations (US-004) - Admin only

**Route:** `/locations`

**Files to create:**
```
app/(dashboard)/locations/
  page.tsx
  loading.tsx
  _components/
    WorkLocationDataTable.tsx
    WorkLocationFormDialog.tsx
    WorkLocationForm.tsx
    WorkLocationDeleteDialog.tsx
    columns.tsx
  _hooks/
    useWorkLocationForm.ts
    useWorkLocationDelete.ts
    useWorkLocationDialogs.ts
    index.ts
  _utils/
    parseWorkLocationParams.ts

services/work-locations/
  actions.ts
  error-handlers.ts
  index.ts

types/
  work-location.ts
```

**Actions:**
- `createWorkLocation(input)` - insert with organization_id via client join
- `updateWorkLocation(input)` - partial update
- `deleteWorkLocation(input)` - soft delete (set deleted_at)
- `getWorkLocations(filter)` - paginated list with search/sort/clientId filter

**Additional action needed:**
- `services/clients/actions.ts` → `getClientsForSelect()` - lightweight query returning `{id, name}[]` without pagination for ComboBox selectors

**Form fields:**
- Client (ComboBoxSelect, required) - loads from `getClientsForSelect()`
- Name (Input, required, max 255)
- Address (Input, required, max 500)
- Email (Input type="email", optional)
- Phone (PhoneInput, optional)

**Table columns:** Name (sortable), Client Name, Address, Email, Phone, Actions
- Searchable: name, address, email, phone
- Sortable: name, created_at
- Filter: clientId (ComboBox above table)

**Existing schemas:** `createWorkLocationSchema`, `updateWorkLocationSchema`, `workLocationFilterSchema` in `services/work-locations/schemas.ts`

**E2E tests (~30):** CRUD operations, client filter, validation, search, dialog interactions, a11y

---

#### 1B: Temporary Workers (US-005) - Coordinator + Admin

**Route:** `/workers`

**Files to create:**
```
app/(dashboard)/workers/
  page.tsx
  loading.tsx
  _components/
    WorkerDataTable.tsx
    WorkerFormDialog.tsx
    WorkerForm.tsx
    WorkerDeleteDialog.tsx
    columns.tsx
  _hooks/
    useWorkerForm.ts
    useWorkerDelete.ts
    useWorkerDialogs.ts
    index.ts
  _utils/
    parseWorkerParams.ts

services/workers/
  actions.ts
  error-handlers.ts
  index.ts

types/
  worker.ts
```

**Actions:**
- `createWorker(input)` - insert with organization_id
- `updateWorker(input)` - partial update
- `deleteWorker(input)` - soft delete
- `getWorkers(filter)` - paginated, search by trigram index

**Form fields:** firstName (Input), lastName (Input), phone (PhoneInput)

**Table columns:** Full Name (sortable, computed), Phone, Actions
- Searchable: first_name, last_name, phone (trigram GIN index exists)
- Sortable: name, created_at

**Existing schemas:** `createWorkerSchema`, `updateWorkerSchema`, `workerFilterSchema` in `services/workers/schemas.ts`

**E2E tests (~25):** CRUD, phone validation/normalization, search (trigram), duplicate phone error

---

### Phase 2: Core Workflow - Assignments (US-007, US-008, US-009, US-010)

#### 2A: Positions Management (US-007 part 1)

Positions are managed as sub-elements of Work Locations, not a separate page.

**Changes to Work Locations page:**
- Expandable row in WorkLocationDataTable showing positions list
- Inline "Add Position" button in expanded row
- Position row: Name, Status (active badge), Actions (edit name, toggle active, delete)

**Files to create:**
```
app/(dashboard)/locations/_components/
  PositionList.tsx          # expanded row content
  PositionFormInline.tsx    # inline add/edit form
  PositionDeleteDialog.tsx

services/positions/
  actions.ts
  error-handlers.ts
  index.ts
```

**Actions:**
- `createPosition(input)` - insert with workLocationId
- `updatePosition(input)` - update name/isActive
- `deletePosition(input)` - soft delete
- `getPositions(workLocationId)` - list for a location (no pagination - positions per location are few)

**Existing schemas:** `createPositionSchema`, `updatePositionSchema`, `positionFilterSchema`

---

#### 2B: Assignment Creation (US-007 part 2)

**Trigger:** "Assign" button on worker row (Board page, Phase 3) OR from worker details

**Assignment Dialog:**
- Work Location (ComboBoxSelect, required) - `getWorkLocationsForSelect()`
- Position (ComboBoxSelect, required) - dynamically filtered by selected location via `getPositionsForSelect(workLocationId)`
- Start datetime (DatetimePicker, required)
- End datetime (DatetimePicker, optional)

**Files to create:**
```
services/assignments/
  actions.ts
  error-handlers.ts
  index.ts

# Assignment components will live in the board page (Phase 3)
# but the service layer is built here
```

**Actions:**
- `createAssignment(input)` - INSERT, audit log via DB trigger
- `getWorkerAssignments(workerId, filter)` - list assignments for a worker

**Helper actions:**
- `services/work-locations/actions.ts` → `getWorkLocationsForSelect()` - `{id, name, clientName}[]`
- `services/positions/actions.ts` → `getPositionsForSelect(workLocationId)` - `{id, name}[]`

---

#### 2C: Assignment Details - Expandable Row (US-008)

Displayed in Board (Phase 3) worker table expandable rows.

**Assignment row content:**
- Work Location name
- Position name
- Hours: `HH:MM - HH:MM` (or "Ongoing" if no end_at)
- Status badge (scheduled/active/completed/cancelled)
- Actions: "End Work" (US-009), "Cancel" (US-010)

**Total Hours column:** Sum of duration of all completed assignments for the worker. Computed server-side in the workers query using a subquery or the `get_hours_report()` function.

---

#### 2D: End Assignment (US-009)

- "End Work" button visible for assignments without end_at (status: scheduled/active)
- Modal with DatetimePicker for end_at (defaults to now)
- Calls `endAssignment(assignmentId, endAt)` → Supabase RPC `end_assignment()`
- Audit log recorded automatically by DB trigger

**Action:** `endAssignment(input)` - calls `.rpc('end_assignment', {...})`

---

#### 2E: Cancel Assignment (US-010)

- "Cancel" button visible when `now() < start_at` (status: scheduled)
- AlertDialog confirmation
- Calls `cancelAssignment(assignmentId)` → Supabase RPC `cancel_assignment()`
- Audit log recorded automatically by DB trigger

**Action:** `cancelAssignment(input)` - calls `.rpc('cancel_assignment', {...})`

**E2E for Phase 2 (~40 tests):** Create position inline, assign worker, view assignment details, end assignment, cancel assignment, status transitions, validation (end > start), audit trail

---

### Phase 3: Board - Worker List with Filters (US-006)

**Route:** `/` (dashboard root, replaces current placeholder)

**Files to create/modify:**
```
app/(dashboard)/(board)/
  page.tsx
  loading.tsx
  _components/
    BoardDataTable.tsx
    BoardFilters.tsx
    AssignmentExpandedRow.tsx
    AssignWorkerDialog.tsx
    AssignWorkerForm.tsx
    columns.tsx
  _hooks/
    useAssignWorker.ts
    useBoardFilters.ts
    index.ts
  _utils/
    parseBoardParams.ts
```

**Table columns:**
1. Full Name (sortable) - `first_name + ' ' + last_name`
2. Assigned Work Locations - badge list from active assignments (joined data)
3. Work Hours - today's hours from active/completed assignments
4. Total Hours (sortable) - sum of all completed assignment durations
5. Actions - "Assign" button

**Filters (URL-synced):**
- Search (text) - name/phone, uses trigram index
- Available From (DatetimePicker) - filters using `is_worker_available()` DB function

**Expandable rows:** Assignment details (from Phase 2C) with End/Cancel actions

**Data fetching:** `getBoardWorkers(filter)` - new action that joins workers with assignment aggregates. Server-side computation of total hours and active locations via Supabase query with subselects.

**E2E (~20 tests):** Search, availability filter, sorting, expandable rows, assign from board

---

### Phase 4: Reports (US-011)

**Route:** `/reports`

**Files to create:**
```
app/(dashboard)/reports/
  page.tsx
  loading.tsx
  _components/
    ReportFilters.tsx
    ReportTable.tsx
    ExportButtons.tsx
  _hooks/
    useReportGeneration.ts
    useReportExport.ts
    index.ts

services/reports/
  actions.ts
  index.ts
```

**UI flow:**
1. Date range picker (start date + end date, required)
2. Client filter (ComboBox, optional)
3. "Generate" button
4. Results table (not paginated - report is a summary)

**Report table columns:** Worker Name, Work Location, Position, Total Hours

**Action:** `generateHoursReport(filter)` - calls `.rpc('get_hours_report', {...})`

**Export:**
- CSV: client-side generation using `Blob` + `URL.createObjectURL` + download link
- Excel: add `xlsx` package, client-side generation

**Existing schemas:** `hoursReportFilterSchema`, `exportReportSchema` in `services/reports/schemas.ts`

**E2E (~15 tests):** Generate report with date range, filter by client, export CSV, export Excel, empty state, validation

---

### Phase 5: Admin Features (US-013, US-014)

#### 5A: User Management (US-013) - Admin only

**Route:** `/users`

**Files to create:**
```
app/(dashboard)/users/
  page.tsx
  loading.tsx
  _components/
    UserDataTable.tsx
    InviteUserDialog.tsx
    InviteUserForm.tsx
    DeactivateUserDialog.tsx
    columns.tsx
  _hooks/
    useInviteUser.ts
    useDeactivateUser.ts
    useUserDialogs.ts
    index.ts
  _utils/
    parseUserParams.ts

services/users/
  actions.ts
  schemas.ts
  error-handlers.ts
  index.ts
```

**Actions:**
- `getUsers(filter)` - list profiles in organization (paginated)
- `inviteCoordinator(input)` - uses Supabase admin API with service role key: `supabase.auth.admin.inviteUserByEmail()`. Requires creating a server-side Supabase client with `SUPABASE_SERVICE_ROLE_KEY`
- `deactivateUser(userId)` - uses `supabase.auth.admin.updateUserById(id, { banned_until: 'forever' })` (Supabase native ban mechanism, no schema migration needed)
- `reactivateUser(userId)` - uses `supabase.auth.admin.updateUserById(id, { banned_until: null })`

**Schemas (new):**
- `inviteCoordinatorSchema` - email, firstName, lastName
- `deactivateUserSchema` - userId
- `userFilterSchema` - extends baseFilterSchema

**Table columns:** Name, Email, Role (badge), Status (active/banned badge), Actions (deactivate/reactivate)

**Invite flow:**
1. Admin fills email + name → server action calls `auth.admin.inviteUserByEmail()`
2. Supabase sends invite email with magic link
3. On first login, `handle_new_user()` trigger creates profile... BUT this trigger creates a NEW organization. Need modification: if invited, user should join the INVITER's organization.

**Required DB change:** Modify `handle_new_user()` function OR use Supabase user metadata to pass `organization_id` during invite. The invite action will set `user_metadata: { organization_id, role: 'coordinator', first_name, last_name }` and the trigger reads this.

**E2E (~20 tests):** Invite flow (email delivery verification via Supabase Inbucket in local), deactivate/reactivate, permission checks

---

#### 5B: User Profile (US-014)

**Approach:** Dialog accessible from UserMenu (existing component in header)

**Files to create:**
```
app/(dashboard)/_components/
  ProfileDialog.tsx
  ProfileForm.tsx

services/users/
  # Add to existing actions.ts
  # updateProfile action
```

**Action:** `updateProfile(input)` - updates profiles table (first_name, last_name)

**Schema:** `updateProfileSchema` - firstName, lastName (both optional but at least one required)

**UI:** Dialog from UserMenu dropdown → "Edit Profile" option. Shows: firstName, lastName (editable), email, role (read-only badges).

**E2E (~5 tests):** Open dialog, edit name, save, verify persistence

---

## Dependencies & New Packages

- `xlsx` (or `exceljs`) - for Excel export in reports (Phase 4)
- No other new dependencies needed

## DB Migrations Needed

- Modify `handle_new_user()` to check `raw_user_meta_data` for `organization_id` (invited users join existing org instead of creating new one)

## Shared Additions

- `getClientsForSelect()` - lightweight client list for ComboBox
- `getWorkLocationsForSelect()` - lightweight locations list for ComboBox  
- `getPositionsForSelect(workLocationId)` - positions for ComboBox
- Service role Supabase client utility in `lib/supabase/admin.ts` for invite flow

## Pagination Rule

Every list view includes DataTable pagination. Pagination UI is hidden when `totalItems < pageSize` (default 20). This applies to: clients, work locations, workers, board, users, assignments list. Reports table is NOT paginated (summary view).

## Estimated E2E Test Count

| Module | Tests |
|--------|-------|
| Work Locations | ~30 |
| Workers | ~25 |
| Assignments + Positions | ~40 |
| Board | ~20 |
| Reports | ~15 |
| Users + Profile | ~25 |
| **Total** | **~155** |
