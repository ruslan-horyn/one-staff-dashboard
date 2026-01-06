# Login - Design Decisions

**Generated:** 2026-01-06
**Based on:** 01-requirements.md, User consultation

## Component Choices

### LoginForm

| Property         | Decision                            |
|------------------|-------------------------------------|
| Base components  | shadcn/ui Input, Button, Label, Card|
| Form library     | react-hook-form + zod               |
| Type             | Client Component (uses hooks)       |

**Reasoning:** Standard form pattern with react-hook-form provides validation, error handling, and form state management consistent with project conventions.

### PasswordInput

| Property  | Decision                                     |
|-----------|----------------------------------------------|
| Base      | shadcn/ui Input                              |
| Feature   | Toggle visibility button (Eye/EyeOff icons)  |
| Location  | `components/ui/password-input.tsx` (shared)  |

**Reasoning:** Password visibility toggle improves UX. Shared component enables reuse in reset-password and profile pages.

### SubmitButton

| Property  | Decision                                    |
|-----------|---------------------------------------------|
| Base      | shadcn/ui Button                            |
| Feature   | Loading state via useFormStatus             |
| Location  | `components/ui/submit-button.tsx` (shared)  |

**Reasoning:** Consistent loading pattern across all forms using React 19's useFormStatus.

## Layout Structure

### Desktop (≥768px)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    ┌─────────────────────┐                  │
│                    │   [Logo Placeholder]│                  │
│                    │   One Staff Dashboard│                 │
│                    │                     │                  │
│                    │ ┌─────────────────┐ │                  │
│                    │ │ Card            │ │                  │
│                    │ │  ┌───────────┐  │ │                  │
│                    │ │  │ Email     │  │ │                  │
│                    │ │  └───────────┘  │ │                  │
│                    │ │  ┌───────────┐  │ │                  │
│                    │ │  │ Password👁│  │ │                  │
│                    │ │  └───────────┘  │ │                  │
│                    │ │                 │ │                  │
│                    │ │  [ Login ]      │ │                  │
│                    │ │                 │ │                  │
│                    │ │  [Alert error]  │ │                  │
│                    │ └─────────────────┘ │                  │
│                    │                     │                  │
│                    │   Forgot password?  │                  │
│                    └─────────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Mobile (<768px)

Same layout, Card takes full width with padding.

### Layout Classes

```tsx
// Centered layout
<div className="min-h-screen flex items-center justify-center bg-background p-4">
  <div className="w-full max-w-sm space-y-6">
    {/* Logo + Title */}
    {/* Card with form */}
    {/* Forgot password link */}
  </div>
</div>
```

## Form Handling

### Validation Strategy

| Aspect      | Decision                                    |
|-------------|---------------------------------------------|
| Mode        | `onBlur` - validate when field loses focus  |
| ReValidate  | `onChange` - re-validate on change after error |
| Submit      | Validate all fields, show all errors        |

### Error Display

**Inline errors (validation):**
```tsx
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

**Server error (below form, inside Card):**
```tsx
{serverError && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertDescription>{serverError}</AlertDescription>
  </Alert>
)}
```

## Accessibility Implementation

| Requirement      | Implementation                           |
|------------------|------------------------------------------|
| Form name        | `<form aria-label="Login form">`         |
| Required fields  | `aria-required="true"` on inputs         |
| Invalid state    | `aria-invalid={!!error}`                 |
| Error link       | `aria-describedby="field-error"`         |
| Focus on load    | `autoFocus` on email input               |
| Loading state    | `aria-busy="true"` on form during submit |
| Password toggle  | `aria-label="Show/Hide password"`        |

### Keyboard Shortcuts

| Key       | Action                     |
|-----------|----------------------------|
| Tab       | Move to next field         |
| Shift+Tab | Move to previous field     |
| Enter     | Submit form                |

## Visual Design

### Colors (shadcn/ui theme)

| Element          | Class                              |
|------------------|------------------------------------|
| Background       | `bg-background`                    |
| Card             | `bg-card` (default Card styling)   |
| Primary button   | `bg-primary text-primary-foreground`|
| Error text       | `text-destructive`                 |
| Error alert      | `variant="destructive"`            |
| Muted text       | `text-muted-foreground`            |

### Typography

| Element        | Class                    |
|----------------|--------------------------|
| Title          | `text-2xl font-bold`     |
| Subtitle       | `text-muted-foreground`  |
| Labels         | `text-sm font-medium`    |
| Error messages | `text-sm text-destructive`|
| Link           | `text-sm text-muted-foreground hover:text-primary underline-offset-4 hover:underline` |

### Spacing

| Between            | Value      |
|--------------------|------------|
| Logo and card      | `space-y-6`|
| Card sections      | `space-y-4`|
| Label and input    | `space-y-2`|
| Button and alert   | `pt-2`     |
| Card and link      | `mt-4`     |

## Loading States

### Button Loading

```tsx
<SubmitButton className="w-full" loadingText="Signing in...">
  Sign in
</SubmitButton>
```

### Form Disabled

```tsx
<fieldset disabled={isPending} className="space-y-4">
  {/* All inputs disabled during submit */}
</fieldset>
```

## State Management

| State Type    | Solution                              |
|---------------|---------------------------------------|
| Form state    | react-hook-form                       |
| Server action | useServerAction hook                  |
| URL redirect  | searchParams.get('redirect')          |
| Global state  | None needed                           |

## Decisions Summary

| Question                  | Decision                    | Rationale                     |
|---------------------------|-----------------------------|------------------------------ |
| Card wrapper              | Yes                         | User preference               |
| Server error placement    | Below form (inside Card)    | User preference               |
| Logo/branding             | Placeholder + text title    | User preference               |
| Password toggle           | Yes                         | Standard UX pattern           |
| Dark mode                 | Supported via shadcn theme  | Built-in                      |
| Remember me checkbox      | No                          | MVP scope                     |
