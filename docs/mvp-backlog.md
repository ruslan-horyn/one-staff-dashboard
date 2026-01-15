# MVP Backlog - One Staff Dashboard

*Updated: 2026-01-15*

## Summary

- **Total Epics:** 6
- **Total Stories:** 14 (Done: 7, In Progress: 0, Not Started: 7)
- **Estimated Tasks:** ~85 tasks

---

## Implementation Status

### Backend Modules

| Module | Actions | Schemas | Status |
|--------|---------|---------|--------|
| Auth | 7/7 | 8/8 | Complete |
| Clients | 5/5 | 6/6 | Complete |
| Workers | 0/6 | 6/6 | Schemas Only |
| Work Locations | 0/5 | 5/5 | Schemas Only |
| Positions | 0/5 | 5/5 | Schemas Only |
| Assignments | 0/7 | 8/8 | Schemas Only |
| Reports | 0/3 | 2/2 | Schemas Only |
| Shared | N/A | Complete | Complete |

### Frontend Views

| Route | PRD Story | Page | Status |
|-------|-----------|------|--------|
| `/login` | US-002 | `app/(auth)/login/page.tsx` | Complete |
| `/dashboard` | TECH-001 | `app/(dashboard)/page.tsx` | Complete |
| `/dashboard/clients` | US-003 | - | Not Started |
| `/dashboard/locations` | US-004 | - | Not Started |
| `/dashboard/workers` | US-005, US-006 | - | Not Started |
| `/dashboard/positions` | US-007, US-008 | - | Not Started |
| `/dashboard/assignments` | US-007, US-008, US-009, US-010 | - | Not Started |
| `/dashboard/reports` | US-011 | - | Not Started |
| `/dashboard/users` | US-013 | - | Not Started |
| `/dashboard/profile` | US-014 | - | Not Started |
| `/register` | US-001 | `app/(auth)/register/page.tsx` | Complete |
| `/forgot-password` | US-012 | `app/(auth)/forgot-password/page.tsx` | Complete |
| `/reset-password` | US-012 | `app/(auth)/reset-password/page.tsx` | Complete |

### Database Status

| Component | Status |
|-----------|--------|
| Tables (8) | Applied |
| Enums (2) | Applied |
| RLS Policies | Applied |
| Functions/Triggers | Applied |
| Indexes | Applied |

---

## Critical Path (Minimum MVP)

The minimum viable path to a working MVP (ordered by dependencies):

1. **US-001** - Organization Registration (enables multi-tenant onboarding)
2. **US-012** - Password Reset (completes auth flow)
3. **US-003** - Client Management (master data foundation)
4. **US-004** - Work Location Management (depends on clients)
5. **US-005** - Temporary Worker Management (core entity)
6. **US-007** - Create & Assign Worker to Position (core workflow)
7. **US-008** - Assignment Details View (view assignments)
8. **US-009** - End Active Assignment (complete assignment lifecycle)
9. **US-011** - Generate Hours Report (business value output)

---

## Epic 1: Authentication & User Management

### US-001: Organization Registration

- **Priority:** P0
- **Status:** Done
- **Dependencies:** None
- **Acceptance Criteria:**
  1. User can self-register with email, password, organization name
  2. Account confirmation via email link
  3. User becomes Administrator of new organization
  4. Redirect to dashboard after successful registration

**Tasks:**

- [x] **Frontend:** Create `/register` page with registration form
- [x] **Frontend:** Create `RegisterForm` component with org name, email, password, confirm password fields
- [ ] **Frontend:** Handle email confirmation flow UI
- [x] **Backend:** `signUp` action creates organization record (via database trigger)
- [x] **Testing:** Unit tests for registration validation (23 tests)
- [ ] **Testing:** E2E test for full registration flow

---

### US-002: System Login

- **Priority:** P0
- **Status:** Done
- **Dependencies:** None
- **Acceptance Criteria:**
  1. Login page with email and password fields
  2. Successful login redirects to dashboard
  3. Failed login shows error message

**Tasks:**

- [x] **Backend:** `signIn` server action with Supabase Auth
- [x] **Backend:** `signOut` server action
- [x] **Frontend:** Login page at `/login`
- [x] **Frontend:** LoginForm component with validation
- [x] **Frontend:** Error state handling
- [ ] **Testing:** Unit tests for auth actions
- [ ] **Testing:** E2E test for login flow

---

### US-012: Password Reset

- **Priority:** P1
- **Status:** Done
- **Dependencies:** US-002
- **Acceptance Criteria:**
  1. "Forgot password" link on login page
  2. Password reset request page with email field
  3. Email sent with reset link
  4. Reset password page to set new password

**Tasks:**

