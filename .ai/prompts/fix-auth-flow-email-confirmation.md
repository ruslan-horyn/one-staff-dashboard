# Fix Auth Flow Email Confirmation Problems

## Context

Expert Next.js/Supabase developer fixing authentication flow issues in One Staff Dashboard.

**Tech Stack:**
- Next.js 16 (App Router)
- Supabase Auth (email/password)
- React Hook Form + Zod
- Server Actions with `createAction()` wrapper

**Critical Environment Difference:**
- **Local:** Supabase autoconfirm enabled - user logged in immediately after signup
- **Production:** Email confirmation REQUIRED - `session` is `null` after signup until email verified

## Problems to Fix

| # | Problem | Location | Impact |
|---|---------|----------|--------|
| 1 | No message after registration | `useSignUpServerAction.ts:17-21` | User redirected to login without info about email confirmation |
| 2 | Wrong error redirect destination | `callback/route.ts:84-86` | All errors go to `/forgot-password` even signup errors |
| 3 | Login page ignores URL params | `login/page.tsx:20-22` | Error and success messages from URL not displayed |
| 4 | No success message after email verification | `callback/route.ts:70-78` | User verified but sees no confirmation |

## Source Files

### Must Modify
- `app/(auth)/register/_hooks/useSignUpServerAction.ts` - handle session=null case
- `app/auth/callback/route.ts` - fix error redirects, add message params
- `app/(auth)/login/page.tsx` - parse message/error from URL
- `app/(auth)/login/_components/LoginForm.tsx` - display messages from props

### Reference (patterns to follow)
- `app/(auth)/forgot-password/page.tsx` - example of parsing URL error param
- `app/(auth)/forgot-password/_components/ForgotPasswordForm.tsx` - example of displaying errors/success
- `hooks/useServerAction.ts` - understand how onSuccess receives data
- `types/auth.ts` - AuthResponse type with session: Session | null
- `services/shared/errors.ts` - ErrorCodes constants

## Tasks

### Phase 1: Fix useSignUpServerAction

**File:** `app/(auth)/register/_hooks/useSignUpServerAction.ts`

**Current code (broken):**
```typescript
return useServerAction(signUp, {
    onSuccess: () => {
        onSuccess?.();
        router.refresh();
        router.push('/');  // Always redirects to '/' - wrong!
    },
});
```

**Required changes:**
1. `onSuccess` callback receives `(data: AuthResponse, input)` - use this
2. Check if `data.session` is `null` (email confirmation required)
3. If session null: redirect to `/login?message=confirm_email`
4. If session exists: redirect to `/` (current behavior)

**Expected result:**
```typescript
return useServerAction(signUp, {
    onSuccess: (data) => {
        onSuccess?.();
        router.refresh();

        if (!data.session) {
            // Email confirmation required - redirect to login with message
            router.push('/login?message=confirm_email');
            return;
        }

        router.push('/');
    },
});
```

### Phase 2: Fix callback/route.ts Error Redirects

**File:** `app/auth/callback/route.ts`

**Current code (broken):**
```typescript
function getErrorRedirectUrl(origin: string, errorCode: string): string {
    return `${origin}/forgot-password?error=${encodeURIComponent(errorCode)}`;
}
```

**Required changes:**
1. Add `type` parameter to `getErrorRedirectUrl`
2. Redirect signup errors to `/login?error=...`
3. Redirect recovery errors to `/forgot-password?error=...`
4. Add success message param for signup verification

**Expected result:**
```typescript
function getErrorRedirectUrl(
    origin: string,
    type: string | null,
    errorCode: string
): string {
    // Signup errors go to login, recovery errors go to forgot-password
    const destination = type === 'recovery' ? '/forgot-password' : '/login';
    return `${origin}${destination}?error=${encodeURIComponent(errorCode)}`;
}

function getSuccessRedirectUrl(
    origin: string,
    type: string | null,
    next: string
): string {
    if (type === 'recovery') {
        return `${origin}/reset-password`;
    }
    if (type === 'signup') {
        // Email verified - redirect to login with success message
        return `${origin}/login?message=email_verified`;
    }
    return `${origin}${next}`;
}
```

**Update all calls to `getErrorRedirectUrl`** to pass `type` parameter.

### Phase 3: Update Login Page to Handle URL Params

