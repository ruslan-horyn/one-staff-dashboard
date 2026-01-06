// Example: app/(auth)/login/page.tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './_components/LoginForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Sign In | One Staff Dashboard',
  description: 'Sign in to your One Staff Dashboard account',
};

export default async function LoginPage() {
  // Check if user is already logged in
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect('/');
  }

  return (
    <Card>
      <CardHeader className="space-y-1 sm:text-center">
        {/* Logo inside card */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-primary font-bold text-xl">OS</span>
          </div>
        </div>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>
          Enter your credentials to login to your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm redirectTo="/" />
      </CardContent>
    </Card>
  );
}