- [x] **Frontend:** Create `/forgot-password` page
- [x] **Frontend:** Create `ForgotPasswordForm` component
- [x] **Frontend:** Create `/reset-password` page (handles token from email)
- [x] **Frontend:** Create `ResetPasswordForm` component
- [x] **Frontend:** Create `/auth/callback` route for PKCE code exchange
- [x] **Backend:** `resetPassword` action with redirectTo configuration
- [x] **Backend:** `updatePassword` action already implemented
- [x] **Testing:** Unit tests for ForgotPasswordForm (14 tests)
- [x] **Testing:** Unit tests for ResetPasswordForm (15 tests)
- [ ] **Testing:** E2E test for password reset flow

---

### US-013: User Account Management

- **Priority:** P2
- **Status:** Not Started
- **Dependencies:** US-001, US-002
- **Acceptance Criteria:**
  1. Administrator can view list of organization users
  2. Administrator can invite new coordinators via email
  3. Administrator can deactivate/reactivate user accounts

**Tasks:**

- [ ] **Backend:** Create `services/users/actions.ts` with `getUsers`, `inviteUser`, `deactivateUser`, `reactivateUser`
- [ ] **Frontend:** Create `/dashboard/users` page
- [ ] **Frontend:** Create `UserList` component with table
- [ ] **Frontend:** Create `InviteUserDialog` component
- [ ] **Frontend:** Create user status toggle (activate/deactivate)
- [ ] **Testing:** Unit tests for user management actions

---

### US-014: User Profile Editing

- **Priority:** P3
- **Status:** Not Started
- **Dependencies:** US-002
- **Acceptance Criteria:**
  1. User can view their profile
  2. User can edit first name and last name
  3. Email and role are read-only

**Tasks:**

- [ ] **Frontend:** Create `/dashboard/profile` page
- [ ] **Frontend:** Create `ProfileForm` component
- [ ] **Backend:** `updateProfile` action already implemented
- [ ] **Testing:** Unit tests for profile update

---

## Epic 2: Master Data (Clients & Locations)

### US-003: Client Management

- **Priority:** P0
- **Status:** Not Started
- **Dependencies:** US-002
- **Acceptance Criteria:**
  1. View paginated list of clients
  2. Add new client (name, email, phone, address)
  3. Edit existing client
  4. Delete client (blocked if has work locations)
  5. Search clients by name/email/phone

**Tasks:**

- [ ] **Frontend:** Create `/dashboard/clients` page
- [ ] **Frontend:** Create `ClientList` component with DataTable
- [ ] **Frontend:** Create `ClientFormDialog` component (add/edit)
- [ ] **Frontend:** Create `DeleteClientDialog` with dependency check
- [ ] **Frontend:** Implement search and pagination
- [ ] **Backend:** All 5 client actions already implemented
- [ ] **Testing:** Unit tests for client components
- [ ] **Testing:** E2E test for client CRUD flow

---

### US-004: Work Location Management

- **Priority:** P0
- **Status:** Not Started
- **Dependencies:** US-003
- **Acceptance Criteria:**
  1. View work locations grouped by client
  2. Add work location (name, address, email, phone) linked to client
  3. Edit work location
  4. Delete work location (blocked if has positions)

**Tasks:**

- [ ] **Backend:** Create `services/work-locations/actions.ts` with CRUD operations
- [ ] **Frontend:** Create `/dashboard/locations` page
- [ ] **Frontend:** Create `LocationList` component with client grouping
- [ ] **Frontend:** Create `LocationFormDialog` component with client selector
- [ ] **Frontend:** Create `DeleteLocationDialog` with dependency check
- [ ] **Testing:** Unit tests for location actions
- [ ] **Testing:** E2E test for location CRUD flow

---

## Epic 3: Worker Management

### US-005: Temporary Worker Management

- **Priority:** P0
- **Status:** Not Started
- **Dependencies:** US-002
- **Acceptance Criteria:**
  1. Quick add worker (first name, last name, phone)
  2. Edit worker details
  3. Delete worker (soft delete, preserves history)
  4. Phone number normalization

**Tasks:**

- [ ] **Backend:** Create `services/workers/actions.ts` with CRUD operations
- [ ] **Frontend:** Create `/dashboard/workers` page
- [ ] **Frontend:** Create `WorkerList` component with DataTable
- [ ] **Frontend:** Create `WorkerFormDialog` component (add/edit)
- [ ] **Frontend:** Create `DeleteWorkerDialog` component
- [ ] **Testing:** Unit tests for worker actions
- [ ] **Testing:** Unit tests for phone normalization

---

### US-006: Displaying & Filtering Worker List

- **Priority:** P1
- **Status:** Not Started
- **Dependencies:** US-005
- **Acceptance Criteria:**
  1. Sortable table (name, phone, created date)
  2. Filter by availability (date/time range)
  3. Text search by name or phone
  4. Pagination

