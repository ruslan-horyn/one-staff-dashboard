# Component Patterns

React component patterns for UI Builder implementation.

## Form Component Pattern

Standard pattern for forms using **shadcn/ui Form** with react-hook-form + zod.

**IMPORTANT:** Form logic MUST be extracted to a custom hook (e.g., `useLoginForm`).

**Required:** Install Form component: `pnpm dlx shadcn@latest add form`

### Step 1: Form Hook (wrapper over `useForm`)

Configures react-hook-form with schema and default values. Single responsibility: form state management.

**File:** `app/(<group>)/<view>/_hooks/use<View>Form.ts`

```tsx
// Example: app/(auth)/login/_hooks/useSignInForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { signInSchema, type SignInInput } from '@/services/auth/schemas';

export const useSignInForm = () => {
  return useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
};
```

### Step 2: Server Action Hook (wrapper over `useServerAction`)

Configures server action with callbacks. Single responsibility: action execution.

**File:** `app/(<group>)/<view>/_hooks/use<View>ServerAction.ts`

```tsx
// Example: app/(auth)/login/_hooks/useSignInServerAction.ts
import { useRouter } from 'next/navigation';

import { useServerAction } from '@/hooks/useServerAction';
import { signIn } from '@/services/auth/actions';

interface UseSignInServerActionOptions {
  redirectTo?: string;
  onSuccess?: () => void;
}

export const useSignInServerAction = ({
  redirectTo = '/',
  onSuccess,
}: UseSignInServerActionOptions = {}) => {
  const router = useRouter();

  return useServerAction(signIn, {
    onSuccess: () => {
      onSuccess?.();
      router.push(redirectTo);
    },
  });
};
```

### Step 3: Usage in Component

Component composes both hooks together.

```tsx
// app/(auth)/login/_components/LoginForm.tsx
'use client';

import { useSignInForm } from '../_hooks/useSignInForm';
import { useSignInServerAction } from '../_hooks/useSignInServerAction';

interface LoginFormProps {
  redirectTo?: string;
}

export const LoginForm = ({ redirectTo }: LoginFormProps) => {
  const form = useSignInForm();
  const { execute, isPending, error } = useSignInServerAction({ redirectTo });

  const onSubmit = form.handleSubmit(execute);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit}>
        {/* form fields */}
      </form>
    </Form>
  );
};
```

**Benefits:**
- **SRP:** Each hook has single responsibility
- **Testable:** Mock `useSignInForm` or `useSignInServerAction` independently
- **Reusable:** `useSignInServerAction` can be used outside forms
- **Flexible:** Easy to swap form library or action handling

### Form File Structure

```
app/(auth)/login/
├── page.tsx
├── loading.tsx
├── _hooks/
│   ├── useSignInForm.ts           # Form state hook (wrapper over useForm)
│   └── useSignInServerAction.ts   # Server action hook (wrapper over useServerAction)
└── _components/
    ├── LoginForm.tsx              # Form UI component
    └── LoginForm.test.tsx         # Tests
```

### Hook Naming Convention

**Form Hooks** (wrapper over `useForm`):

| View | Hook Name | File |
|------|-----------|------|
| Login | `useSignInForm` | `_hooks/useSignInForm.ts` |
| Register | `useSignUpForm` | `_hooks/useSignUpForm.ts` |
| Forgot Password | `useForgotPasswordForm` | `_hooks/useForgotPasswordForm.ts` |
| Reset Password | `useResetPasswordForm` | `_hooks/useResetPasswordForm.ts` |
| Worker Create/Edit | `useWorkerForm` | `_hooks/useWorkerForm.ts` |
| Profile Edit | `useProfileForm` | `_hooks/useProfileForm.ts` |

**Server Action Hooks** (wrapper over `useServerAction`):

| View | Hook Name | File |
|------|-----------|------|
| Login | `useSignInServerAction` | `_hooks/useSignInServerAction.ts` |
| Register | `useSignUpServerAction` | `_hooks/useSignUpServerAction.ts` |
| Forgot Password | `useForgotPasswordServerAction` | `_hooks/useForgotPasswordServerAction.ts` |
| Reset Password | `useResetPasswordServerAction` | `_hooks/useResetPasswordServerAction.ts` |
| Worker Create | `useCreateWorkerServerAction` | `_hooks/useCreateWorkerServerAction.ts` |
| Worker Update | `useUpdateWorkerServerAction` | `_hooks/useUpdateWorkerServerAction.ts` |

### Full Component Example

