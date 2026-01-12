# Password Reset - Implementation Plan

## File Structure

```
app/
├── (auth)/
│   ├── forgot-password/
│   │   ├── page.tsx                    # Server component - page
│   │   └── _components/
│   │       └── ForgotPasswordForm.tsx  # Client component - form
│   │   └── _hooks/
│   │       ├── useForgotPasswordForm.ts
│   │       └── useForgotPasswordServerAction.ts
│   ├── reset-password/
│   │   ├── page.tsx                    # Server component - page
│   │   └── _components/
│   │       └── ResetPasswordForm.tsx   # Client component - form
│   │   └── _hooks/
│   │       ├── useResetPasswordForm.ts
│   │       └── useResetPasswordServerAction.ts
│   └── login/
│       └── _components/
│           └── LoginForm.tsx           # MODIFY: Add forgot-password link
├── auth/
│   └── callback/
│       └── route.ts                    # NEW: Auth callback handler

services/
└── auth/
    └── schemas.ts                      # MODIFY: Add resetPasswordFormSchema
```

---

## Implementation Order

### Phase 1: Infrastructure (Backend)

1. [ ] **Create auth callback route** - `/app/auth/callback/route.ts`
   - Handle Supabase token exchange for password recovery
   - Redirect to appropriate page based on `type` parameter

2. [ ] **Add form schema** - `/services/auth/schemas.ts`
   - Add `resetPasswordFormSchema` with password confirmation

### Phase 2: Forgot Password View

1. [ ] **Create forgot-password page** - `/app/(auth)/forgot-password/page.tsx`
   - Server component
   - Check auth state, redirect if logged in
   - Handle `error` query param for expired token message

2. [ ] **Create form hooks** - `/app/(auth)/forgot-password/_hooks/`
   - `useForgotPasswordForm.ts` - react-hook-form setup
   - `useForgotPasswordServerAction.ts` - server action wrapper

3. [ ] **Create ForgotPasswordForm** - `/app/(auth)/forgot-password/_components/ForgotPasswordForm.tsx`
   - Email input with validation
   - Success/error message display
   - Loading state handling

### Phase 3: Reset Password View

1. [ ] **Create reset-password page** - `/app/(auth)/reset-password/page.tsx`
   - Server component
   - Check auth state, redirect if NOT logged in (no session = invalid token)

2. [ ] **Create form hooks** - `/app/(auth)/reset-password/_hooks/`
   - `useResetPasswordForm.ts` - react-hook-form setup
   - `useResetPasswordServerAction.ts` - server action wrapper with redirect

3. [ ] **Create ResetPasswordForm** - `/app/(auth)/reset-password/_components/ResetPasswordForm.tsx`
   - Password + confirm password inputs
   - Error message display
   - Loading state handling
   - Success toast before redirect

### Phase 4: Integration

1. [ ] **Update LoginForm** - Add "Forgot password?" link
   - Add link below password field or in card footer

2. [ ] **Verify Supabase configuration**
    - Check email templates
    - Verify redirect URLs in project settings

### Phase 5: Testing

1. [ ] **Unit tests** for form components
2. [ ] **Integration test** for full password reset flow

---

## Component Specifications

### Auth Callback Route

- **File:** `/app/auth/callback/route.ts`
- **Type:** Route Handler (GET)
- **Dependencies:**
  - `@/lib/supabase/server` - Supabase client
  - `@/services/shared` - `ActionResult`, `success`, `failure`, `mapAuthError`, `ErrorCodes`
  - `next/server` - `NextRequest`, `NextResponse`

**Design Principles:**

- **SOLID: Single Responsibility** - każda funkcja ma jedno zadanie
- **Reuse existing helpers** - wykorzystuje `ActionResult` i `mapAuthError` z `services/shared`
- **Supports both flows** - PKCE (`code`) i Email OTP (`token_hash`)

