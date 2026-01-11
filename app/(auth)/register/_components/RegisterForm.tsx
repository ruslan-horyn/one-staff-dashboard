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

import type { RegisterFormInput } from '../_hooks/useSignUpForm';
import { useSignUpForm } from '../_hooks/useSignUpForm';
import {
	prepareSignUpInput,
	useSignUpServerAction,
} from '../_hooks/useSignUpServerAction';

export const RegisterForm = () => {
	const form = useSignUpForm();
	const { execute, isPending, error } = useSignUpServerAction();

	const onSubmit = form.handleSubmit((data: RegisterFormInput) => {
		execute(prepareSignUpInput(data));
	});

	return (
		<Form {...form}>
			<form
				onSubmit={onSubmit}
				className="space-y-4"
				aria-label="Registration form"
			>
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
				<p className="text-center text-muted-foreground text-sm">
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
