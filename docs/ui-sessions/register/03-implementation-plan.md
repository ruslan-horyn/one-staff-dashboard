# Register - Implementation Plan

**Generated:** 2026-01-11
**Based on:** 01-requirements.md, 02-design-decisions.md

## File Structure

```
app/
└── (auth)/
    ├── layout.tsx                    # (existing) Auth layout
    └── register/
        ├── page.tsx                  # Server Component - register page
        ├── loading.tsx               # Loading skeleton
        └── _components/
            └── RegisterForm.tsx      # Client Component - form logic
        └── _hooks/
            ├── useSignUpForm.ts      # Form setup + extended schema
            └── useSignUpServerAction.ts # Server action wrapper
```

## Implementation Order

1. [ ] **useSignUpForm hook** - Create form hook with extended schema
2. [ ] **useSignUpServerAction hook** - Create server action wrapper
3. [ ] **RegisterForm component** - Create form UI component
4. [ ] **Register page** - Create page.tsx with metadata
5. [ ] **Loading state** - Create loading.tsx skeleton
6. [ ] **Update Login page** - Add "Create account" link
7. [ ] **Test** - Verify complete registration flow

## Component Specifications

### 1. useSignUpForm Hook

| Property | Value                                        |
|----------|----------------------------------------------|
| File     | `app/(auth)/register/_hooks/useSignUpForm.ts` |
| Type     | Custom Hook                                  |
| Purpose  | Form setup with extended validation schema   |

```typescript
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { signUpSchema } from '@/services/auth/schemas';

// Extend schema with confirmPassword (client-only validation)
export const registerFormSchema = signUpSchema.extend({
  confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type RegisterFormInput = z.infer<typeof registerFormSchema>;

export const useSignUpForm = () => {
  return useForm<RegisterFormInput>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      organizationName: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  });
};
```

---

### 2. useSignUpServerAction Hook

| Property | Value                                               |
|----------|-----------------------------------------------------|
| File     | `app/(auth)/register/_hooks/useSignUpServerAction.ts` |
| Type     | Custom Hook                                         |
| Purpose  | Wrapper for signUp action with redirect             |

```typescript
import { useRouter } from 'next/navigation';

import { useServerAction } from '@/hooks/useServerAction';
import { signUp } from '@/services/auth/actions';
import type { SignUpInput } from '@/services/auth/schemas';

interface UseSignUpServerActionOptions {
  onSuccess?: () => void;
}

export const useSignUpServerAction = ({
  onSuccess,
}: UseSignUpServerActionOptions = {}) => {
  const router = useRouter();

  return useServerAction(signUp, {
    onSuccess: () => {
      onSuccess?.();
      router.refresh();
      router.push('/');
    },
  });
};

// Helper to strip confirmPassword before sending to server
export const prepareSignUpInput = (data: {
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}): SignUpInput => {
  const { confirmPassword, ...signUpData } = data;
  return signUpData;
};
```

---

### 3. RegisterForm Component

| Property | Value                                             |
|----------|---------------------------------------------------|
| File     | `app/(auth)/register/_components/RegisterForm.tsx` |
| Type     | Client Component                                  |
| Purpose  | Registration form with all fields                 |

```typescript
'use client';

import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';

import { useSignUpForm, type RegisterFormInput } from '../_hooks/useSignUpForm';
import {
  useSignUpServerAction,
  prepareSignUpInput,
} from '../_hooks/useSignUpServerAction';

export const RegisterForm = () => {
  const form = useSignUpForm();
  const { execute, isPending, error } = useSignUpServerAction();

  const onSubmit = form.handleSubmit((data: RegisterFormInput) => {
    execute(prepareSignUpInput(data));
  });

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <fieldset disabled={isPending} className="space-y-4">
          {/* Organization name */}
          <FormField
            control={form.control}
            name="organizationName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="My Company"
                    autoComplete="organization"
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* First name + Last name (grid on larger screens) */}
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="John"
                      autoComplete="given-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Doe"
                      autoComplete="family-name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Create a password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        {/* Server error alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.code === 'DUPLICATE_ENTRY'
                ? 'An account with this email already exists'
                : error.message || 'Something went wrong. Please try again.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Creating account...' : 'Create account'}
        </Button>

        {/* Link to login */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  );
};
```

---

### 4. Register Page

| Property | Value                         |
|----------|-------------------------------|
| File     | `app/(auth)/register/page.tsx` |
| Type     | Server Component              |
| Purpose  | Register page with metadata   |

