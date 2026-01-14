# Dashboard Layout - Requirements Analysis

## Source Documents
- ui-architecture.md: Section 4 (Layout), Section 5.2 (Layout components)
- prd.md: Section 3.1 (User roles: Admin, Coordinator)
- prompt: `.ai/prompts/ui-plan-tech-001-dashboard-layout.md`

## View Overview

| Attribute | Value |
|-----------|-------|
| Path | `/` (root, all dashboard routes) |
| Route Group | `(dashboard)` |
| Purpose | Main application shell with sidebar navigation, header, and content area |

## User Flow

| Action | Redirect To | Notes |
|--------|-------------|-------|
| Login success | `/` | Board view (main dashboard) |
| Sign out | `/login` | Clears session |
| Profile click | `/profile` | User profile page |

## User Roles

### Administrator
- Full system access including master data management
- Can manage Coordinators (invite, deactivate)
- Full visibility to all menu items
- Access to: Board, Workers, Reports, Clients, Locations, Users

### Coordinator (Agency Employee)
- Limited access to operational features
- Can manage workers and assignments
- Access to: Board, Workers, Reports
- No access to: Clients, Locations, Users

## Data Requirements

- [ ] Current user profile (firstName, lastName, email)
- [ ] User role ('admin' | 'coordinator')
- [ ] Organization name
- [ ] Active route path (for highlighting)

## User Interactions

- [ ] Navigate between main sections via sidebar
- [ ] Toggle sidebar expanded/collapsed (desktop)
- [ ] Open sidebar as sheet (mobile)
- [ ] Open user menu dropdown
- [ ] Sign out via user menu
- [ ] Navigate to profile via user menu
- [ ] Keyboard shortcut Cmd+B to toggle sidebar

## Components Identified

| Component | Type | Status |
|-----------|------|--------|
| DashboardLayout | Server | New |
| AppSidebar | Client | New |
| Header | Client | New |
| UserMenu | Client | New |
| PageHeader | Server | New |
| PageContainer | Server | New |
| SidebarProvider | Client | Existing (shadcn) |
| Sidebar | Client | Existing (shadcn) |
| SidebarInset | Client | Existing (shadcn) |
| DropdownMenu | Client | Existing (shadcn) |
| Avatar | Client | Existing (shadcn) |

## Server Actions Required

- [ ] `getCurrentUser()` - Fetch user profile with role and organization
- [ ] `signOut()` - Sign out user and clear session

## Accessibility Requirements

- [ ] `<nav aria-label="Main navigation">` on sidebar
- [ ] `aria-current="page"` on active navigation link
- [ ] `aria-expanded` on collapsible sidebar sections
- [ ] Keyboard navigation (Tab through items, Enter to navigate)
- [ ] Focus trap in mobile Sheet overlay
- [ ] `role="menu"` for user dropdown menu
- [ ] `aria-label` on sidebar trigger button

## Security Considerations

- [ ] Verify user authentication before rendering layout
- [ ] Role-based menu item visibility (admin vs coordinator)
- [ ] Sign out action validates session before clearing
- [ ] No sensitive data exposed in client components

## Route Configuration

**Verified in `lib/supabase/proxy.ts`:**
- Dashboard routes (/) are protected (not in publicRoutes)
- Unauthenticated users redirected to `/login`
- Authenticated users redirected away from auth pages to `/`

**Required change:**
- Update proxy redirect from `/dashboard` to `/` (line 70)