**Tasks:**

- [ ] **Backend:** Implement `checkWorkerAvailability` action using `is_worker_available()` RPC
- [ ] **Frontend:** Add sorting controls to `WorkerList`
- [ ] **Frontend:** Create `WorkerFilterPanel` component
- [ ] **Frontend:** Add availability date/time filter
- [ ] **Frontend:** Implement text search with debounce
- [ ] **Testing:** Unit tests for filtering logic

---

## Epic 4: Positions & Assignment Workflow

### US-007: Creating & Assigning Worker to Position

- **Priority:** P0
- **Status:** Not Started
- **Dependencies:** US-004, US-005
- **Acceptance Criteria:**
  1. Create position at work location
  2. Assign worker to position with start datetime
  3. Optional end datetime (if known)
  4. Overlapping assignments allowed

**Tasks:**

- [ ] **Backend:** Create `services/positions/actions.ts` with CRUD operations
- [ ] **Backend:** Create `services/assignments/actions.ts` with `createAssignment`
- [ ] **Frontend:** Create `/dashboard/positions` page (or integrate with locations)
- [ ] **Frontend:** Create `PositionFormDialog` component
- [ ] **Frontend:** Create `AssignWorkerDialog` component with worker selector
- [ ] **Frontend:** Create datetime picker components
- [ ] **Testing:** Unit tests for assignment creation
- [ ] **Testing:** Validation tests for datetime logic

---

### US-008: Assignment Details View

- **Priority:** P1
- **Status:** Not Started
- **Dependencies:** US-007
- **Acceptance Criteria:**
  1. Expandable rows showing assignments per position
  2. Display worker name, start/end time, status
  3. Work hours in HH:MM format
  4. Color-coded status badges

**Tasks:**

- [ ] **Backend:** Implement `getAssignments` with position/worker joins
- [ ] **Frontend:** Create `/dashboard/assignments` page (board view)
- [ ] **Frontend:** Create `AssignmentBoard` component
- [ ] **Frontend:** Create expandable `PositionCard` with assignment list
- [ ] **Frontend:** Create `AssignmentRow` component with status badge
- [ ] **Frontend:** Implement work hours calculation display
- [ ] **Testing:** Unit tests for hours calculation

---

### US-009: Ending Active Assignment

- **Priority:** P1
- **Status:** Not Started
- **Dependencies:** US-007
- **Acceptance Criteria:**
  1. "End Work" action for active assignments
  2. Modal to confirm/edit end datetime
  3. Status changes to "completed"
  4. Recorded in audit log

**Tasks:**

- [ ] **Backend:** Implement `endAssignment` action using `end_assignment()` RPC
- [ ] **Frontend:** Create `EndAssignmentDialog` component
- [ ] **Frontend:** Add "End Work" button to active assignments
- [ ] **Testing:** Unit tests for end assignment logic
- [ ] **Testing:** Verify audit log entry creation

---

### US-010: Canceling Erroneous Assignment

- **Priority:** P2
- **Status:** Not Started
- **Dependencies:** US-007
- **Acceptance Criteria:**
  1. Cancel only allowed before start time
  2. Confirmation dialog required
  3. Status changes to "cancelled"
  4. Recorded in audit log

**Tasks:**

- [ ] **Backend:** Implement `cancelAssignment` action using `cancel_assignment()` RPC
- [ ] **Frontend:** Create `CancelAssignmentDialog` component
- [ ] **Frontend:** Add "Cancel" button (conditional on start time)
- [ ] **Frontend:** Show validation error if past start time
- [ ] **Testing:** Unit tests for cancellation validation
- [ ] **Testing:** Verify audit log entry creation

---

## Epic 5: Reporting & Audit

### US-011: Generating Hours Report

- **Priority:** P1
- **Status:** Not Started
- **Dependencies:** US-007, US-009
- **Acceptance Criteria:**
  1. Select date range for report
  2. Optional filter by client/location
  3. Summary grouped by workers and locations
  4. Export to CSV and Excel formats

**Tasks:**

- [ ] **Backend:** Create `services/reports/actions.ts` with `generateHoursReport`
- [ ] **Backend:** Implement `exportReportToCsv` and `exportReportToExcel`
- [ ] **Backend:** Use `get_hours_report()` RPC function
- [ ] **Frontend:** Create `/dashboard/reports` page
- [ ] **Frontend:** Create `ReportFilterForm` component (date range, client filter)
- [ ] **Frontend:** Create `ReportSummaryTable` component
- [ ] **Frontend:** Create `ExportButtons` component (CSV/Excel)
- [ ] **Testing:** Unit tests for report generation
- [ ] **Testing:** Verify export file formats

