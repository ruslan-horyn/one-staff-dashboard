# TECH-003: Form Components

## Context

UI Planner task for One Staff Dashboard - a staffing agency MVP application.
Create reusable form components: DateTimePicker, PhoneInput, SearchInput, and ComboboxSelect.

**Stack:** Next.js 16, React 19, Tailwind CSS 4, shadcn/ui, react-hook-form, zod
**Existing:** shadcn form primitives (Input, Button, Popover, Calendar, Command)

## Source Files

### Primary (must read)

- `docs/ui-architecture.md` - Section 5.3 (Form components)
- `docs/prd.md` - US-007 (Assignment datetime), US-005 (Worker phone)
- `components/ui/input.tsx` - Base input
- `components/ui/popover.tsx` - Popover primitive
- `components/ui/calendar.tsx` - Calendar (if exists, or add via shadcn)

### Reference

- `docs/directory-architecture.md` - File placement
- `services/workers/schemas.ts` - Phone validation
- `services/assignments/schemas.ts` - DateTime validation
- `CLAUDE.md` - Form patterns with react-hook-form

## Tasks

### Phase 1: Requirements Analysis

1. Read `docs/ui-architecture.md` section 5.3
2. Identify all form use cases across views
3. Document validation requirements
4. List accessibility requirements

### Phase 2: Design Decisions

1. Choose date/time picker approach
2. Define phone formatting rules
3. Design search debounce behavior
4. Plan combobox async loading

### Phase 3: Implementation Plan

1. Define component interfaces
2. Specify react-hook-form integration
3. Create implementation order
4. Create testing checklist

---

## Component 1: DateTimePicker

| Property | Value |
|----------|-------|
| File | `components/ui/datetime-picker.tsx` |
| Type | Client Component |
| Purpose | Combined date and time selection |

### Props Interface

```typescript
interface DateTimePickerProps {
  value?: Date;
  onChange: (value: Date | undefined) => void;
  minDate?: Date;
  maxDate?: Date;
  minTime?: string; // "HH:MM"
  maxTime?: string; // "HH:MM"
  disabled?: boolean;
  placeholder?: string;
  clearable?: boolean;
  required?: boolean;
  error?: string;
  className?: string;
}
```

### Visual Design

**Trigger (closed):**

```
┌─────────────────────────────────────┐
│ 📅 15 Jan 2026, 14:30         [×]  │
└─────────────────────────────────────┘
```

**Popover (open):**

```
┌─────────────────────────────────────┐
│       ◀  January 2026  ▶           │
├─────────────────────────────────────┤
│ Mo Tu We Th Fr Sa Su               │
│ .. .. 01 02 03 04 05               │
│ 06 07 08 09 10 11 12               │
│ 13 14 [15] 16 17 18 19             │
│ 20 21 22 23 24 25 26               │
│ 27 28 29 30 31 .. ..               │
├─────────────────────────────────────┤
│ Time:  [14] : [30]                 │
├─────────────────────────────────────┤
│              [Clear]    [Apply]    │
└─────────────────────────────────────┘
```

### react-hook-form Integration

```tsx
<Controller
  name="startAt"
  control={control}
  render={({ field, fieldState }) => (
    <DateTimePicker
      value={field.value}
      onChange={field.onChange}
      error={fieldState.error?.message}
      minDate={new Date()}
    />
  )}
/>
```

---

## Component 2: PhoneInput

| Property | Value |
|----------|-------|
| File | `components/ui/phone-input.tsx` |
| Type | Client Component |
| Purpose | Phone number with auto-formatting |

### Props Interface

```typescript
interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: string;
  onChange: (value: string) => void;
  format?: 'PL' | 'international';
  error?: string;
}
```

### Formatting Rules

| Format | Input | Display | Stored |
|--------|-------|---------|--------|
| PL | 123456789 | 123 456 789 | 123456789 |
| PL | +48123456789 | +48 123 456 789 | +48123456789 |
| International | +1234567890 | +1 234 567 890 | +1234567890 |

### Behavior

- Auto-format as user types
- Strip non-digits on blur (store normalized)
- Accept paste with any format
- Show formatted in display
- Return normalized on change

### react-hook-form Integration

```tsx
<Controller
  name="phone"
  control={control}
  render={({ field, fieldState }) => (
    <PhoneInput
      value={field.value}
      onChange={field.onChange}
      error={fieldState.error?.message}
      placeholder="123 456 789"
    />
  )}
/>
```

---

## Component 3: SearchInput

| Property | Value |
|----------|-------|
| File | `components/ui/search-input.tsx` |
| Type | Client Component |
| Purpose | Debounced search with URL sync |

### Props Interface

```typescript
interface SearchInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number; // default: 300
  isLoading?: boolean;
  syncWithUrl?: boolean;
  urlParam?: string; // default: 'search'
  className?: string;
}
```

