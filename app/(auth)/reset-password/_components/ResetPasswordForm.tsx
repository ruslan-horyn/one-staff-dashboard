'use client';

import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { PasswordInput } from '@/components/ui/password-input';

import { useResetPasswordForm } from '../_hooks/useResetPasswordForm';
import { useResetPasswordServerAction } from '../_hooks/useResetPasswordServerAction';

export const ResetPasswordForm = () => {
	const form = useResetPasswordForm();
	const { execute, isPending, error } = useResetPasswordServerAction();

	const onSubmit = form.handleSubmit((data) => execute(data));

	return (
		<Form {...form}>
			<form
				onSubmit={onSubmit}
				className="space-y-4"
				aria-label="Reset password form"
			>
				<fieldset disabled={isPending} className="space-y-4">
					<FormField
						control={form.control}
						name="newPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>New password</FormLabel>
								<FormControl>
									<PasswordInput
										placeholder="Enter your new password"
										autoComplete="new-password"
										autoFocus
										{...field}
									/>
								</FormControl>
								<FormDescription>
									Password must be at least 8 characters.
								</FormDescription>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="confirmPassword"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirm password</FormLabel>
								<FormControl>
									<PasswordInput
										placeholder="Confirm your new password"
										autoComplete="new-password"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</fieldset>

				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							{error.message || 'An error occurred. Please try again.'}
						</AlertDescription>
					</Alert>
				)}

				<Button type="submit" className="w-full" disabled={isPending}>
					{isPending ? 'Updating...' : 'Update password'}
				</Button>
			</form>
		</Form>
	);
};