```typescript
// /app/auth/callback/route.ts
// SOLID: Single Responsibility - każda funkcja ma jedno zadanie
// Reuses existing helpers from services/shared

import { type NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import {
  type ActionResult,
  success,
  failure,
  mapAuthError,
  ErrorCodes,
} from '@/services/shared';

// =============================================================================
// TYPES
// =============================================================================

type OtpType = 'recovery' | 'email' | 'signup' | 'invite';

// =============================================================================
// AUTH HANDLERS (Single Responsibility)
// Reuse ActionResult from services/shared/result.ts
// =============================================================================

/**
 * Handle PKCE code exchange (OAuth-style flow)
 * Used when Supabase sends ?code=xxx parameter
 */
async function handleCodeExchange(code: string): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Reuse mapAuthError from services/shared/errors.ts
    const mappedError = mapAuthError(error);
    return failure(mappedError.code, mappedError.message, mappedError.details);
  }

  return success(undefined);
}

/**
 * Handle OTP token verification (email magic link flow)
 * Used when Supabase sends ?token_hash=xxx&type=xxx parameters
 */
async function handleTokenVerification(
  tokenHash: string,
  type: OtpType
): Promise<ActionResult<void>> {
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    // Reuse mapAuthError - handles otp_expired, bad_jwt, etc.
    const mappedError = mapAuthError(error);
    return failure(mappedError.code, mappedError.message, mappedError.details);
  }

  return success(undefined);
}

// =============================================================================
// REDIRECT HELPERS (Single Responsibility)
// =============================================================================

/**
 * Validate and sanitize the next parameter to prevent open redirect attacks
 */
function sanitizeNextParam(next: string | null): string {
  if (!next) return '/';
  // Only allow relative paths starting with /
  return next.startsWith('/') ? next : '/';
}

/**
 * Determine success redirect URL based on auth type
 */
function getSuccessRedirectUrl(
  origin: string,
  type: string | null,
  next: string
): string {
  // Password recovery always goes to reset-password page
  if (type === 'recovery') {
    return `${origin}/reset-password`;
  }
  // Email confirmation or other types use the next parameter
  return `${origin}${next}`;
}

/**
 * Create error redirect URL with error code from ErrorCodes
 */
function getErrorRedirectUrl(origin: string, errorCode: string): string {
  return `${origin}/forgot-password?error=${encodeURIComponent(errorCode)}`;
}

// =============================================================================
// MAIN ROUTE HANDLER
// =============================================================================

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // Extract all possible parameters
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as OtpType | null;
  const next = sanitizeNextParam(searchParams.get('next'));

  // Strategy 1: PKCE code exchange (higher priority)
  if (code) {
    const result = await handleCodeExchange(code);

    if (result.success) {
      return NextResponse.redirect(getSuccessRedirectUrl(origin, type, next));
    }

    // Use error code from result (mapped by mapAuthError)
    return NextResponse.redirect(getErrorRedirectUrl(origin, result.error.code));
  }

  // Strategy 2: Token hash verification (email OTP flow)
  if (tokenHash && type) {
    const result = await handleTokenVerification(tokenHash, type);

    if (result.success) {
      return NextResponse.redirect(getSuccessRedirectUrl(origin, type, next));
    }

    // Use error code from result (e.g., SESSION_EXPIRED for otp_expired)
    return NextResponse.redirect(getErrorRedirectUrl(origin, result.error.code));
  }

  // No valid auth parameters provided
  return NextResponse.redirect(
    getErrorRedirectUrl(origin, ErrorCodes.VALIDATION_ERROR)
  );
}
```

**SOLID Principles Applied:**

| Zasada | Zastosowanie |
|--------|-------------|
| **S** - Single Responsibility | `handleCodeExchange` - tylko wymiana kodu; `handleTokenVerification` - tylko weryfikacja tokenu; `mapAuthError` - tylko mapowanie błędów |
| **O** - Open/Closed | Łatwo dodać nowe typy auth (np. `type === 'invite'`) bez modyfikacji istniejących funkcji |
| **L** - Liskov Substitution | Obie funkcje auth zwracają `ActionResult<void>` - można je używać zamiennie |
| **I** - Interface Segregation | Używamy istniejącego `ActionResult` zamiast tworzenia nowego typu |
| **D** - Dependency Inversion | Handler zależy od abstrakcji (`ActionResult`, `mapAuthError`), nie od szczegółów Supabase |

---

### ForgotPasswordForm

- **File:** `/app/(auth)/forgot-password/_components/ForgotPasswordForm.tsx`
- **Type:** Client Component
- **Props:** None

```typescript
'use client';

interface ForgotPasswordFormProps {
  initialError?: string | null;
}
```

- **Dependencies:**
  - `@/components/ui/form` - Form, FormField, FormItem, FormLabel, FormControl, FormMessage
  - `@/components/ui/input` - Input
  - `@/components/ui/submit-button` - SubmitButton
  - `@/components/ui/alert` - Alert, AlertDescription
  - `@/components/ui/card` - CardContent, CardFooter
  - `lucide-react` - Mail, CheckCircle2, AlertCircle
  - `next/link` - Link
  - Local hooks

