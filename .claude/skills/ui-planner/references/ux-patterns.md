# UX Patterns Reference

Patterns and best practices for Stage 2: UX Consultation.

## shadcn/ui Component Selection

### Form Components

| Use Case | Component | Notes |
|----------|-----------|-------|
| Text input | `Input` | With `Label` |
| Password | `Input` type="password" | Add visibility toggle |
| Email | `Input` type="email" | HTML5 validation |
| Phone | `Input` type="tel" | Custom formatting |
| Textarea | `Textarea` | For multi-line |
| Select single | `Select` | Native-like |
| Select searchable | `Combobox` | For long lists |
| Checkbox | `Checkbox` | With `Label` |
| Radio group | `RadioGroup` | For exclusive options |
| Date | `Calendar` + `Popover` | DatePicker pattern |
| Date range | `Calendar` mode="range" | DateRangePicker |
| File upload | `Input` type="file" | Custom styling |

### Feedback Components

| Use Case | Component | Notes |
|----------|-----------|-------|
| Success/error messages | `Toast` (sonner) | Non-blocking |
| Inline validation | Custom with `aria-invalid` | Below input |
| Loading button | `Button` + spinner | Disable during load |
| Loading page | `Skeleton` | Match content layout |
| Empty state | Custom `Card` | CTA to add data |
| Error boundary | Custom component | With retry action |

### Navigation Components

| Use Case | Component | Notes |
|----------|-----------|-------|
| Main nav | Custom sidebar | With `Sheet` on mobile |
| Breadcrumbs | `Breadcrumb` | For nested routes |
| Tabs | `Tabs` | For in-page navigation |
| Pagination | Custom | Page numbers + arrows |
| User menu | `DropdownMenu` | Avatar + options |

### Data Display Components

| Use Case | Component | Notes |
|----------|-----------|-------|
| Simple table | `Table` | shadcn base |
| Complex table | `@tanstack/react-table` | Sort, filter, expand |
| Cards grid | `Card` | For visual items |
| List | Custom | For simple lists |
| Badge/status | `Badge` | Color variants |
| Avatar | `Avatar` | With fallback |

### Overlay Components

| Use Case | Component | Notes |
|----------|-----------|-------|
| Modal form | `Dialog` | For create/edit |
| Confirmation | `AlertDialog` | For destructive actions |
| Side panel | `Sheet` | For detail views |
| Dropdown | `DropdownMenu` | For action menus |
| Tooltip | `Tooltip` | For help text |
| Popover | `Popover` | For rich content |

## Layout Patterns

### Page Layouts

**List Page:**
```
┌─────────────────────────────────────────┐
│ PageHeader: Title + Actions             │
├─────────────────────────────────────────┤
│ Filters: Search + Filter dropdowns      │
├─────────────────────────────────────────┤
│ Table/Cards                             │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│ Pagination                              │
└─────────────────────────────────────────┘
```

**Form Page:**
```
┌─────────────────────────────────────────┐
│ PageHeader: Title + Breadcrumb          │
├─────────────────────────────────────────┤
│ Form                                    │
│ ┌─────────────────────────────────────┐ │
│ │ Section 1                           │ │
│ │ Field 1                             │ │
│ │ Field 2                             │ │
│ └─────────────────────────────────────┘ │
│ ┌─────────────────────────────────────┐ │
│ │ Section 2                           │ │
│ │ Field 3                             │ │
│ └─────────────────────────────────────┘ │
├─────────────────────────────────────────┤
│ FormActions: Cancel + Submit            │
└─────────────────────────────────────────┘
```

**Detail Page:**
```
┌─────────────────────────────────────────┐
│ PageHeader: Title + Actions + Back      │
├─────────────────────────────────────────┤
│ Main Content                            │
│ ┌──────────────────┐ ┌────────────────┐ │
│ │ Primary Info     │ │ Secondary      │ │
│ │                  │ │                │ │
│ └──────────────────┘ └────────────────┘ │
├─────────────────────────────────────────┤
│ Related Data (Table/List)               │
└─────────────────────────────────────────┘
```

### Responsive Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

**Common patterns:**
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` - Card grids
- `flex-col md:flex-row` - Stack to row
- `hidden md:block` - Hide on mobile
- `w-full md:w-auto` - Full width on mobile

### Mobile-First Approach

```tsx
// Start with mobile, add breakpoints for larger
<div className="
  flex flex-col     // Mobile: stack
  md:flex-row       // Tablet+: row
  gap-4
