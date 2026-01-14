# Dashboard Layout - Implementation Plan

## File Structure

```
app/
└── (dashboard)/
    ├── layout.tsx              # Server Component - main layout wrapper
    ├── page.tsx                # Dashboard home (Board view placeholder)
    └── loading.tsx             # Loading skeleton

components/
└── layout/
    ├── app-sidebar.tsx         # Client Component - sidebar navigation
    ├── header.tsx              # Client Component - top bar
    ├── user-menu.tsx           # Client Component - user dropdown
    ├── page-header.tsx         # Server Component - page title
    ├── page-container.tsx      # Server Component - content wrapper
    └── index.ts                # Barrel exports

lib/
└── supabase/
    └── proxy.ts                # Update redirect path
```

## Implementation Order

1. [ ] Update proxy redirect (`lib/supabase/proxy.ts`)
2. [ ] Create PageContainer component
3. [ ] Create PageHeader component
4. [ ] Create UserMenu component
5. [ ] Create Header component
6. [ ] Create AppSidebar component
7. [ ] Create DashboardLayout (`app/(dashboard)/layout.tsx`)
8. [ ] Create Dashboard home page (`app/(dashboard)/page.tsx`)
9. [ ] Create Loading state (`app/(dashboard)/loading.tsx`)
10. [ ] Update barrel exports (`components/layout/index.ts`)

## Component Specifications

### PageContainer
- **File:** `components/layout/page-container.tsx`
- **Type:** Server Component
- **Props:**
  ```typescript
  interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
  }
  ```
- **Dependencies:** `cn` utility
- **Notes:** Simple wrapper with responsive padding

### PageHeader
- **File:** `components/layout/page-header.tsx`
- **Type:** Server Component
- **Props:**
  ```typescript
  interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
  }
  ```
- **Dependencies:** None
- **Notes:** Flex layout with title left, actions right

### UserMenu
- **File:** `components/layout/user-menu.tsx`
- **Type:** Client Component (`'use client'`)
- **Props:**
  ```typescript
  interface UserMenuProps {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      role: 'admin' | 'coordinator';
    };
  }
  ```
- **Dependencies:**
  - `@/components/ui/dropdown-menu`
  - `@/components/ui/avatar`
  - `@/components/ui/badge`
  - `@/services/auth` (signOut)
  - `lucide-react` (User, LogOut, ChevronUp)
  - `next/navigation` (useRouter)
- **Notes:**
  - Avatar with initials fallback (first letter of first + last name)
  - Role badge below user name
  - Sign out calls action then redirects to /login

### Header
- **File:** `components/layout/header.tsx`
- **Type:** Client Component (`'use client'`)
- **Props:**
  ```typescript
  interface HeaderProps {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      role: 'admin' | 'coordinator';
      organizationName: string;
    };
  }
  ```
- **Dependencies:**
  - `@/components/ui/sidebar` (SidebarTrigger)
  - `@/components/ui/separator`
  - `@/components/layout/user-menu`
- **Notes:**
  - SidebarTrigger on left
  - App title in center (optional)
  - Organization name + UserMenu on right

### AppSidebar
- **File:** `components/layout/app-sidebar.tsx`
- **Type:** Client Component (`'use client'`)
- **Props:**
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
- **Dependencies:**
  - `@/components/ui/sidebar` (all primitives)
  - `lucide-react` (Home, Users, BarChart3, Building2, MapPin, UserCog, ChevronUp)
  - `next/navigation` (usePathname)
- **Notes:**
  - Define navigation arrays (main + admin)
  - Use `usePathname()` for active state
  - Conditionally render admin group if `role === 'admin'`
  - Footer with user info + dropdown

### DashboardLayout
- **File:** `app/(dashboard)/layout.tsx`
- **Type:** Server Component
- **Props:**
  ```typescript
  interface DashboardLayoutProps {
    children: React.ReactNode;
  }
  ```
- **Dependencies:**
  - `@/components/ui/sidebar` (SidebarProvider, SidebarInset)
  - `@/components/layout` (AppSidebar, Header)
  - `@/services/auth` (getCurrentUser)
  - `@/services/shared` (isSuccess)
  - `next/navigation` (redirect)
- **Notes:**
  - Call `getCurrentUser()` to fetch user data
  - Redirect to /login if not authenticated
  - Extract user data for child components
  - Wrap in SidebarProvider with cookie persistence

### Dashboard Home Page
- **File:** `app/(dashboard)/page.tsx`
- **Type:** Server Component
- **Dependencies:**
  - `@/components/layout` (PageHeader, PageContainer)
- **Notes:**
  - Placeholder content for Board view
  - Title: "Board" or "Dashboard"
  - Content: placeholder message

### Loading State
- **File:** `app/(dashboard)/loading.tsx`
- **Type:** Server Component
- **Dependencies:**
  - `@/components/ui/skeleton`
- **Notes:**
  - Full-page skeleton matching layout structure

## Server Actions Used

| Action | File | Input | Return Type | Purpose |
|--------|------|-------|-------------|---------|
| `getCurrentUser` | `@/services/auth` | `{}` | `UserWithProfile` | Fetch user for layout |
| `signOut` | `@/services/auth` | `{}` | `{ success: boolean }` | User menu logout |

## Existing Utilities to Use

| Utility | Location | Purpose |
|---------|----------|---------|
| `isSuccess` | `@/services/shared` | Check action result |
| `cn` | `@/lib/utils/cn` | Class name merging |
| `UserRole` | `@/types/common` | Role type definition |

## Proxy Update

**File:** `lib/supabase/proxy.ts`
**Change:** Line 70
```typescript
// Before
url.pathname = '/dashboard';

// After
url.pathname = '/';
```

## Testing Checklist

### Unit Tests
- [ ] `AppSidebar` - renders main nav items for all roles
- [ ] `AppSidebar` - renders admin items only for admin role
- [ ] `AppSidebar` - highlights active route
- [ ] `UserMenu` - displays user name and role
- [ ] `UserMenu` - calls signOut on click
- [ ] `PageHeader` - renders title and optional actions
- [ ] `PageContainer` - applies correct padding

### Integration Tests
- [ ] Dashboard layout renders for authenticated user
- [ ] Unauthenticated user redirected to /login
- [ ] Sign out clears session and redirects

### Manual Testing
- [ ] Desktop: sidebar visible and collapsible
- [ ] Desktop: Cmd+B toggles sidebar
- [ ] Tablet: sidebar starts collapsed
- [ ] Mobile: hamburger opens sheet sidebar
- [ ] User menu opens and displays correctly
- [ ] Sign out works end-to-end
- [ ] Active route highlighted in sidebar
- [ ] Cookie persists sidebar state across refresh

## Success Criteria

- [ ] Layout wraps all `(dashboard)` routes
- [ ] Sidebar shows role-appropriate items
- [ ] Active route highlighted
- [ ] Mobile responsive with Sheet
- [ ] User menu with logout
- [ ] Sidebar state persisted in cookie
- [ ] Keyboard accessible (Tab, Enter, Cmd+B)
- [ ] Sign out redirects to /login
