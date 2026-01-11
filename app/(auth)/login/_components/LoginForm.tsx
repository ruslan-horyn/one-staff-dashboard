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
								<FormMessage />
								<div className="flex justify-end">
									<Link
										href="/forgot-password"
										className="text-muted-foreground text-sm underline-offset-4 hover:underline"
									>
										Forgot password?
									</Link>
								</div>
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

				{/* Link to register */}
				<p className="text-center text-muted-foreground text-sm">
					Don&apos;t have an account?{' '}
					<Link
						href="/register"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Create organization
					</Link>
				</p>
			</form>
		</Form>
	);
};