**File:** `app/(auth)/login/page.tsx`

**Current code (broken):**
```typescript
interface LoginPageProps {
    searchParams: Promise<{ redirect?: string }>;
}
```

**Required changes:**
1. Extend `searchParams` interface to include `message` and `error`
2. Pass these to `LoginForm` component

**Expected result:**
```typescript
interface LoginPageProps {
    searchParams: Promise<{
        redirect?: string;
        message?: string;
        error?: string;
    }>;
}

// In component:
const params = await searchParams;

return (
    // ...
    <LoginForm
        redirectTo={params.redirect}
        message={params.message}
        error={params.error}
    />
);
```

### Phase 4: Update LoginForm to Display Messages

**File:** `app/(auth)/login/_components/LoginForm.tsx`

**Required changes:**
1. Add `message` and `error` props to interface
2. Create message maps for codes
3. Display success alert for messages (green)
4. Display error alert for errors (red) - similar to ForgotPasswordForm

**Message codes to support:**
```typescript
const SUCCESS_MESSAGES: Record<string, string> = {
    confirm_email: 'Check your email and click the confirmation link to complete registration.',
    email_verified: 'Email verified successfully! You can now log in.',
};

const ERROR_MESSAGES: Record<string, string> = {
    SESSION_EXPIRED: 'The verification link has expired. Please register again.',
    VALIDATION_ERROR: 'Invalid verification link. Please try again.',
    otp_expired: 'The verification link has expired. Please register again.',
};
```

**Display pattern (follow ForgotPasswordForm):**
```typescript
{message && SUCCESS_MESSAGES[message] && (
    <Alert className="border-green-500 bg-green-50 ...">
        <CheckCircle2 className="h-4 w-4 text-green-600" />
        <AlertDescription>
            {SUCCESS_MESSAGES[message]}
        </AlertDescription>
    </Alert>
)}

{initialError && (
    <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
            {ERROR_MESSAGES[initialError] ?? 'An error occurred. Please try again.'}
        </AlertDescription>
    </Alert>
)}
```

## Output Requirements

### Files to Create/Modify

1. **`app/(auth)/register/_hooks/useSignUpServerAction.ts`** - session check logic
2. **`app/auth/callback/route.ts`** - type-aware error redirects + signup success message
3. **`app/(auth)/login/page.tsx`** - extended searchParams
4. **`app/(auth)/login/_components/LoginForm.tsx`** - message/error display

### Do NOT Modify
- `services/auth/actions.ts` - server actions are correct
- `services/shared/errors.ts` - error codes are complete
- `hooks/useServerAction.ts` - hook is correct
- Test files - will update separately if needed

## Success Criteria

### Scenario A: Registration (production with email confirmation)
- [ ] User submits registration form
- [ ] Redirected to `/login?message=confirm_email`
- [ ] Sees green alert: "Check your email and click the confirmation link..."

### Scenario B: Email Verification Link Click (success)
- [ ] User clicks link in email
- [ ] `verifyOtp` succeeds
- [ ] Redirected to `/login?message=email_verified`
- [ ] Sees green alert: "Email verified successfully! You can now log in."

### Scenario C: Email Verification Link Click (expired/invalid)
- [ ] User clicks expired/invalid link
- [ ] `verifyOtp` fails with error
- [ ] Redirected to `/login?error=SESSION_EXPIRED` (or appropriate code)
- [ ] Sees red alert: "The verification link has expired..."

### Scenario D: Password Reset Error (existing flow - must still work)
- [ ] Recovery link fails
- [ ] Redirected to `/forgot-password?error=...`
- [ ] ForgotPasswordForm shows error (existing behavior preserved)

## Constraints

- DO NOT change server action logic - only client-side routing
- DO NOT add new dependencies
- DO NOT change existing error codes
- PRESERVE all existing functionality (login, password reset)
- USE existing Alert component patterns from ForgotPasswordForm
- FOLLOW existing code style (no emojis, consistent formatting)
- ADD necessary imports (CheckCircle2 from lucide-react, etc.)

## Validation

After implementation, manually test:
1. Register new user (should see email confirmation message on login page)
2. Click verification link (should see success message on login page)
3. Click expired link (should see error message on login page)
4. Password reset flow (should still work as before)