```typescript
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getSession } from '@/services';

import { RegisterForm } from './_components/RegisterForm';

export const metadata: Metadata = {
  title: 'Register | One Staff Dashboard',
  description: 'Create your organization and administrator account',
};

export default async function RegisterPage() {
  const { user } = await getSession();

  // Already logged in - redirect to dashboard
  if (user) {
    redirect('/');
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 sm:text-center">
        {/* Logo */}
        <div className="mb-4 flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <span className="font-bold text-primary text-xl">OS</span>
          </div>
        </div>
        <CardTitle className="text-2xl">Create your organization</CardTitle>
        <CardDescription>
          Enter your details to create your organization account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
    </Card>
  );
};
```

---

### 5. Loading State

| Property | Value                            |
|----------|----------------------------------|
| File     | `app/(auth)/register/loading.tsx` |
| Type     | Server Component                 |
| Purpose  | Loading skeleton                 |

```typescript
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function RegisterLoading() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1 sm:text-center">
        {/* Logo skeleton */}
        <div className="mb-4 flex justify-center">
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
        <Skeleton className="mx-auto h-8 w-48" />
        <Skeleton className="mx-auto h-4 w-64" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Organization name */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Name fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        {/* Email */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Password */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Confirm password */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Button */}
        <Skeleton className="h-10 w-full" />
        {/* Link */}
        <Skeleton className="mx-auto h-4 w-48" />
      </CardContent>
    </Card>
  );
}
```

---

### 6. Update Login Page

Add link to register page in `app/(auth)/login/page.tsx`:

```typescript
// Add after CardContent, before closing Card
<p className="px-6 pb-6 text-center text-sm text-muted-foreground">
  Don't have an account?{' '}
  <Link
    href="/register"
    className="font-medium text-primary underline-offset-4 hover:underline"
  >
    Create organization
  </Link>
</p>
```

---

## Dependencies Check

### Required (already installed)

- [x] `react-hook-form` - form handling
- [x] `@hookform/resolvers` - zod integration
- [x] `zod` - validation
- [x] `lucide-react` - icons (AlertCircle)

### shadcn/ui Components (already added)

- [x] Button
- [x] Input
- [x] Card
- [x] Alert
- [x] Form
- [x] Skeleton
- [x] PasswordInput (custom)

### Hooks (already exists)

- [x] `hooks/useServerAction.ts` - Server Action wrapper

### Services (already exists)

- [x] `services/auth/actions.ts` - signUp action
- [x] `services/auth/schemas.ts` - signUpSchema
- [x] `services/shared/auth.ts` - getSession

---

## Testing Checklist

### Manual Testing

- [ ] Form renders correctly with all fields
- [ ] Organization name validation works
- [ ] First/Last name validation works
- [ ] Email validation shows error for invalid format
- [ ] Password validation shows error for < 8 chars
- [ ] Confirm password shows error when doesn't match
- [ ] Password visibility toggle works for both fields
- [ ] Submit button shows loading state
- [ ] Successful registration auto-logins and redirects to Board
- [ ] Duplicate email shows specific error message
- [ ] Already logged in user redirected to Board
- [ ] "Sign in" link navigates to login
- [ ] Login page "Create organization" link navigates to register

### Accessibility Testing

- [ ] Tab navigation works correctly through all fields
- [ ] Screen reader announces form and errors
- [ ] Focus visible on all elements
- [ ] Color contrast meets WCAG AA
- [ ] Error messages are properly associated with fields

### E2E Test Cases

```typescript
// e2e/register.spec.ts (future)
describe('Registration', () => {
  it('should register new organization successfully');
  it('should show validation errors for empty fields');
  it('should show error for existing email');
  it('should show error for password mismatch');
  it('should redirect logged in user to dashboard');
});
```

---

## Error Messages

| Error Case              | Message                                    |
|-------------------------|--------------------------------------------|
| Empty organization name | "Organization name is required"            |
| Org name too long       | "Organization name must be at most 255 characters" |
| Empty first name        | "First name is required"                   |
| Empty last name         | "Last name is required"                    |
| Invalid email format    | "Invalid email format"                     |
| Password too short      | "Password must be at least 8 characters"   |
| Passwords don't match   | "Passwords don't match"                    |
| Email exists            | "An account with this email already exists"|
| Network/other error     | "Something went wrong. Please try again."  |

---

## Handoff Checklist

- [x] All components specified with interfaces
- [x] Server Action exists (signUp)
- [x] Base schema exists (signUpSchema)
- [x] Extended schema defined (registerFormSchema)
- [x] File structure follows project conventions
- [x] Implementation order is logical
- [x] Dependencies identified and verified
- [x] Testing checklist provided
- [x] Accessibility requirements addressed
- [x] Error handling specified
- [x] No open questions
