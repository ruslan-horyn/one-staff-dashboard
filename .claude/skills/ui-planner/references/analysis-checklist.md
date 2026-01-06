# Analysis Checklist

Comprehensive checklist for Stage 1: Requirements Analysis.

## User Flow Verification

**REQUIRED:** If user flow was not specified, verify before proceeding:

### Redirect Destinations

- [ ] **Success redirect** - Where does user go after successful action?
- [ ] **Error behavior** - Stay on page or redirect?
- [ ] **Cancel destination** - Where does Cancel button lead?

### Navigation Links

- [ ] **Inbound links** - Which pages link TO this view?
- [ ] **Outbound links** - Which pages does this view link TO?
- [ ] **Back navigation** - Specific back target or browser history?

### Common Patterns Reference

| View Type | Success Redirect | Cancel | Related |
|-----------|------------------|--------|---------|
| Login | `/` or `/dashboard` | N/A | forgot-password |
| Register | `/login` or auto-login → `/` | `/login` | login |
| Forgot Password | `/login` | `/login` | login |
| Reset Password | `/login` | N/A | - |
| Create Form | list page | list page | - |
| Edit Form | detail or list | detail or list | - |
| Profile | stay on page | `/` | - |

---

## Document Review

### ui-architecture.md Analysis

For each view, extract:

- [ ] **Path** - Route path (e.g., `/login`, `/workers/[id]`)
- [ ] **Route Group** - Grouping (e.g., `(auth)`, `(dashboard)`)
- [ ] **Purpose** - Main goal of the view
- [ ] **Key Information** - Data to display
- [ ] **Key Components** - Listed components with Client/Server designation
- [ ] **UX Requirements** - Interactions, behaviors
- [ ] **Accessibility** - ARIA, keyboard navigation requirements
- [ ] **Security** - Auth requirements, RLS, role checks

### prd.md Analysis

Map view to User Stories:

| View | User Stories |
|------|--------------|
| Login | US-001 |
| Board | US-005, US-006, US-007, US-008, US-009 |
| Workers List | US-004, US-005 |
| Worker Form | US-004 |
| Clients List | US-002 |
| Client Form | US-002 |
| Locations List | US-003 |
| Location Form | US-003 |
| Reports | US-010 |
| Forgot Password | US-011 |
| Reset Password | US-011 |
| Profile | US-013 |
| Admin Users | US-012 |

Extract from each US:
- [ ] Acceptance criteria
- [ ] Edge cases mentioned
- [ ] Business rules

## Data Requirements Checklist

### Input Data (Forms)

- [ ] Required fields identified
- [ ] Optional fields identified
- [ ] Field types defined (text, email, password, select, date, etc.)
- [ ] Validation rules specified
- [ ] Default values needed?
- [ ] Pre-population from existing data?

### Output Data (Display)

- [ ] Data source (Server Action, props)
- [ ] Data shape (single object, array, paginated)
- [ ] Loading states needed
- [ ] Empty states defined
- [ ] Error states defined

### URL State

- [ ] Search/filter parameters
- [ ] Pagination parameters
- [ ] Sort parameters
- [ ] Shareable URL requirements

## Component Analysis

### Existing Components Audit

Search codebase for reusable components:

```bash
# Find existing components
ls -la app/**/components/
ls -la components/

# Search for specific patterns
grep -r "export.*Button" --include="*.tsx"
grep -r "export.*Input" --include="*.tsx"
grep -r "export.*Form" --include="*.tsx"
```

### Component Classification

| Component | Type | Reason |
|-----------|------|--------|
| Layout wrappers | Server | No interactivity |
| Static content | Server | No state |
| Forms | Client | react-hook-form hooks |
| Tables with sort | Client | useState, event handlers |
| Modals/Dialogs | Client | open/close state |
| Search inputs | Client | debounce, controlled input |
| Buttons with loading | Client | useFormStatus |

### New Components Needed

For each new component, determine:

- [ ] Name (PascalCase)
- [ ] Location (`app/.../components/` or `components/`)
- [ ] Server or Client Component
- [ ] Props interface
- [ ] Children components
- [ ] Shared vs view-specific

## Server Actions Analysis

### Required Actions

Check `/services/` for existing actions:

```bash
ls -la services/*/actions.ts
grep -r "export.*async.*function\|export const.*=" services/*/actions.ts
```

### Action Requirements

For each action needed:

- [ ] Action name
- [ ] Input schema (Zod)
- [ ] Return type
- [ ] Auth requirement (requireAuth option)
- [ ] Role requirement (admin only?)
- [ ] Error cases to handle

### Existing Actions Mapping

