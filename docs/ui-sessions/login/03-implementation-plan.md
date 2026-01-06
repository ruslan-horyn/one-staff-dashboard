# Login - Implementation Plan

**Generated:** 2026-01-06
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

hooks/
└── useServerAction.ts          # (verify exists)
```

## Implementation Order

1. [ ] **Verify hooks** - Check `useServerAction` hook exists
2. [ ] **Auth Layout** - Create `app/(auth)/layout.tsx`
3. [ ] **PasswordInput** - Create `components/ui/password-input.tsx`
4. [ ] **SubmitButton** - Create `components/ui/submit-button.tsx`
5. [ ] **LoginForm** - Create `app/(auth)/login/_components/LoginForm.tsx`
6. [ ] **Login Page** - Create `app/(auth)/login/page.tsx`
7. [ ] **Loading** - Create `app/(auth)/login/loading.tsx`
8. [ ] **Test** - Verify login flow works

## Component Specifications

### 1. Auth Layout

| Property | Value                            |
|----------|----------------------------------|
| File     | `app/(auth)/layout.tsx`          |
| Type     | Server Component                 |
| Purpose  | Centered layout for auth pages   |

```typescript
// app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

| Property | Value                              |
|----------|------------------------------------|
| File     | `components/ui/password-input.tsx` |
| Type     | Client Component                   |
| Purpose  | Password input with visibility toggle |

**Props Interface:**

```typescript
interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}
```

**Implementation:**

```typescript
'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? 'text' : 'password'}
          className={cn('pr-10', className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
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

| Property | Value                            |
|----------|----------------------------------|
| File     | `components/ui/submit-button.tsx`|
| Type     | Client Component                 |
| Purpose  | Submit button with loading state |

**Props Interface:**

```typescript
interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingText?: string;
}
```

**Implementation:**

```typescript
'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  loadingText?: string;
}

export const SubmitButton = ({
  children,
  loadingText = 'Loading...',
  className,
  disabled,
  ...props
}: SubmitButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className={cn(className)}
      disabled={pending || disabled}
      aria-busy={pending}
      {...props}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
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

| Property | Value                                          |
|----------|------------------------------------------------|
| File     | `app/(auth)/login/_components/LoginForm.tsx`   |
| Type     | Client Component                               |
| Purpose  | Login form with validation and submission      |

**Props Interface:**

```typescript
interface LoginFormProps {
  redirectTo?: string;
}
```

**Implementation outline:**

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

import { useServerAction } from '@/hooks/useServerAction';
import { signInSchema, type SignInInput } from '@/services/auth/schemas';
import { signIn } from '@/services/auth/actions';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordInput } from '@/components/ui/password-input';
import { SubmitButton } from '@/components/ui/submit-button';

interface LoginFormProps {
  redirectTo?: string;
}

export const LoginForm = ({ redirectTo = '/' }: LoginFormProps) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onBlur',
  });

  const { execute, isPending, error: serverError } = useServerAction(signIn, {
    onSuccess: () => {
      router.push(redirectTo);
      router.refresh();
    },
  });

  const onSubmit = handleSubmit((data) => {
    execute(data);
  });

  return (
    <form onSubmit={onSubmit} aria-label="Login form" className="space-y-4">
      <fieldset disabled={isPending} className="space-y-4">
        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            autoFocus
            aria-required="true"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            {...register('email')}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            autoComplete="current-password"
            aria-required="true"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            {...register('password')}
          />
          {errors.password && (
            <p id="password-error" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      </fieldset>

      {/* Submit button */}
      <SubmitButton className="w-full" loadingText="Signing in...">
        Sign in
      </SubmitButton>

      {/* Server error */}
      {serverError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {serverError.message || 'Invalid email or password'}
          </AlertDescription>
        </Alert>
      )}
    </form>
  );
};
```

---

### 5. Login Page

| Property | Value                       |
|----------|-----------------------------|
| File     | `app/(auth)/login/page.tsx` |
| Type     | Server Component            |
| Purpose  | Login page with metadata    |

**Implementation:**

```typescript
// app/(auth)/login/page.tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';

import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
      {/* Logo placeholder + Title */}
      <div className="flex flex-col items-center space-y-2 text-center">
        {/* Logo placeholder */}
        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-xl font-bold text-primary">OS</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">One Staff Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account
        </p>
      </div>

      {/* Login Card */}
      <Card>
        <CardHeader className="space-y-1 pb-4">
          <h2 className="text-lg font-semibold">Welcome back</h2>
        </CardHeader>
        <CardContent>
          <LoginForm redirectTo={params.redirect} />
        </CardContent>
      </Card>

      {/* Forgot password link */}
      <div className="text-center">
        <Link
          href="/forgot-password"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
        >
          Forgot your password?
        </Link>
      </div>
    </div>
  );
}
```

---

### 6. Loading State

| Property | Value                          |
|----------|--------------------------------|
| File     | `app/(auth)/login/loading.tsx` |
| Type     | Server Component               |
| Purpose  | Loading skeleton               |

```typescript
// app/(auth)/login/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function LoginLoading() {
  return (
    <div className="space-y-6">
      {/* Logo + Title skeleton */}
      <div className="flex flex-col items-center space-y-2">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-36" />
      </div>

      {/* Card skeleton */}
      <Card>
        <CardHeader className="pb-4">
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>

      {/* Link skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-4 w-36" />
      </div>
    </div>
  );
}
```

---

## Dependencies Check

### Required (verify installed)

- [x] `react-hook-form` - form handling
- [x] `@hookform/resolvers` - zod integration
- [x] `zod` - validation
- [ ] `lucide-react` - icons (Eye, EyeOff, Loader2, AlertCircle)

### shadcn/ui Components (verify added)

- [x] Button
- [x] Input
- [x] Label
- [x] Card
- [x] Alert
- [x] Skeleton

### Hooks (verify exists)

- [ ] `hooks/useServerAction.ts` - Server Action wrapper

---

## Testing Checklist

### Manual Testing

- [ ] Form renders correctly
- [ ] Email validation shows error for invalid format
- [ ] Password validation shows error for < 8 chars
- [ ] Password visibility toggle works
- [ ] Submit button shows loading state
- [ ] Successful login redirects to Board
- [ ] Failed login shows error alert
- [ ] Already logged in user redirected
- [ ] Forgot password link works

### Accessibility Testing

- [ ] Tab navigation works correctly
- [ ] Screen reader announces form and errors
- [ ] Focus visible on all elements
- [ ] Color contrast meets WCAG AA

---

## Middleware Consideration

Ensure `(auth)` group is excluded from auth middleware:

```typescript
// middleware.ts
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|login|forgot-password|reset-password).*)',
  ],
};
```

---

## Error Messages

| Error Case           | Message                            |
|----------------------|------------------------------------|
| Invalid email format | "Invalid email format" (client)    |
| Password too short   | "Password must be at least 8 characters" (client) |
| Wrong credentials    | "Invalid email or password" (server) |
| Network error        | "Something went wrong. Please try again." |

---

## Handoff Checklist

- [x] All components specified with interfaces
- [x] Server Action exists (signIn)
- [x] Schema exists (signInSchema)
- [x] File structure follows project conventions
- [x] Implementation order is logical
- [x] Dependencies identified
- [x] Testing checklist provided
- [x] Accessibility requirements addressed
- [x] No open questions