">
```

## Form Patterns

### Form Structure Principles

- Group related fields in sections with `space-y-4` or `space-y-6`
- Actions (Cancel/Submit) always at bottom, right-aligned with `flex gap-4 justify-end`
- Use `fieldset` to disable all inputs during submission
- Form wrapper uses `space-y-6` for section separation

### Validation Strategy

- Use react-hook-form with zodResolver
- Default validation mode: use form defaults (avoid `mode: 'onBlur'`)
- Show errors inline below inputs with `text-sm text-destructive`
- Associate errors with inputs via `aria-describedby`
- Mark invalid fields with `aria-invalid`

### Loading States

- Disable submit button during pending state
- Show loading text (e.g., "Saving..." instead of "Save")
- Optionally show spinner icon (`Loader2` from lucide-react)
- Consider using `useFormStatus` for Server Actions

*Implementation details and code examples are in ui-builder skill.*

## Table Patterns

### Basic Table

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead className="text-right">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {data.map((item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell><Badge>{item.status}</Badge></TableCell>
        <TableCell className="text-right">
          <DropdownMenu>...</DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

### Sortable Headers

```tsx
<TableHead
  className="cursor-pointer select-none"
  onClick={() => handleSort('name')}
  aria-sort={sortColumn === 'name' ? sortDirection : 'none'}
>
  <div className="flex items-center gap-2">
    Name
    {sortColumn === 'name' && (
      sortDirection === 'asc' ? <ChevronUp /> : <ChevronDown />
    )}
  </div>
</TableHead>
```

### Empty State

```tsx
{data.length === 0 ? (
  <TableRow>
    <TableCell colSpan={columns.length} className="h-24 text-center">
      <div className="flex flex-col items-center gap-2">
        <p className="text-muted-foreground">No workers found</p>
        <Button variant="outline" size="sm">Add first worker</Button>
      </div>
    </TableCell>
  </TableRow>
) : (
  // render rows
)}
```

## Accessibility Patterns

### Focus Management

- Dialog: Focus trapped inside, first focusable element auto-focused
- After destructive action: Return focus to logical element (e.g., add button)
- Use `autoFocus` on primary input in dialogs/forms
- Manage focus with refs when needed

### Keyboard Navigation

- Tables: Add `tabIndex={0}` to rows, handle Enter/Space for row actions
- Shortcuts: Escape to close dialogs, Cmd+Enter to submit
- Ensure all interactive elements are keyboard accessible

### Live Regions

- Toast notifications: Use sonner (handles aria-live automatically)
- Custom announcements: Use `aria-live="polite"` with `aria-atomic="true"`
- Place announcements in visually hidden container

### Screen Reader Only

- Use Tailwind's `sr-only` class for visually hidden but accessible text
- Common use: icon-only buttons, additional context for links

*Implementation details and code examples are in ui-builder skill.*

## WCAG Quick Reference

### Color Contrast

| Element | Minimum Ratio |
|---------|---------------|
| Normal text | 4.5:1 |
| Large text (18px+ or 14px+ bold) | 3:1 |
| UI components | 3:1 |
| Focus indicators | 3:1 |

### Touch Targets

- Minimum: 44x44 CSS pixels
- Recommended: 48x48 CSS pixels
- Spacing between targets: 8px minimum

### Focus Indicators

```css
/* Ensure visible focus */
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

### Form Labels

```tsx
// Always associate labels with inputs
<Label htmlFor="email">Email</Label>
<Input id="email" />

// Or wrap
<Label>
  Email
  <Input />
</Label>
```

## Tailwind Utility Patterns

### Spacing System

```
p-4  = 1rem = 16px
p-6  = 1.5rem = 24px
p-8  = 2rem = 32px

gap-4 for component spacing
gap-6 for section spacing
gap-8 for major sections
```

### Typography

```tsx
// Headings
<h1 className="text-3xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section</h2>
<h3 className="text-xl font-medium">Subsection</h3>

// Body
<p className="text-base">Normal text</p>
<p className="text-sm text-muted-foreground">Secondary text</p>
<p className="text-xs">Small text</p>
```

### Common Utilities

```tsx
// Truncate text
<span className="truncate max-w-[200px]">Long text...</span>

// Line clamp
<p className="line-clamp-2">Multi-line truncate...</p>

// Flex center
<div className="flex items-center justify-center">

// Grid auto
<div className="grid grid-cols-[auto_1fr_auto] gap-4">

// Transitions
<button className="transition-colors hover:bg-accent">
```

## State Patterns

### URL State for Filters

- Use `useSearchParams` from next/navigation for URL-based state
- Store: search query, page number, sort column/direction, active filters
- Reset page to 1 when filters change
- Consider using `nuqs` library for type-safe URL state

### Debounced Search

- Debounce search input (300ms recommended)
- Use local state for immediate input feedback
- Update URL only after debounce settles
- Show loading indicator during debounce

### Optimistic Updates

- Use `useOptimistic` hook for instant UI feedback
- Update local state immediately before server response
- Revert on error, confirm on success
- Use for: adding items to lists, toggling states, delete operations

*Implementation details and code examples are in ui-builder skill.*
