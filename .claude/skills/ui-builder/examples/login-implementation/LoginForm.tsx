// Example: app/(auth)/login/_components/LoginForm.tsx
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
          {/* Email field */}
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

          {/* Password field with Forgot password link */}
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

        {/* Server error alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error.message || 'Invalid email or password'}
            </AlertDescription>
          </Alert>
        )}

        {/* Submit button */}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>
    </Form>
  );
};
