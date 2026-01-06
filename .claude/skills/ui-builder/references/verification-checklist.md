# Verification Checklist

Post-implementation verification checklist for UI Builder.

## Pre-Implementation Checks

### Dependencies

```bash
# Check required packages
grep -E "react-hook-form|@hookform/resolvers|zod" package.json
grep -E "lucide-react" package.json

# Check test packages - vitest-axe is REQUIRED
grep "vitest-axe" package.json
grep -E "vitest|@testing-library" package.json

# Check shadcn/ui components
ls components/ui/
```

**Required for forms:**
- [ ] react-hook-form
- [ ] @hookform/resolvers
- [ ] zod

**Required for icons:**
- [ ] lucide-react

**Required for tests (BLOCKING - must be installed before implementation):**
- [ ] vitest
- [ ] @testing-library/react
- [ ] @testing-library/user-event
- [ ] **vitest-axe** ⚠️ REQUIRED for accessibility tests

**Optional for mocking:**
- [ ] msw (for API mocking)

⚠️ **If vitest-axe is missing:** STOP and ask user to install:
```bash
pnpm add -D vitest-axe
```

### Hooks

```bash
# Check useServerAction hook
cat hooks/useServerAction.ts
```

- [ ] useServerAction hook exists
- [ ] Hook handles success/error callbacks
- [ ] Hook exposes isPending state

## Post-Implementation Checks

### TypeScript Verification

```bash
pnpm exec tsc --noEmit
```

**Expected:** No type errors

Common issues to check:
- [ ] Props interfaces match usage
- [ ] Server Action types correct
- [ ] Form schema types align with form

### Lint Verification

**IMPORTANT:** Lint ONLY new/modified files, NOT the whole repo.

```bash
# Lint specific new files/folders
pnpm lint app/(auth)/login/
pnpm lint components/ui/password-input.tsx
```

**Expected:** No lint errors in new files

Common issues:
- [ ] Import order (React first, then external, then internal)
- [ ] Unused imports removed
- [ ] Consistent quotes and formatting

### Test Verification

**IMPORTANT:** Run tests ONLY for new test files, WITHOUT coverage by default.

```bash
# Run ONLY new test files - NO coverage
pnpm test:run app/(auth)/login/_components/LoginForm.test.tsx

# Coverage only if explicitly requested
pnpm test:run --coverage app/(auth)/login/
```

**Expected:** All new tests pass

**Rules:**
- [ ] Run only new test files
- [ ] NO coverage by default
- [ ] If tests fail → fix and re-run only failing test
- [ ] Coverage only when user explicitly asks

Test categories to verify:
- [ ] Rendering tests for all components
- [ ] Validation tests for all form fields
- [ ] Interaction tests for user actions
- [ ] Accessibility tests (vitest-axe)

## Component Checklist

### Client Components

For each Client Component:

**Structure:**
- [ ] `'use client'` directive at top
- [ ] Props interface defined
- [ ] No `React.FC` usage
- [ ] Arrow function component

**Forms:**
- [ ] useForm with zodResolver
- [ ] mode: 'onBlur' for validation
- [ ] register or Controller for fields
- [ ] handleSubmit for submission
- [ ] Error display below each field

**Accessibility:**
- [ ] Labels linked to inputs (htmlFor/id)
- [ ] aria-required on required fields
- [ ] aria-invalid on error fields
- [ ] aria-describedby linking to error message
- [ ] Form has aria-label

**Loading States:**
- [ ] Submit button disabled during pending
- [ ] Loading text/spinner shown
- [ ] Form fieldset disabled during submit

### Server Components

For each Server Component:

- [ ] No `'use client'` directive
- [ ] No hooks used
- [ ] Data fetched with await
- [ ] Error handling for data fetch
- [ ] Proper Suspense boundaries if needed

### Pages

For each page.tsx:

- [ ] Metadata export defined
- [ ] Title follows pattern: "Page | One Staff Dashboard"
- [ ] Description is meaningful
- [ ] Auth check if required
- [ ] Proper redirect on auth failure

### Loading States

For each loading.tsx:

- [ ] Skeleton matches page layout
- [ ] Uses Skeleton component from shadcn/ui
- [ ] Covers all major content areas

## File Structure Checklist

```
app/(<group>)/<view>/
├── page.tsx           ✓ Required
├── loading.tsx        ✓ Required
├── error.tsx          ○ Optional
├── not-found.tsx      ○ Optional
└── _components/
    ├── Component.tsx  ✓ Required
    └── Component.test.tsx ✓ Required
```

- [ ] page.tsx exists
- [ ] loading.tsx exists
- [ ] _components folder for view-specific components
- [ ] Test files alongside components
- [ ] Shared components in components/ui/

## Accessibility Checklist

### Keyboard Navigation

- [ ] All interactive elements reachable with Tab
- [ ] Focus order is logical
- [ ] Focus visible on all elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals

### Screen Reader

- [ ] Headings in logical order (h1 > h2 > h3)
- [ ] Form has accessible name
- [ ] Errors announced via aria-live
- [ ] Images have alt text (if any)
- [ ] Icon buttons have aria-label

### Color & Contrast

- [ ] Text contrast >= 4.5:1
- [ ] Large text contrast >= 3:1
- [ ] Focus indicator visible
- [ ] Information not conveyed by color alone

## Manual Testing Checklist

### Happy Path

1. [ ] Navigate to page
2. [ ] Fill form with valid data
3. [ ] Submit form
4. [ ] Verify success (redirect/toast)

### Error Paths

1. [ ] Submit empty form
2. [ ] Verify all validation errors show
3. [ ] Submit with invalid data
4. [ ] Verify field-specific errors
5. [ ] Submit with server error
6. [ ] Verify server error displays

### Edge Cases

1. [ ] Double-click submit
2. [ ] Submit while pending
3. [ ] Network timeout
4. [ ] Back button after submit
5. [ ] Refresh during form entry

## Report Template

After verification, generate report:

```markdown
## Implementation Report: [View Name]

**Date:** YYYY-MM-DD
**Plan:** docs/ui-sessions/[view]/

### Files Created

| File | Status |
|------|--------|
| app/(group)/view/page.tsx | ✅ |
| app/(group)/view/loading.tsx | ✅ |
| app/(group)/view/_components/Form.tsx | ✅ |
| app/(group)/view/_components/Form.test.tsx | ✅ |

### Verification Results

| Check | Status |
|-------|--------|
| TypeScript | ✅ No errors |
| Lint | ✅ Passed |
| Tests | ✅ X passed |
| Accessibility | ✅ No violations |

### Missing Dependencies

None / List any missing

### Known Issues

None / List any issues found

### Next Steps

- [ ] Manual testing at http://localhost:3000/[path]
- [ ] Code review
- [ ] Integration testing
```

## Common Issues & Solutions

### Type Errors

**Issue:** Form types don't match schema
```
Solution: Ensure z.infer<typeof schema> is used for InputType
```

**Issue:** Server Action return type mismatch
```
Solution: Check ActionResult<T> return type matches usage
```

### Test Failures

**Issue:** "Unable to find element"
```
Solution: Use findBy* for async elements, getBy* for sync
```

**Issue:** "act() warning"
```
Solution: Wrap state updates in waitFor()
```

### Accessibility Violations

**Issue:** "Form elements must have labels"
```
Solution: Add htmlFor on Label, matching id on Input
```

**Issue:** "Color contrast insufficient"
```
Solution: Use theme colors (text-foreground, text-muted-foreground)
```
