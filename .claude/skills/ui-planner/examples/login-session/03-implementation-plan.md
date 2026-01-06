# Login - Implementation Plan

**Generated:** 2024-01-15
**Based on:** 01-requirements.md, 02-design-decisions.md

## File Structure

```
app/
└── (auth)/
    ├── layout.tsx              # Auth layout (centered, no sidebar)
    └── login/
        ├── page.tsx            # Server Component - login page
        ├── loading.tsx         # Loading skeleton
        └── _components/
            └── LoginForm.tsx   # Client Component - form logic

components/
└── ui/
    ├── password-input.tsx      # Shared password input with toggle
    └── submit-button.tsx       # Shared submit button with loading

services/
└── auth/
    ├── actions.ts              # signIn action (existing)
    └── schemas.ts              # loginSchema (add if not exists)
```

## Implementation Order

1. [ ] **Schema** - Add/verify login schema in `services/auth/schemas.ts`
2. [ ] **Auth Layout** - Create `app/(auth)/layout.tsx`
3. [ ] **PasswordInput** - Create shared `components/ui/password-input.tsx`
4. [ ] **SubmitButton** - Create shared `components/ui/submit-button.tsx`
5. [ ] **LoginForm** - Create `app/(auth)/login/_components/LoginForm.tsx`
6. [ ] **Page** - Create `app/(auth)/login/page.tsx`
7. [ ] **Loading** - Create `app/(auth)/login/loading.tsx`
8. [ ] **Tests** - Write unit tests for LoginForm

## Component Specifications

### 1. Auth Layout

| Property | Value |
|----------|-------|
| File | `app/(auth)/layout.tsx` |
| Type | Server Component |
| Purpose | Centered layout for auth pages, no dashboard sidebar |

```typescript
// app/(auth)/layout.tsx
interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
```

---

### 2. PasswordInput

| Property | Value |
|----------|-------|
| File | `components/ui/password-input.tsx` |
| Type | Client Component |
| Purpose | Password input with visibility toggle |

**Props Interface:**

```typescript
interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  // Inherits all Input props
}
```

**Implementation outline:**

```typescript
'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={className}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
```

---

### 3. SubmitButton

| Property | Value |
|----------|-------|
| File | `components/ui/submit-button.tsx` |
| Type | Client Component |
| Purpose | Form submit button with automatic loading state |

**Props Interface:**

```typescript
interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingText?: string;
}
```

**Implementation outline:**

```typescript
'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const SubmitButton = ({
  children,
  loadingText = 'Loading...',
  disabled,
  ...props
}: SubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending || disabled} {...props}>
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
};
```

---

### 4. LoginForm

| Property | Value |
|----------|-------|
| File | `app/(auth)/login/_components/LoginForm.tsx` |
| Type | Client Component |
| Purpose | Login form with validation and submission |

**Props Interface:**

```typescript
interface LoginFormProps {
  redirectTo?: string;
}
```

**Internal State:**

```typescript
// Form via react-hook-form
const form = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
  defaultValues: { email: '', password: '' },
  mode: 'onBlur',
});

// Server action via useServerAction
const { execute, isPending, error: serverError } = useServerAction(signIn, {
  onSuccess: () => {
    router.push(redirectTo || '/');
  },
});
```

**Dependencies:**

- `react-hook-form`
- `@hookform/resolvers/zod`
- `@/services/auth/schemas` - loginSchema
- `@/services/auth/actions` - signIn
- `@/hooks/useServerAction`
- `@/components/ui/input`
- `@/components/ui/label`
- `@/components/ui/password-input`
- `@/components/ui/submit-button`
- `next/navigation` - useRouter

**Key behaviors:**

- Validate email format on blur
- Validate password not empty on blur
- Show inline errors below fields
- Show server error above/below form
- Disable form during submission
- Redirect to Board (or redirectTo) on success

---

### 5. Login Page