### Visual States

**Empty:**

```
┌─────────────────────────────────────┐
│ 🔍 Search workers...               │
└─────────────────────────────────────┘
```

**With value:**

```
┌─────────────────────────────────────┐
│ 🔍 John Doe                    [×] │
└─────────────────────────────────────┘
```

**Loading:**

```
┌─────────────────────────────────────┐
│ 🔍 John Doe                    [⟳] │
└─────────────────────────────────────┘
```

### URL Sync Behavior

```typescript
// With syncWithUrl={true}
// Typing "john" updates URL: ?search=john
// URL change updates input value
// Clear button removes param from URL
```

### Hook: useSearchInput

```typescript
// hooks/useSearchInput.ts
interface UseSearchInputOptions {
  defaultValue?: string;
  debounceMs?: number;
  syncWithUrl?: boolean;
  urlParam?: string;
  onSearch?: (value: string) => void;
}

interface UseSearchInputReturn {
  value: string;
  debouncedValue: string;
  onChange: (value: string) => void;
  clear: () => void;
  isDebouncing: boolean;
}
```

---

## Component 4: ComboboxSelect

| Property | Value |
|----------|-------|
| File | `components/ui/combobox-select.tsx` |
| Type | Client Component |
| Purpose | Searchable select with async support |

### Props Interface

```typescript
interface ComboboxSelectProps<T> {
  // Value
  value?: T;
  onChange: (value: T | undefined) => void;

  // Options
  options: T[];
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  getOptionDisabled?: (option: T) => boolean;

  // Search
  searchable?: boolean;
  onSearch?: (query: string) => void;
  isLoading?: boolean;

  // Async
  async?: boolean;
  loadOptions?: (query: string) => Promise<T[]>;

  // Multiple
  multiple?: boolean;

  // Create new
  creatable?: boolean;
  onCreate?: (value: string) => void;
  createLabel?: (value: string) => string; // default: "Create {value}"

  // UI
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
}
```

### Visual Design

**Closed:**

```
┌─────────────────────────────────────┐
│ Select client...              [▾]  │
└─────────────────────────────────────┘
```

**Open with search:**

```
┌─────────────────────────────────────┐
│ 🔍 Search...                       │
├─────────────────────────────────────┤
│   Acme Corporation                 │
│ ✓ Beta Industries                  │
│   Gamma Ltd                        │
├─────────────────────────────────────┤
│ + Create "Delta Corp"              │
└─────────────────────────────────────┘
```

**Multiple selected:**

```
┌─────────────────────────────────────┐
│ [Acme ×] [Beta ×]            [▾]  │
└─────────────────────────────────────┘
```

### react-hook-form Integration

```tsx
<Controller
  name="clientId"
  control={control}
  render={({ field, fieldState }) => (
    <ComboboxSelect
      value={clients.find(c => c.id === field.value)}
      onChange={(client) => field.onChange(client?.id)}
      options={clients}
      getOptionLabel={(c) => c.name}
      getOptionValue={(c) => c.id}
      error={fieldState.error?.message}
      placeholder="Select client"
    />
  )}
/>
```

---

## Accessibility Requirements

### All Components

- Full keyboard navigation
- Visible focus states
- ARIA labels and descriptions
- Error announcements via aria-live

### DateTimePicker

- `role="dialog"` on popover
- Arrow keys for calendar navigation
- Tab between date/time sections
- Escape to close

### PhoneInput

- `type="tel"` for mobile keyboards
- `inputmode="numeric"`
- Format hint via aria-describedby

### SearchInput

- `role="searchbox"`
- `aria-busy` during loading
- Clear button: `aria-label="Clear search"`

### ComboboxSelect

- `role="combobox"` on trigger
- `role="listbox"` on options
- `aria-expanded`, `aria-activedescendant`
- Arrow keys for option navigation
- Home/End for first/last

## Dependencies

```bash
# Check if installed, add if missing
pnpm add date-fns  # for date formatting
# shadcn components (if not added)
npx shadcn@latest add calendar
npx shadcn@latest add command
npx shadcn@latest add popover
```

## Output Format

Generate 3 files in `docs/ui-sessions/form-components/`:

1. `01-requirements.md` - All 4 components, use cases, validation
2. `02-design-decisions.md` - Visual specs, interaction patterns
3. `03-implementation-plan.md` - Code specs, tests, implementation order

## Success Criteria

- [ ] DateTimePicker returns valid Date object
- [ ] PhoneInput formats correctly for PL numbers
- [ ] SearchInput debounces and syncs with URL
- [ ] ComboboxSelect supports sync and async options
- [ ] All integrate with react-hook-form Controller
- [ ] All have error state display
- [ ] Full keyboard accessibility
- [ ] Unit tests for each component
