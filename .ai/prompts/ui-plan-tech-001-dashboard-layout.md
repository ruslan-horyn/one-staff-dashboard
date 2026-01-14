# TECH-001: Dashboard Layout & Navigation

## Context

UI Planner task for One Staff Dashboard - a staffing agency MVP application.
Create the main dashboard shell with sidebar navigation, header with user menu, and responsive design.

**Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui
**Existing:** `components/ui/sidebar.tsx` (shadcn sidebar primitives)

## Source Files

### Primary (must read):
- `docs/ui-architecture.md` - Section 4 (Layout), Section 5.2 (Layout components)
- `docs/prd.md` - Section 3.1 (User roles: Admin, Coordinator)
- `components/ui/sidebar.tsx` - Existing shadcn sidebar primitives

### Reference:
- `docs/directory-architecture.md` - File placement conventions
- `app/(auth)/layout.tsx` - Auth layout pattern reference
- `services/auth/actions.ts` - `signOut`, `getCurrentUser` actions

## Tasks

### Phase 1: Requirements Analysis

1. Read `docs/ui-architecture.md` sections 4.1-4.4 for layout specs
2. Read `docs/prd.md` section 3.1 for role definitions
3. Identify navigation items per role
4. Document responsive breakpoints

### Phase 2: Design Decisions

1. Choose sidebar variant (sidebar, floating, inset)
2. Define header structure (logo, breadcrumb, user menu)
3. Plan mobile Sheet behavior
4. Design user menu dropdown

### Phase 3: Implementation Plan

1. Create file structure and component specs
2. Define props interfaces
3. Specify implementation order
4. Create testing checklist

## Components Specification

### DashboardLayout

| Property | Value |
|----------|-------|
| File | `app/(dashboard)/layout.tsx` |
| Type | Server Component |
| Purpose | Wrap all dashboard routes with sidebar + header |

**Requirements:**
- Fetch current user with `getCurrentUser()`
- Pass user data to client components
- Handle loading state

### AppSidebar

| Property | Value |
|----------|-------|
| File | `components/layout/app-sidebar.tsx` |
| Type | Client Component |
| Purpose | Main navigation with role-based items |

**Navigation Structure:**

```typescript
const navigationItems = {
  main: [
    { label: 'Board', icon: Home, path: '/' },
    { label: 'Workers', icon: Users, path: '/workers' },
    { label: 'Reports', icon: BarChart3, path: '/reports' },
  ],
  admin: [
    { label: 'Clients', icon: Building2, path: '/clients' },
    { label: 'Locations', icon: MapPin, path: '/locations' },
    { label: 'Users', icon: UserCog, path: '/admin/users' },
  ],
};
```

**Props:**
```typescript
interface AppSidebarProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    role: 'admin' | 'coordinator';
    organizationName: string;
  };
}
```

### Header

| Property | Value |
|----------|-------|
| File | `components/layout/header.tsx` |
| Type | Client Component |
| Purpose | Top bar with sidebar trigger and user menu |

**Structure:**
```
┌─────────────────────────────────────────────────────────┐
│ [≡] One Staff Dashboard          [Organization] [User▾]│
└─────────────────────────────────────────────────────────┘
```

### UserMenu

| Property | Value |
|----------|-------|
| File | `components/layout/user-menu.tsx` |
| Type | Client Component |
| Purpose | User dropdown with profile and logout |

**Menu Items:**
- User name + role badge
- Profile link → `/profile`
- Separator
- Sign out (calls `signOut` action)

### PageHeader

| Property | Value |
|----------|-------|
| File | `components/layout/page-header.tsx` |
| Type | Server Component |
| Purpose | Page title with optional action buttons |

**Props:**
```typescript
interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}
```

### PageContainer

| Property | Value |
|----------|-------|
| File | `components/layout/page-container.tsx` |
| Type | Server Component |
| Purpose | Content wrapper with consistent padding |

## Responsive Behavior

| Breakpoint | Sidebar | Trigger |
|------------|---------|---------|
| Desktop ≥1024px | Visible, collapsible | Rail click or Cmd+B |
| Tablet 768-1023px | Collapsed (icons only) | Header button |
| Mobile <768px | Hidden (Sheet) | Hamburger menu |

## Accessibility

- `<nav aria-label="Main navigation">` on sidebar
- `aria-current="page"` on active link
- `aria-expanded` on collapsible sections
- Keyboard: Tab through items, Enter to navigate
- Focus trap in mobile Sheet

## Output Format

Generate 3 files in `docs/ui-sessions/dashboard-layout/`:

1. `01-requirements.md` - Data requirements, components list, user stories
2. `02-design-decisions.md` - Layout wireframes, component choices, styling
3. `03-implementation-plan.md` - File structure, code specs, testing checklist

## Success Criteria

- [ ] Layout wraps all `(dashboard)` routes
- [ ] Sidebar shows role-appropriate items
- [ ] Active route highlighted
- [ ] Mobile responsive with Sheet
- [ ] User menu with logout
- [ ] Sidebar state persisted in cookie
- [ ] Keyboard accessible