| Module | Available Actions |
|--------|-------------------|
| auth | signIn, signOut, signUp, resetPassword, updatePassword |
| workers | getWorkers, getWorker, createWorker, updateWorker, deleteWorker |
| clients | getClients, getClient, createClient, updateClient, deleteClient |
| locations | getWorkLocations, getWorkLocation, createWorkLocation, updateWorkLocation, deleteWorkLocation |
| assignments | getAssignments, createAssignment, endAssignment, cancelAssignment |
| reports | generateHoursReport, exportReportToCsv |
| users | getUsers, getCurrentUser, updateProfile, deactivateUser |

## Accessibility Checklist

### WCAG 2.1 AA Requirements

#### Perceivable

- [ ] Text alternatives for images (alt text)
- [ ] Captions for video/audio (if applicable)
- [ ] Content adaptable (semantic HTML)
- [ ] Distinguishable (color contrast 4.5:1 for text)

#### Operable

- [ ] Keyboard accessible (all functionality)
- [ ] No keyboard traps
- [ ] Sufficient time for interactions
- [ ] No content that flashes more than 3 times/second
- [ ] Skip links for navigation
- [ ] Focus visible and logical order

#### Understandable

- [ ] Language attribute set
- [ ] Consistent navigation
- [ ] Consistent identification of components
- [ ] Error identification and suggestions
- [ ] Labels and instructions for inputs

#### Robust

- [ ] Valid HTML
- [ ] Name, role, value for custom components

### Form Accessibility

- [ ] Labels associated with inputs (`htmlFor` or wrapping)
- [ ] Required fields marked (`aria-required`)
- [ ] Error messages linked (`aria-describedby`)
- [ ] Invalid state indicated (`aria-invalid`)
- [ ] Error summary for multiple errors
- [ ] Focus moves to first error on submit

### Interactive Elements

- [ ] Buttons have accessible names
- [ ] Links have descriptive text (not "click here")
- [ ] Dialogs have `role="dialog"` and `aria-modal`
- [ ] Dialogs trap focus
- [ ] Expandable content has `aria-expanded`
- [ ] Tabs have proper ARIA roles
- [ ] Loading states announced (`aria-live`)

## Security Checklist

### Authentication

- [ ] Route requires authentication?
- [ ] Unauthenticated redirect to `/login`
- [ ] Session validation in Server Components

### Authorization

- [ ] Role-based access (Admin only?)
- [ ] RLS policies in place for data
- [ ] Server Action role checks

### Data Handling

- [ ] No sensitive data in URL params
- [ ] CSRF protection (built into Server Actions)
- [ ] XSS prevention (React escaping)
- [ ] SQL injection prevention (Supabase parameterized queries)

### Forms

- [ ] Validation on both client and server
- [ ] Rate limiting (Supabase Auth for auth forms)
- [ ] No sensitive data in error messages

## Performance Checklist

### Loading Strategy

- [ ] Server Components for static content
- [ ] Streaming with Suspense for async data
- [ ] Skeleton loaders for perceived performance

### Data Fetching

- [ ] Fetch data in Server Components when possible
- [ ] Avoid waterfalls (parallel fetching)
- [ ] Pagination for large lists

### Bundle Size

- [ ] Minimize Client Components
- [ ] Code splitting with dynamic imports
- [ ] Tree-shakeable imports

## Output Template

After completing analysis, generate `01-requirements.md`:

```markdown
# [View Name] - Requirements Analysis

**Generated:** [date]
**Source:** ui-architecture.md Section X.X, prd.md US-XXX

## View Overview

| Attribute | Value |
|-----------|-------|
| Path | [path] |
| Route Group | [group] |
| Purpose | [description] |
| Auth Required | Yes/No |
| Roles | All/Admin |

## Data Requirements

### Input (Forms)
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| | | | |

### Output (Display)
| Data | Source | Type |
|------|--------|------|
| | | |

### URL State
| Param | Purpose | Default |
|-------|---------|---------|
| | | |

## Components

### Existing (Reuse)
| Component | Location | Notes |
|-----------|----------|-------|
| | | |

### New (Create)
| Component | Type | Location |
|-----------|------|----------|
| | | |

## Server Actions

### Existing
| Action | Module | Usage |
|--------|--------|-------|
| | | |

### New Required
| Action | Input | Output | Notes |
|--------|-------|--------|-------|
| | | | |

## Accessibility Requirements

- [ ] [specific requirement]
- [ ] [specific requirement]

## Security Requirements

- [ ] [specific requirement]
- [ ] [specific requirement]

## Open Questions

- [ ] [question needing clarification]
```
