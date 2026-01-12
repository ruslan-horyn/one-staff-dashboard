'use client';

import { AlertCircle, CheckCircle2 } from 'lucide-react';
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
import { ErrorCodes } from '@/services/shared/errors';

import { useForgotPasswordForm } from '../_hooks/useForgotPasswordForm';
import { useForgotPasswordServerAction } from '../_hooks/useForgotPasswordServerAction';

interface ForgotPasswordFormProps {
	initialError?: string | null;
}

const ERROR_MESSAGES: Record<string, string> = {
	[ErrorCodes.SESSION_EXPIRED]:
		'The password reset link has expired. Please request a new one.',
	[ErrorCodes.VALIDATION_ERROR]: 'Invalid request. Please try again.',
	[ErrorCodes.FORBIDDEN]:
		'Too many requests. Please wait a few minutes and try again.',
};

const getErrorMessage = (
	initialError?: string | null,
	serverErrorCode?: string
): string | null => {
	const errorCode = initialError ?? serverErrorCode;
	if (!errorCode) return null;
	return ERROR_MESSAGES[errorCode] ?? 'An error occurred. Please try again.';
};

export const ForgotPasswordForm = ({
	initialError,
}: ForgotPasswordFormProps) => {
	const form = useForgotPasswordForm();
	const { execute, isPending, isSuccess, error } =
		useForgotPasswordServerAction();

	const onSubmit = form.handleSubmit(execute);

	const errorMessage = getErrorMessage(initialError, error?.code);

	if (isSuccess) {
		return (
			<div className="space-y-4">
				<Alert className="border-green-500 bg-green-50 text-green-900 dark:border-green-500 dark:bg-green-950 dark:text-green-100">
					<CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
					<AlertDescription>
						Check your email for a password reset link. If you don&apos;t see
						it, check your spam folder.
					</AlertDescription>
				</Alert>

				<p className="text-center text-muted-foreground text-sm">
					<Link
						href="/login"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Back to login
					</Link>
				</p>
			</div>
		);
	}

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
				</fieldset>

				{errorMessage && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{errorMessage}</AlertDescription>
					</Alert>
				)}

				<Button type="submit" className="w-full" disabled={isPending}>
					{isPending ? 'Sending...' : 'Send reset link'}
				</Button>

				<p className="text-center text-muted-foreground text-sm">
					<Link
						href="/login"
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						Back to login
					</Link>
				</p>
			</form>
		</Form>
	);
};
