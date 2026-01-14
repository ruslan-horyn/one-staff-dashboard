# Generate MVP Backlog

## Context

Product owner analyzing One Staff Dashboard - a multi-tenant SaaS for temporary staffing agencies. Generate a Scrum-like backlog to complete the MVP application.

Project uses:

- Next.js 16 (App Router, Server Components)
- Supabase (PostgreSQL, Auth, RLS)
- TypeScript, Zod, React Hook Form
- Tailwind CSS

## Source Files

### Primary (must read)

- `docs/prd.md` - Product Requirements Document with user stories US-001 to US-014
- `docs/db-plan.md` - Database schema, RLS policies, functions, triggers
- `docs/server-actions-plan.md` - Server actions implementation status

### Frontend (scan for existing views)

- `app/` - Next.js App Router pages and layouts
- `app/(auth)/` - Authentication pages (login, register, password reset)
- `app/dashboard/` - Main application views
- `components/` - Reusable UI components

### Reference (read as needed)

- `docs/tech-stack.md` - Technology decisions
- `docs/directory-architecture.md` - File structure conventions
- `types/database.ts` - Generated Supabase types
- `services/` - Existing server actions implementation

## Tasks

### Phase 1: Analysis

1. Read all source files listed above
2. Extract **backend** implementation status from `server-actions-plan.md`:
   - Which modules are complete?
   - Which modules have schemas only?
   - Which modules are not started?
3. Extract **frontend** implementation status by scanning `app/` directory:
   - Which pages exist? (look for `page.tsx` files)
   - Which pages are placeholders vs fully implemented?
   - Map existing routes to PRD user stories
4. Map PRD user stories (US-001 to US-014) to required functionality
5. Identify gaps between PRD requirements and current implementation
6. Check database migrations status (what's applied, what's pending)

### Phase 2: Backlog Generation

Generate a hierarchical backlog with:

#### Epics (high-level feature areas)

Group related functionality into epics:

- Authentication & User Management
- Master Data (Clients, Locations, Positions)
- Worker Management
- Assignment Workflow
- Reporting & Audit
- UI/UX Components

#### User Stories

For each epic, list user stories with:

- ID (use PRD IDs where applicable: US-001, etc.)
- Title
- Priority: P0 (critical), P1 (high), P2 (medium), P3 (low)
- Status: Done, In Progress, Not Started
- Dependencies (other stories that must be completed first)

#### Tasks

For each user story, break down into technical tasks:

- Backend tasks (server actions, RLS, migrations)
- Frontend tasks (pages, components, forms)
- Testing tasks (unit tests, integration tests)

### Phase 3: Prioritization & Ordering

1. Apply MoSCoW prioritization based on PRD requirements
2. Identify the critical path (minimum tasks for working MVP)
3. Order tasks respecting dependencies
4. Mark blockers and risks

## Output Format

### Backlog Structure

```markdown
# MVP Backlog - One Staff Dashboard

## Summary
- Total Epics: X
- Total Stories: X (Done: X, In Progress: X, Not Started: X)
- Estimated Tasks: X

## Implementation Status

### Backend Modules
| Module | Actions | Schemas | Status |
|--------|---------|---------|--------|
| Auth | ✅ | ✅ | Complete |
| Clients | ✅ | ✅ | Complete |
| ... | ... | ... | ... |

### Frontend Views
| Route | PRD Story | Page | Status |
|-------|-----------|------|--------|
| /login | US-002 | ✅ | Complete |
| /register | US-001 | ❌ | Not Started |
| /dashboard/clients | US-003 | ❌ | Not Started |
| ... | ... | ... | ... |

## Critical Path
[List the minimum stories required for MVP in order]

---

## Epic 1: [Epic Name]

### US-XXX: [Story Title]
- **Priority**: P0/P1/P2/P3
- **Status**: Done | In Progress | Not Started
- **Dependencies**: US-YYY, US-ZZZ
- **Acceptance Criteria**: [from PRD]

**Tasks:**
- [ ] **Backend**: [task description]
- [ ] **Frontend**: [task description]
- [ ] **Testing**: [task description]

---

[Repeat for each story and epic]

---

## Blockers & Risks
| Issue | Impact | Mitigation |
|-------|--------|------------|
| [description] | [High/Medium/Low] | [action] |

## Implementation Notes
[Key technical decisions or considerations]
```

### Example Story

```markdown
### US-002: System Login
- **Priority**: P0
- **Status**: Done
- **Dependencies**: None (first story)
- **Acceptance Criteria**:
  1. System displays login page with email and password fields
  2. After correct credentials, user redirected to Board view
  3. After incorrect credentials, error message displayed

**Tasks:**
- [x] **Backend**: Implement `signIn` server action with Supabase Auth
- [x] **Backend**: Implement `signOut` server action
- [x] **Frontend**: Create login page at `/login`
- [x] **Frontend**: Create login form with email/password fields
- [x] **Frontend**: Handle error states and loading
- [ ] **Testing**: Unit tests for auth actions
- [ ] **Testing**: E2E test for login flow
```

## Success Criteria

### Measurable Goals

- All 14 PRD user stories (US-001 to US-014) are mapped to backlog
- Each story has clear tasks with backend/frontend/testing breakdown
- Critical path identified with estimated minimum scope
- Dependencies correctly identified (no circular dependencies)
- Status accurately reflects current implementation

### Validation Method

- Cross-reference each US-XXX with PRD acceptance criteria
- Verify "Done" backend status matches implemented code in `services/`
- Verify "Done" frontend status matches existing pages in `app/`
- Check database features against `db-plan.md`
- Ensure all PRD functional requirements are covered

## Constraints

- Use PRD user story IDs (US-001 to US-014) where applicable
- Add new stories only for technical requirements not in PRD
- Mark all auth-related stories based on actual implementation status
- Focus on MVP scope - do not add features outside PRD boundaries
- Respect the "Product Scope Boundaries" section from PRD