- **State:**
  - `showSuccess` - boolean, shows success message after submission
  - Form state via react-hook-form

- **Notes:**
  - Always show success after submission (email enumeration prevention)
  - Show error only for rate limiting or validation errors
  - Display initial error if `error` query param present (expired token)

---

### ResetPasswordForm

- **File:** `/app/(auth)/reset-password/_components/ResetPasswordForm.tsx`
- **Type:** Client Component
- **Props:** None

```typescript
'use client';
```

- **Dependencies:**
  - `@/components/ui/form` - Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription
  - `@/components/ui/password-input` - PasswordInput
  - `@/components/ui/submit-button` - SubmitButton
  - `@/components/ui/alert` - Alert, AlertDescription
  - `@/components/ui/card` - CardContent
  - `lucide-react` - AlertCircle
  - `sonner` - toast
  - Local hooks

- **State:**
  - Form state via react-hook-form

- **Notes:**
  - Two password fields (new + confirm)
  - Shows password requirements as FormDescription
  - Toast notification on success before redirect
  - Handles session expiry gracefully

---

### useForgotPasswordForm

- **File:** `/app/(auth)/forgot-password/_hooks/useForgotPasswordForm.ts`
- **Type:** Custom Hook

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput } from '@/services/auth/schemas';

export const useForgotPasswordForm = () => {
  return useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  });
};
```

---

### useForgotPasswordServerAction

- **File:** `/app/(auth)/forgot-password/_hooks/useForgotPasswordServerAction.ts`
- **Type:** Custom Hook

```typescript
import { useServerAction } from '@/hooks/useServerAction';
import { resetPassword } from '@/services/auth/actions';

interface UseForgotPasswordServerActionOptions {
  onSuccess?: () => void;
}

export const useForgotPasswordServerAction = ({
  onSuccess,
}: UseForgotPasswordServerActionOptions = {}) => {
  return useServerAction(resetPassword, {
    onSuccess: () => {
      onSuccess?.();
    },
  });
};
```

---

### useResetPasswordForm

- **File:** `/app/(auth)/reset-password/_hooks/useResetPasswordForm.ts`
- **Type:** Custom Hook

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordFormSchema, type ResetPasswordFormInput } from '@/services/auth/schemas';

export const useResetPasswordForm = () => {
  return useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });
};
```

---

### useResetPasswordServerAction

- **File:** `/app/(auth)/reset-password/_hooks/useResetPasswordServerAction.ts`
- **Type:** Custom Hook

```typescript
import { useRouter } from 'next/navigation';
import { useServerAction } from '@/hooks/useServerAction';
import { updatePassword } from '@/services/auth/actions';
import { toast } from 'sonner';

export const useResetPasswordServerAction = () => {
  const router = useRouter();

  return useServerAction(updatePassword, {
    onSuccess: () => {
      toast.success('Password updated successfully. Please sign in with your new password.');
      router.push('/login');
    },
  });
};
```

---

## Schema Addition

### resetPasswordFormSchema

- **File:** `/services/auth/schemas.ts`
- **Addition:**

```typescript
// Add to existing schemas.ts

export const resetPasswordFormSchema = z
  .object({
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;
```

---

## Server Actions

| Action | File | Input Schema | Return Type | Status |
|--------|------|--------------|-------------|--------|
| `resetPassword` | `/services/auth/actions.ts` | `resetPasswordSchema` | `{ success: boolean }` | Existing |
| `updatePassword` | `/services/auth/actions.ts` | `updatePasswordSchema` | `{ success: boolean }` | Existing |

### Required Modification: Add `redirectTo` to `resetPassword`

**File:** `/services/auth/actions.ts`

The `resetPassword` action must pass `redirectTo` to Supabase to control where the user is redirected after clicking the reset link:

```typescript
// Current implementation (missing redirectTo):
const { error } = await supabase.auth.resetPasswordForEmail(input.email);

// Updated implementation (with redirectTo):
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
  redirectTo: `${siteUrl}/auth/callback`,
});
```

**Why this is important:**

- Without `redirectTo`, Supabase uses the default URL from project settings
- With `redirectTo`, we control exactly where the user lands after clicking the email link
- The callback route then handles token exchange and redirects to `/reset-password`

---

