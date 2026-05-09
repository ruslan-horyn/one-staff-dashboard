# UI/UX Best Practices for CRUD Management Views

## Context

UI/UX planning guide for building consistent CRUD (Create, Read, Update, Delete) management views in One Staff Dashboard - a Next.js 16 staffing agency application.

**Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, @tanstack/react-table, react-hook-form + Zod

## Source Files

### Primary (must read)

- `docs/ui-architecture.md` - UI patterns, component structure, accessibility
- `docs/directory-architecture.md` - File organization
- `docs/tech-stack.md` - Technology constraints

### Reference

- `components/ui/data-table/` - Existing DataTable implementation
- `components/ui/` - shadcn/ui components
- `services/shared/` - Server action patterns, pagination helpers

## Best Practices

### 1. Data Table Patterns

#### List View Structure

```
┌─────────────────────────────────────────────────────────────┐
│ PageHeader: Title + Primary Action Button                   │
├─────────────────────────────────────────────────────────────┤
│ Filters: SearchInput + Additional Filters                   │
├─────────────────────────────────────────────────────────────┤
│ DataTable with columns, sorting, pagination                 │
│ - Sortable column headers                                   │
│ - Row actions (Edit, Delete)                                │
│ - Optional expandable rows                                  │
└─────────────────────────────────────────────────────────────┘
```

#### Column Best Practices

- Primary identifier column first (name, title)
- Contact info columns (email, phone) in middle
- Status/counts as badges
- Actions column last (right-aligned)
- Use consistent column widths across similar views

#### Row Actions

- Inline actions for common operations (Edit, Delete)
- Dropdown menu for 3+ actions
- Destructive actions require confirmation dialog
- Disabled state with tooltip for unavailable actions

### 2. Form Dialog Patterns

#### Dialog vs Page Navigation

| Use Dialog | Use Page |
|------------|----------|
| Quick add (1-5 fields) | Complex forms (6+ fields) |
| Edit simple entity | Nested relationships |
| Inline creation | Multi-step workflows |

#### Dialog Structure

```tsx
<Dialog>
  <DialogHeader>
    <DialogTitle>{isEdit ? 'Edit' : 'Add'} {EntityName}</DialogTitle>
  </DialogHeader>
  <DialogContent>
    <Form>
      {/* Form fields */}
    </Form>
  </DialogContent>
  <DialogFooter>
    <Button variant="outline" onClick={close}>Cancel</Button>
    <Button type="submit" disabled={isPending}>
      {isPending ? <Spinner /> : 'Save'}
    </Button>
  </DialogFooter>
</Dialog>
```

#### Form Field Organization

1. Required fields first
2. Group related fields (contact info together)
3. Optional fields last
4. Clear visual separation between groups

### 3. Search & Filter UX

#### Search Input

- Debounced input (300ms)
- URL state sync for shareable links
- Clear button when has value
- Placeholder describing searchable fields

```tsx
<SearchInput
  placeholder="Search by name, email, or phone..."
  value={search}
  onChange={setSearch}
  className="w-full md:w-80"
/>
```

#### Filter Patterns

- Filters visible by default if commonly used
- Collapsible filter panel for advanced filters
- "Clear all filters" button when any active
- Filter state in URL params
- Badge/count showing active filter count

### 4. Error Handling

#### Form Validation Errors

- Inline errors below each field
- Error message appears on blur or submit
- Field border turns red (`ring-destructive`)
- `aria-invalid="true"` and `aria-describedby` for accessibility

#### Action Errors

| Error Code | UX Pattern |
|------------|------------|
| `VALIDATION_ERROR` | Inline field errors |
| `NOT_FOUND` | Redirect + toast notification |
| `HAS_DEPENDENCIES` | Blocking dialog explaining dependencies |
| `DUPLICATE_ENTRY` | Inline error on specific field |
| `FORBIDDEN` | Toast + redirect to safe route |

#### Error Toast Pattern

```tsx
toast.error({
  title: "Unable to delete client",
  description: "This client has active work locations. Remove them first.",
  action: <ToastAction>View Locations</ToastAction>
});
```

### 5. Loading States

#### Table Loading

- `DataTableSkeleton` with matching column count
- Preserve header during loading
- Disable sorting/filtering while loading

#### Form Submit Loading

- Disable all form inputs
- Show spinner in submit button
- Keep cancel button enabled
- Prevent double-submit

#### Optimistic Updates

- Update UI immediately
- Revert on error
- Show subtle loading indicator
- Use `useOptimistic` hook

### 6. Empty States

#### Structure

```tsx
<EmptyState
  icon={<IconComponent className="h-12 w-12 text-muted-foreground" />}
  title="No [entities] yet"
  description="Get started by adding your first [entity]"
  action={<Button onClick={openCreateDialog}>Add [Entity]</Button>}
/>
```

#### Empty State Guidelines

- Friendly, encouraging tone
- Clear call-to-action
- Different message for empty search results vs empty list
- Icon matching the entity type

### 7. Accessibility (WCAG 2.1 AA)

#### ARIA Patterns

```tsx
// Sortable column
<th aria-sort={sorting === 'asc' ? 'ascending' : 'descending'}>

// Form field with error
<Input
  aria-invalid={!!error}
  aria-describedby={error ? `${id}-error` : undefined}
/>
<p id={`${id}-error`} role="alert">{error}</p>

// Dialog
<Dialog aria-labelledby="dialog-title" aria-describedby="dialog-description">

// Loading state
<div aria-busy="true" aria-live="polite">
```

#### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space to activate buttons
- Escape to close dialogs
- Arrow keys in tables (optional)
- Focus trap in modals

#### Screen Reader Announcements

- Form submission success/failure
- Table sorting changes
- Filter application
- Row expansion

### 8. Responsive Design

#### Breakpoints

| Breakpoint | Table Behavior |
|------------|----------------|
| Mobile (<640px) | Card layout or horizontal scroll |
| Tablet (640-1024px) | Condensed columns, hide secondary |
| Desktop (>1024px) | Full table with all columns |

#### Mobile Patterns

- Collapsible filter panel
- Sticky action buttons
- Full-width dialogs
- Larger touch targets (44px min)

## Component Checklist

### List View

- [ ] PageHeader with title and action button
- [ ] SearchInput with debounce and URL sync
- [ ] DataTable with sorting and pagination
- [ ] Row actions (Edit, Delete)
- [ ] Loading skeleton
- [ ] Empty state with CTA
- [ ] Delete confirmation dialog

### Form Dialog

- [ ] Dialog with proper ARIA
- [ ] Form with react-hook-form + Zod
- [ ] Field validation with inline errors
- [ ] Submit button with loading state
- [ ] Cancel button that resets form
- [ ] Success toast on save
- [ ] Error handling for all cases

### Delete Flow

- [ ] Confirmation dialog (AlertDialog)
- [ ] Clear warning message
- [ ] Dependency check before delete
- [ ] Loading state during delete
- [ ] Success toast after delete
- [ ] Error toast if delete fails

## Success Criteria

- [ ] Consistent patterns across all CRUD views
- [ ] Full keyboard accessibility
- [ ] Responsive on all breakpoints
- [ ] URL state for search/filter/sort/pagination
- [ ] Clear loading and error states
- [ ] Accessible form validation
- [ ] Proper ARIA attributes throughout