```tsx
// app/(auth)/login/_components/LoginForm.tsx
'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

import { useSignInForm } from '../_hooks/useSignInForm';
import { useSignInServerAction } from '../_hooks/useSignInServerAction';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PasswordInput } from '@/components/ui/password-input';

interface LoginFormProps {
  redirectTo?: string;
}

export const LoginForm = ({ redirectTo }: LoginFormProps) => {
  const form = useSignInForm();
  const { execute, isPending, error } = useSignInServerAction({ redirectTo });

  const onSubmit = form.handleSubmit(execute);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <fieldset disabled={isPending} className="space-y-4">
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
                    autoFocus
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </fieldset>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'Invalid email or password'}
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </Form>
  );
};
```

### Form Components Reference

| Component | Purpose |
|-----------|---------|
| `Form` | Context provider wrapping react-hook-form |
| `FormField` | Controlled field with automatic error handling |
| `FormItem` | Container for label, control, message |
| `FormLabel` | Label with automatic htmlFor |
| `FormControl` | Input wrapper with aria attributes |
| `FormDescription` | Optional helper text |
| `FormMessage` | Error message display |

### FormField with Different Inputs

```tsx
// Text input
<FormField
  control={form.control}
  name="email"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" placeholder="name@example.com" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// Password with PasswordInput
<FormField
  control={form.control}
  name="password"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Password</FormLabel>
      <FormControl>
        <PasswordInput placeholder="Enter password" {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// Select
<FormField
  control={form.control}
  name="role"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Role</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

## Table Component Pattern

Pattern for data tables with sorting and pagination:

```tsx
'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface DataItem {
  id: string;
  name: string;
  // ... other fields
}

interface DataTableProps {
  data: DataItem[];
  onRowClick?: (item: DataItem) => void;
}

type SortDirection = 'asc' | 'desc' | null;
type SortColumn = keyof DataItem | null;

export const DataTable = ({ data, onRowClick }: DataTableProps) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = (column: keyof DataItem) => {
    if (sortColumn === column) {
      setSortDirection((prev) =>
        prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'
      );
      if (sortDirection === 'desc') setSortColumn(null);
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn || !sortDirection) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ column }: { column: keyof DataItem }) => {
    if (sortColumn !== column) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No data found</p>
        <Button variant="outline" size="sm" className="mt-2">
          Add first item
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead
            className="cursor-pointer select-none"
            onClick={() => handleSort('name')}
            aria-sort={
              sortColumn === 'name'
                ? sortDirection === 'asc'
                  ? 'ascending'
                  : 'descending'
                : 'none'
            }
          >
            <div className="flex items-center gap-1">
              Name
              <SortIcon column="name" />
            </div>
          </TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((item) => (
          <TableRow
            key={item.id}
            className="cursor-pointer"
            onClick={() => onRowClick?.(item)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onRowClick?.(item);
              }
            }}
          >
            <TableCell>{item.name}</TableCell>
            <TableCell className="text-right">
              {/* Action buttons */}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

## Modal/Dialog Pattern

Pattern for modal dialogs:

```tsx
'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ModalProps {
  trigger: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
  onConfirm?: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export const Modal = ({
  trigger,
  title,
  description,
  children,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = false,
}: ModalProps) => {
  const [open, setOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) {
      setOpen(false);
      return;
    }

    setIsPending(true);
    try {
      await onConfirm();
      setOpen(false);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription>{description}</DialogDescription>
          )}
        </DialogHeader>

        {children}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isPending}
          >
            {cancelText}
          </Button>
          <Button
            variant={isDestructive ? 'destructive' : 'default'}
            onClick={handleConfirm}
            disabled={isPending}
          >
            {isPending ? 'Loading...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
```

## Confirmation Dialog Pattern

For destructive actions:

```tsx
'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ConfirmDialogProps {
  trigger: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDialog = ({
  trigger,
  title,
  description,
  onConfirm,
  confirmText = 'Continue',
  cancelText = 'Cancel',
}: ConfirmDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
```

## Shared UI Components

### PasswordInput

```tsx
'use client';

import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

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

### SubmitButton

```tsx
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

## Accessibility Checklist

For every component:

- [ ] All interactive elements are keyboard accessible
- [ ] Focus states are visible
- [ ] ARIA labels on icon-only buttons
- [ ] `aria-invalid` on form fields with errors
- [ ] `aria-describedby` linking errors to fields
- [ ] `aria-live` for dynamic content updates
- [ ] Proper heading hierarchy
- [ ] Color contrast meets WCAG AA (4.5:1)