| Property | Value |
|----------|-------|
| File | `app/(auth)/login/page.tsx` |
| Type | Server Component |
| Purpose | Login page with metadata |

**Implementation:**

```typescript
// app/(auth)/login/page.tsx
import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './_components/LoginForm';

export const metadata: Metadata = {
  title: 'Login | One Staff Dashboard',
  description: 'Sign in to access the One Staff Dashboard',
};

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Check if already logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  const params = await searchParams;

  return (
    <div className="space-y-6">
      {/* Logo/Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">One Staff Dashboard</h1>
        <p className="text-muted-foreground mt-2">Sign in to your account</p>
      </div>

      {/* Form */}
      <LoginForm redirectTo={params.redirect} />

      {/* Forgot password link */}
      <div className="text-center">
        <a
          href="/forgot-password"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Forgot your password?
        </a>
      </div>
    </div>
  );
}
```

---

### 6. Loading State

| Property | Value |
|----------|-------|
| File | `app/(auth)/login/loading.tsx` |
| Type | Server Component |
| Purpose | Loading skeleton for login page |

```typescript
// app/(auth)/login/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
  return (
    <div className="space-y-6">
      {/* Title skeleton */}
      <div className="text-center space-y-2">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-4 w-36 mx-auto" />
      </div>

      {/* Form skeleton */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full mt-2" />
      </div>

      {/* Link skeleton */}
      <Skeleton className="h-4 w-32 mx-auto" />
    </div>
  );
}
```

---

## Server Actions

### signIn (existing)

| Property | Value |
|----------|-------|
| File | `services/auth/actions.ts` |
| Auth | Not required |
| Status | Should already exist |

**Expected signature:**

```typescript
export const signIn = createAction<LoginInput, { user: User }>(
  async (input, { supabase }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    if (error) throw error;
    return { user: data.user };
  },
  { schema: loginSchema, requireAuth: false }
);
```

---

## Schema

### loginSchema

| Property | Value |
|----------|-------|
| File | `services/auth/schemas.ts` |
| Export | `loginSchema`, `LoginInput` |

```typescript
// services/auth/schemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email'),
  password: z.string()
    .min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
```

---

## Testing Checklist

### Unit Tests

- [ ] LoginForm renders all fields
- [ ] Email validation shows error for invalid email
- [ ] Password validation shows error when empty
- [ ] Submit button disabled during submission
- [ ] Server error displays correctly
- [ ] Password visibility toggle works

### Integration Tests

- [ ] Successful login redirects to Board
- [ ] Failed login shows error message
- [ ] Already logged in user redirected

### Accessibility Tests

- [ ] Form has accessible name
- [ ] All inputs have associated labels
- [ ] Error messages linked to inputs
- [ ] Keyboard navigation works
- [ ] Focus moves to first error on submit
- [ ] Password toggle is keyboard accessible

---

## Dependencies to Verify

Before implementation, ensure installed:

- [x] `react-hook-form`
- [x] `@hookform/resolvers`
- [x] `zod`
- [ ] `lucide-react` (for icons)
- [x] shadcn/ui: Input, Button, Label
- [ ] shadcn/ui: Skeleton (for loading)

---

## Implementation Notes

### Error Message Strategy

Use generic error messages for auth:
- Wrong password → "Invalid email or password"
- User not found → "Invalid email or password"
- Rate limited → "Too many attempts. Please try again later."

### Redirect Flow

```
/login?redirect=/workers/123
        ↓
   [Login success]
        ↓
   /workers/123
```

### Middleware Consideration

The `(auth)` group should be excluded from auth middleware to allow unauthenticated access.

---

## Handoff Checklist

- [x] All components specified with props interfaces
- [x] Server Action defined (existing)
- [x] Schema defined
- [x] File structure follows project conventions
- [x] Implementation order is logical
- [x] Dependencies identified
- [x] Testing approach defined
- [x] Accessibility requirements addressed
- [x] No open questions remaining
