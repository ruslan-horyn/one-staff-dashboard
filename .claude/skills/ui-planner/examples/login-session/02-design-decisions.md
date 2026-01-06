# Login - Design Decisions

**Generated:** 2024-01-15
**Based on:** 01-requirements.md

## Component Choices

### LoginForm

| Property | Decision |
|----------|----------|
| **Base components** | shadcn/ui Input, Button, Label |
| **Form library** | react-hook-form + zod |
| **Type** | Client Component (uses hooks) |

**Reasoning:** Standard form pattern with react-hook-form provides validation, error handling, and form state management.

### PasswordInput

| Property | Decision |
|----------|----------|
| **Base** | shadcn/ui Input |
| **Feature** | Toggle visibility button |
| **Location** | `components/ui/password-input.tsx` (reusable) |

**Reasoning:** Password visibility toggle improves UX. Making it a shared component allows reuse in reset password and profile pages.

### SubmitButton

| Property | Decision |
|----------|----------|
| **Base** | shadcn/ui Button |
| **Feature** | Loading state via useFormStatus |
| **Location** | `components/ui/submit-button.tsx` (reusable) |

**Reasoning:** Consistent loading pattern across all forms. Uses React 19's useFormStatus for automatic pending detection.

## Layout Structure

### Desktop (≥768px)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ┌─────────────────────┐                  │
│                    │   One Staff Logo    │                  │
│                    │                     │                  │
│                    │   ┌─────────────┐   │                  │
│                    │   │ Email       │   │                  │
│                    │   └─────────────┘   │                  │
│                    │   ┌─────────────┐   │                  │
│                    │   │ Password 👁 │   │                  │
│                    │   └─────────────┘   │                  │
│                    │                     │                  │
│                    │   [    Login    ]   │                  │
│                    │                     │                  │
│                    │   Forgot password?  │                  │
│                    └─────────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (<768px)

```
┌─────────────────────┐
│                     │
│   One Staff Logo    │
│                     │
│   ┌─────────────┐   │
│   │ Email       │   │
│   └─────────────┘   │
│   ┌─────────────┐   │
│   │ Password  👁 │   │
│   └─────────────┘   │
│                     │
│   [    Login    ]   │
│                     │
│   Forgot password?  │
│                     │
└─────────────────────┘
```

**Layout classes:**
```tsx
// Centered card layout
<div className="min-h-screen flex items-center justify-center p-4">
  <div className="w-full max-w-sm">
    {/* Login form */}
  </div>
</div>
```

## Form Handling

### Validation Schema

```typescript
const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  password: z.string()
    .min(1, 'Password is required'),
});
```

### Validation Strategy

| Aspect | Decision |
|--------|----------|
| **Mode** | `onBlur` - validate when field loses focus |
| **ReValidate** | `onChange` - re-validate on change after error |
| **Submit** | Validate all fields, show all errors |

### Error Display

```tsx
// Inline error below field
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <p id="email-error" className="text-sm text-destructive">
      {errors.email.message}
    </p>
  )}
</div>
```

### Server Error Display

```tsx
// Above form or below submit button
{serverError && (
  <div
    role="alert"
    aria-live="polite"
    className="p-3 text-sm text-destructive bg-destructive/10 rounded-md"
  >
    {serverError}
  </div>
)}
```

## Accessibility Implementation

| Requirement | Implementation |
|-------------|----------------|
| Form name | `<form aria-label="Login form">` |
| Required fields | `aria-required="true"` on inputs |
| Invalid state | `aria-invalid={!!error}` |
| Error link | `aria-describedby="field-error"` |
| Focus on error | Focus first invalid field on submit |
| Loading state | `aria-busy="true"` on form during submit |
| Password toggle | `aria-label="Show password"` / `"Hide password"` |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Tab | Move to next field |
| Shift+Tab | Move to previous field |
| Enter | Submit form |
| Space | Toggle password visibility (when focused) |

## State Management

### Form State

- **Library:** react-hook-form
- **Resolver:** @hookform/resolvers/zod

### Server Action State

- **Hook:** useServerAction (custom)
- **States:** isPending, isError, error, data

### No Global State Needed

Login is a single-page flow with no cross-component state requirements.

## Visual Design

### Colors (from Tailwind/shadcn theme)

| Element | Class |
|---------|-------|
| Background | `bg-background` |
| Card | `bg-card` (if using card wrapper) |
| Primary button | `bg-primary text-primary-foreground` |
| Error text | `text-destructive` |
| Error background | `bg-destructive/10` |

### Typography

| Element | Class |
|---------|-------|
| Page title | `text-2xl font-bold` |
| Labels | `text-sm font-medium` |
| Error messages | `text-sm text-destructive` |
| Link | `text-sm text-muted-foreground hover:text-primary` |

### Spacing

| Between | Value |
|---------|-------|
| Form fields | `space-y-4` |
| Label and input | `space-y-2` |
| Form and button | `pt-2` |
| Button and link | `pt-4` |

## Loading States

### Button Loading

```tsx
<SubmitButton>
  {isPending ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Logging in...
    </>
  ) : (
    'Login'
  )}
</SubmitButton>
```

### Form Disabled

```tsx
<fieldset disabled={isPending}>
  {/* All inputs disabled during submit */}
</fieldset>
```

## Open Questions - Resolved

| Question | Decision | Rationale |
|----------|----------|-----------|
| Card wrapper? | No | Simpler design, card adds visual noise |
| Logo placement | Above form | Standard pattern |
| Dark mode support | Yes | Via shadcn/ui theming |
| Animation on error | Subtle shake | Improves feedback |