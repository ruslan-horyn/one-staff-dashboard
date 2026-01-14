# Dashboard Layout - Design Decisions

## Component Choices

### Sidebar (AppSidebar)
- **shadcn/ui base:** `Sidebar`, `SidebarProvider`, `SidebarContent`, `SidebarGroup`, `SidebarMenu`, `SidebarMenuButton`
- **Reasoning:** Comprehensive sidebar primitives with built-in responsive behavior, keyboard shortcuts, and cookie persistence
- **Customizations:**
  - Use `variant="sidebar"` (default)
  - Use `collapsible="icon"` for desktop collapse to icons
  - Mobile automatically renders as Sheet

### Header
- **shadcn/ui base:** `SidebarTrigger`, `Separator`
- **Reasoning:** Trigger component handles all responsive states automatically
- **Customizations:**
  - Fixed height header bar
  - Flex layout with sidebar trigger, title, and user menu

### UserMenu
- **shadcn/ui base:** `DropdownMenu`, `Avatar`, `Badge`
- **Reasoning:** Full-featured dropdown with keyboard navigation and accessibility
- **Customizations:**
  - Avatar with initials fallback
  - Role badge (admin/coordinator)
  - Separator before destructive sign out action

### PageHeader
- **shadcn/ui base:** None (custom component)
- **Reasoning:** Simple presentational component for consistent page titles
- **Customizations:** Flexible actions slot for CTAs

### PageContainer
- **shadcn/ui base:** None (custom wrapper)
- **Reasoning:** Consistent padding and max-width across all pages
- **Customizations:** Responsive padding (p-4 md:p-6)

## Layout Structure

### Desktop (≥1024px)
```
┌─────────────────────────────────────────────────────────┐
│ [≡] One Staff Dashboard               [Org] [Avatar ▾] │
├──────────────┬──────────────────────────────────────────┤
│              │                                          │
│  ≡ Board     │           Main Content Area              │
│  ≡ Workers   │                                          │
│  ≡ Reports   │  ┌─────────────────────────────────┐    │
│  ───────     │  │ PageHeader: Title    [Actions]   │    │
│  Admin:      │  ├─────────────────────────────────┤    │
│  ≡ Clients   │  │ PageContainer                    │    │
│  ≡ Locations │  │   - View content                 │    │
│  ≡ Users     │  │                                  │    │
│              │  └─────────────────────────────────┘    │
└──────────────┴──────────────────────────────────────────┘
```

### Tablet (768-1023px)
- Sidebar collapsed to icon-only mode by default
- Header toggle expands/collapses sidebar
- Content area takes full width when collapsed

### Mobile (<768px)
- Sidebar hidden, opens as Sheet overlay
- Hamburger button in header triggers Sheet
- Full-width content area
- Touch-optimized navigation items

## Styling Decisions

### Sidebar
- Width: 16rem (256px) expanded, 3rem (48px) collapsed
- Background: `bg-sidebar` (theme token)
- Border: right border separator
- Sticky positioning

### Header
- Height: 3.5rem (56px)
- Background: transparent (inherits from page)
- Border: bottom border separator
- Sticky positioning at top

### Navigation Items
- Icon + label (collapsed shows tooltip)
- Active state: `bg-sidebar-accent` background
- Hover state: subtle background change
- Padding: consistent with design system

### User Menu
- Avatar: 2rem (32px) size
- Dropdown width: 14rem (224px)
- Position: aligned to right edge

## Accessibility Implementation

| Requirement | Implementation |
|-------------|----------------|
| Navigation landmark | `<nav aria-label="Main navigation">` on SidebarContent |
| Active page | `aria-current="page"` on active SidebarMenuButton |
| Collapsible state | `aria-expanded` managed by SidebarProvider |
| Keyboard toggle | Cmd+B / Ctrl+B shortcut (built into SidebarProvider) |
| Focus management | Focus trap in Sheet on mobile (built into Sheet) |
| Menu semantics | `role="menu"` on DropdownMenu (built-in) |

## State Management

- [x] URL state for: current route (via Next.js router)
- [x] Cookie state for: sidebar expanded/collapsed (handled by SidebarProvider)
- [ ] No Zustand needed - sidebar state is ephemeral and cookie-based
- [ ] Local state for: dropdown open/close (managed by DropdownMenu)

## Icons

Using Lucide React icons:
- `Home` - Board
- `Users` - Workers
- `BarChart3` - Reports
- `Building2` - Clients
- `MapPin` - Locations
- `UserCog` - Users (admin)
- `LogOut` - Sign out
- `User` - Profile
- `ChevronUp` - Dropdown indicator
- `PanelLeft` - Sidebar trigger

## Color Scheme

Using shadcn sidebar theme tokens:
- `--sidebar-background`
- `--sidebar-foreground`
- `--sidebar-primary`
- `--sidebar-primary-foreground`
- `--sidebar-accent`
- `--sidebar-accent-foreground`
- `--sidebar-border`

## Open Questions

None - all decisions are resolved based on existing shadcn patterns and project requirements.