---

## Epic 6: UI/UX Foundation

### TECH-001: Dashboard Layout & Navigation

- **Priority:** P0
- **Status:** Done
- **Dependencies:** US-002
- **Description:** Create the main dashboard shell with sidebar navigation

**Tasks:**

- [x] **Frontend:** Create `DashboardLayout` component with sidebar (`app/(dashboard)/layout.tsx`)
- [x] **Frontend:** Create `AppSidebar` with navigation links (`components/layout/appSidebar.tsx`)
- [x] **Frontend:** Create `Header` with user menu and org name (`components/layout/header.tsx`)
- [x] **Frontend:** Implement responsive design (mobile sidebar via Sheet overlay)
- [x] **Frontend:** Create `UserMenu` component with sign out (`components/layout/userMenu.tsx`)
- [x] **Frontend:** Create `PageHeader` and `PageContainer` components
- [x] **Testing:** Unit tests for layout components (753 lines of tests)
- [ ] **Frontend:** Add breadcrumb navigation (component exists, not integrated)

---

### TECH-002: Data Table Component

- **Priority:** P0
- **Status:** Done
- **Dependencies:** None
- **Description:** Reusable data table with sorting, filtering, pagination

**Tasks:**

- [x] **Frontend:** Create `DataTable` component with column definitions (`components/ui/data-table/`)
- [x] **Frontend:** Add sorting functionality (`DataTableColumnHeader`)
- [x] **Frontend:** Add pagination controls (`DataTablePagination`)
- [x] **Frontend:** Add row selection (`useRowSelection` hook)
- [x] **Frontend:** Add expandable rows (`useExpandableRows` hook)
- [x] **Frontend:** Add empty state and loading skeleton (`EmptyState`, `DataTableSkeleton`)
- [x] **Frontend:** Create `useTableParams` hook for URL state sync
- [x] **Testing:** Unit tests for table interactions (58 tests)

---

### TECH-003: Form Components

- **Priority:** P0
- **Status:** Done
- **Dependencies:** None
- **Description:** Reusable form components for all CRUD operations

**Tasks:**

- [x] **Frontend:** Create `DateTimePicker` component (`components/ui/datetime-picker.tsx`)
- [x] **Frontend:** Create `PhoneInput` component with formatting (`components/ui/phone-input.tsx`)
- [x] **Frontend:** Create `SearchInput` with debounce (`components/ui/search-input.tsx`)
- [x] **Frontend:** Create `ComboboxSelect` for entity selection (`components/ui/combobox-select.tsx`)
- [x] **Frontend:** Create `useSearchInput` hook with URL sync (`hooks/useSearchInput.ts`)
- [x] **Testing:** Unit tests for input components (73 tests total)

---

## Blockers & Risks

| Issue | Impact | Mitigation |
|-------|--------|------------|
| 5 backend modules need actions.ts implementation | High | Follow established pattern from Auth/Clients modules |
| No E2E tests configured | Medium | Set up Playwright before major UI work |
| ~~Dashboard layout not built~~ | ~~High~~ | ✅ TECH-001 completed |
| Email sending not configured | Medium | Verify Supabase Auth email settings for registration/reset |

---

## Implementation Notes

### Backend Pattern (from existing code)

All server actions should follow the established pattern:

```typescript
export const actionName = createAction<InputType, OutputType>(
  async (input, { supabase, user }) => {
    // Implementation using supabase client
    // Throw errors for automatic ActionError mapping
  },
  { schema: zodSchema }
);
```

### Frontend Pattern

- Use `components/ui/*` for base components
- Create feature components in `components/features/{module}/`
- Use react-hook-form + zod for all forms
- Use `useServerAction` hook for action calls

### Recommended Implementation Order

**Sprint 1: Foundation**

1. ~~TECH-001 (Dashboard Layout)~~ ✅ Done
2. ~~TECH-002 (Data Table)~~ ✅ Done
3. ~~TECH-003 (Form Components)~~ ✅ Done

**Sprint 2: Auth Completion**

1. ~~US-001 (Registration)~~ ✅ Done
2. ~~US-012 (Password Reset)~~ ✅ Done

**Sprint 3: Master Data**

1. US-003 (Clients - frontend only, backend done)
2. US-004 (Work Locations)

**Sprint 4: Workers & Positions**

1. US-005 (Worker Management)
2. US-006 (Worker Filtering)
3. US-007 (Positions & Basic Assignments)

**Sprint 5: Assignment Workflow**

1. US-008 (Assignment Details)
2. US-009 (End Assignment)
3. US-010 (Cancel Assignment)

**Sprint 6: Reporting & Polish**

1. US-011 (Hours Report)
2. US-013 (User Management)
3. US-014 (Profile Editing)
