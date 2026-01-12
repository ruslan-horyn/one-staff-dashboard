# Password Reset - Design Decisions

## Component Choices

### ForgotPasswordForm

- **shadcn/ui base:** Form, Input, Button (via SubmitButton)
- **Reasoning:** Consistent with existing LoginForm pattern
- **Customizations:** None needed, uses existing components

### ResetPasswordForm

- **shadcn/ui base:** Form, PasswordInput, Button (via SubmitButton)
- **Reasoning:** Consistent with existing LoginForm pattern
- **Customizations:** Add password confirmation field

### Success Message Display

- **shadcn/ui base:** Alert (default variant, not destructive)
- **Reasoning:** Inline message is more visible than toast for important confirmations
- **Customizations:** Green/success styling via custom variant or Tailwind classes

---

## Layout Structure

### Both Views - Consistent with Login Page

```
┌─────────────────────────────────────────────────┐
│                                                 │
│              ┌─────────────────┐                │
│              │     Card        │                │
│              │  ┌───────────┐  │                │
│              │  │  Header   │  │                │
│              │  │  Title    │  │                │
│              │  │  Desc     │  │                │
│              │  └───────────┘  │                │
│              │  ┌───────────┐  │                │
│              │  │  Content  │  │                │
│              │  │  Form     │  │                │
│              │  │  Fields   │  │                │
│              │  │  Submit   │  │                │
│              │  └───────────┘  │                │
│              │  ┌───────────┐  │                │
│              │  │  Footer   │  │                │
│              │  │  Links    │  │                │
│              │  └───────────┘  │                │
│              └─────────────────┘                │
│                                                 │
└─────────────────────────────────────────────────┘
```

- **Desktop:** Centered card, max-w-sm (same as login)
- **Tablet:** Same as desktop
- **Mobile:** Full width with padding (p-4)

---

## Form Handling

### Library
- `react-hook-form` + `zod` via `@hookform/resolvers/zod`
- Same pattern as LoginForm

### Validation

**Forgot Password:**
| Field | Validation | Error Message |
|-------|------------|---------------|
| email | `z.email()` | "Invalid email format" |

**Reset Password:**
| Field | Validation | Error Message |
|-------|------------|---------------|
| newPassword | `z.string().min(8)` | "Password must be at least 8 characters" |
| confirmPassword | `z.string()` + `.refine()` | "Passwords do not match" |

### Extended Schema for Reset Password

```typescript
export const resetPasswordFormSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});
```

### Error Display
- Field-level errors via `FormMessage` component
- Server errors via `Alert` component (destructive variant)
- Success messages via `Alert` component (default variant with success styling)

### Loading States
- Fieldset `disabled` during submission
- SubmitButton shows loading text and spinner

---

## Accessibility Implementation

| Requirement | Implementation |
|-------------|----------------|
| Form labels | `FormLabel` component with `htmlFor` association |
| Error announcements | `FormMessage` with `role="alert"` implicit |
| Invalid state | `aria-invalid="true"` via FormControl |
| Description linking | `aria-describedby` via FormControl |
| Focus management | `autoFocus` on first input |
| Keyboard navigation | Native form behavior, Enter to submit |
| Password toggle | `aria-label` on toggle button |
| Success announcement | Alert with `role="alert"` |

---

## State Management

### URL State
- None required for these views

### Local State (React useState)
- `showSuccess` - boolean, show success message after forgot-password submission
- Form state managed by react-hook-form

### Server State
- Session state managed by Supabase Auth
- No additional global state needed

---

## Color/Visual Decisions

### Success Alert Styling

Since shadcn/ui Alert only has `default` and `destructive` variants, use custom styling:

```tsx
<Alert className="border-green-500 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950 dark:text-green-100">
  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
  <AlertDescription>
    Check your email for a password reset link.
  </AlertDescription>
</Alert>
```

Or add a new variant to Alert component if this pattern will be reused.

### Links Styling

Use `text-sm text-muted-foreground` with `underline-offset-4 hover:underline` for secondary links (consistent with login page pattern).

---

## Messages Content

### Forgot Password View

| State | Message |
|-------|---------|
| Title | "Forgot password?" |
| Description | "Enter your email address and we'll send you a link to reset your password." |
| Success | "Check your email for a password reset link. If you don't see it, check your spam folder." |
| Rate limited | "Too many requests. Please wait a few minutes and try again." |

### Reset Password View

| State | Message |
|-------|---------|
| Title | "Set new password" |
| Description | "Enter your new password below." |
| Password hint | "Password must be at least 8 characters." |
| Success (toast) | "Password updated successfully. Please sign in with your new password." |
| Token expired | "This password reset link has expired. Please request a new one." |

---

## Navigation Links

### Forgot Password Page

```tsx
<CardFooter className="flex justify-center">
  <Link
    href="/login"
    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
  >
    Back to login
  </Link>
</CardFooter>
```

### Login Page (addition needed)

```tsx
<Link
  href="/forgot-password"
  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
>
  Forgot password?
</Link>
```

---

## Auth Callback Handling

### Supabase Password Recovery Flow

1. User requests reset → Supabase sends email with link
2. Link format: `{SITE_URL}/auth/callback?token_hash=xxx&type=recovery`
3. Callback route exchanges token for session
4. User redirected to `/reset-password` with active session

### Auth Callback Route Implementation

Create `/app/auth/callback/route.ts`:

```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const next = searchParams.get('next') ?? '/';

  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type: type as 'recovery' | 'email',
      token_hash,
    });

    if (!error) {
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Error: redirect to forgot-password with error
  return NextResponse.redirect(`${origin}/forgot-password?error=invalid_token`);
}
```

---

## Error Handling Strategy

### Forgot Password Errors

| Error Code | User Message | Action |
|------------|--------------|--------|
| `VALIDATION_ERROR` | Show field error | Inline validation |
| `over_request_rate_limit` | "Too many requests..." | Show alert |
| Any other | Still show success | Security: don't reveal if email exists |

### Reset Password Errors

| Error Code | User Message | Action |
|------------|--------------|--------|
| `VALIDATION_ERROR` | Show field error | Inline validation |
| `NOT_AUTHENTICATED` | "Session expired..." | Redirect to forgot-password |
| `weak_password` | "Password too weak..." | Show alert |
| Any other | "Something went wrong..." | Show alert |

---

## Open Questions - Resolved

### 1. Password Confirmation Field
**Decision:** YES - Include confirmation field
- Prevents typos when setting new password
- Users expect this pattern for password changes
- Minor additional complexity is worth the UX improvement

### 2. Success Message Display
**Decision:** Inline Alert (not toast) for forgot-password
- More visible and persistent
- User clearly sees next steps
- Toast for reset-password success (before redirect)

### 3. Auth Callback Route
**Decision:** Create `/app/auth/callback/route.ts`
- Handles password recovery token exchange
- Also usable for email confirmation in future