## Page Components

### Forgot Password Page

- **File:** `/app/(auth)/forgot-password/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getSession } from '@/services/shared';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ForgotPasswordForm } from './_components/ForgotPasswordForm';

export const metadata = {
  title: 'Forgot Password - One Staff Dashboard',
  description: 'Reset your password',
};

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const session = await getSession();

  if (session) {
    redirect('/');
  }

  const { error } = await searchParams;

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Forgot password?</CardTitle>
        <CardDescription>
          Enter your email address and we'll send you a link to reset your password.
        </CardDescription>
      </CardHeader>
      <ForgotPasswordForm initialError={error} />
    </Card>
  );
}
```

---

### Reset Password Page

- **File:** `/app/(auth)/reset-password/page.tsx`

```typescript
import { redirect } from 'next/navigation';
import { getSession } from '@/services/shared';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ResetPasswordForm } from './_components/ResetPasswordForm';

export const metadata = {
  title: 'Set New Password - One Staff Dashboard',
  description: 'Set your new password',
};

export default async function ResetPasswordPage() {
  const session = await getSession();

  // User must be authenticated via recovery token
  if (!session) {
    redirect('/forgot-password?error=session_expired');
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>Set new password</CardTitle>
        <CardDescription>
          Enter your new password below.
        </CardDescription>
      </CardHeader>
      <ResetPasswordForm />
    </Card>
  );
}
```

---

## LoginForm Modification

Add link to forgot-password in the existing LoginForm:

```tsx
// In LoginForm.tsx, add after password field or in a separate section:

<div className="flex items-center justify-end">
  <Link
    href="/forgot-password"
    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
  >
    Forgot password?
  </Link>
</div>
```

---

## Testing Checklist

### Unit Tests

- [ ] `ForgotPasswordForm.test.tsx`
  - Renders email input and submit button
  - Shows validation error for invalid email
  - Shows success message after submission
  - Shows error message for rate limiting
  - Clears error on input change
  - Disables form during submission

- [ ] `ResetPasswordForm.test.tsx`
  - Renders password and confirm password inputs
  - Shows validation error for short password
  - Shows validation error for mismatched passwords
  - Shows server error in alert
  - Disables form during submission
  - Calls router.push after success

### Integration Tests (E2E - Playwright)

- [ ] Full password reset flow
  - Navigate to /login
  - Click "Forgot password?" link
  - Enter email and submit
  - Verify success message shown
  - (Manual: Check email, click link)
  - Verify redirect to /reset-password
  - Enter new password and confirm
  - Submit and verify redirect to /login

### Accessibility Tests

- [ ] Keyboard navigation through forms
- [ ] Screen reader announces errors
- [ ] Focus management on page load
- [ ] Color contrast for success/error messages

---

## Required Configuration

### Environment Variables

Add to `.env.local` (and `.env.example`):

```bash
# Site URL for auth redirects
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Note:** This variable is used by `resetPassword` action to construct the callback URL.

### Supabase Configuration

#### Local Development (already configured in `supabase/config.toml`)

```toml
[auth]
site_url = "http://127.0.0.1:3000"
additional_redirect_urls = ["https://127.0.0.1:3000"]
```

#### Production (Supabase Dashboard)

1. Go to **Authentication** → **URL Configuration**
2. Add your production URL to **Site URL**
3. Add `/auth/callback` path to **Redirect URLs**:
   - `https://your-domain.com/auth/callback`

---

## Verification Steps

After implementation, verify:

1. **Forgot Password Flow:**
   - [ ] Navigate to `/forgot-password`
   - [ ] Submit valid email → success message shown
   - [ ] Submit invalid email → validation error shown
   - [ ] Click "Back to login" → navigates to `/login`

2. **Auth Callback:**
   - [ ] Supabase sends email with correct callback URL
   - [ ] Clicking link exchanges token and creates session
   - [ ] Invalid/expired token shows error message

3. **Reset Password Flow:**
   - [ ] `/reset-password` accessible only with valid session
   - [ ] Password validation works (min 8 chars)
   - [ ] Password confirmation validation works
   - [ ] Success toast shown and redirect to `/login`

4. **Login Integration:**
   - [ ] "Forgot password?" link visible on login page
   - [ ] Link navigates to `/forgot-password`

5. **Security:**
   - [ ] Email enumeration prevented (always success message)
   - [ ] Rate limiting message shown when applicable
   - [ ] Session required for password update
