'use client';

import Link from 'next/link';

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
import {
	getSuccessMessage,
	getUrlErrorMessage,
} from '../_utils/getUrlMessages';
import { ErrorAlert } from './ErrorAlert';
import { SuccessAlert } from './SuccessAlert';

interface LoginFormProps {
	redirectTo?: string;
	message?: string;
	initialError?: string;
	// Supabase native error params (when verification fails, Supabase redirects directly)
	supabaseErrorCode?: string;
	supabaseErrorDescription?: string;
}

export const LoginForm = ({
	redirectTo,
	message,
	initialError,
	supabaseErrorCode,
	supabaseErrorDescription,
}: LoginFormProps) => {
	const form = useSignInForm();
	const { execute, isPending, error } = useSignInServerAction({ redirectTo });

	const onSubmit = form.handleSubmit(execute);

	const successMessage = getSuccessMessage(message);
	const urlErrorMessage = getUrlErrorMessage(
		supabaseErrorCode,
		supabaseErrorDescription,
		initialError
	);

	return (
		<Form {...form}>
			<form onSubmit={onSubmit} className="space-y-4" aria-label="Login form">
				{successMessage ? <SuccessAlert message={successMessage} /> : null}
				{urlErrorMessage ? <ErrorAlert message={urlErrorMessage} /> : null}
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

				{error ? (
					<ErrorAlert message={error.message || 'Invalid email or password'} />
				) : null}

				<Button type="submit" className="w-full" disabled={isPending}>
					{isPending ? 'Signing in...' : 'Sign in'}
				</Button>

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
