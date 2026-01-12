import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { getSession } from '@/services/shared/auth';
import { ResetPasswordForm } from './_components/ResetPasswordForm';

export const metadata: Metadata = {
	title: 'Set New Password | One Staff Dashboard',
	description: 'Set your new password',
};

export default async function ResetPasswordPage() {
	const { user } = await getSession();

	// User must be authenticated via recovery token
	if (!user) {
		redirect('/forgot-password?error=SESSION_EXPIRED');
	}

	return (
		<Card>
			<CardHeader className="space-y-1 sm:text-center">
				<div className="mb-4 flex justify-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<span className="font-bold text-primary text-xl">OS</span>
					</div>
				</div>
				<CardTitle className="text-2xl">Set new password</CardTitle>
				<CardDescription>Enter your new password below.</CardDescription>
			</CardHeader>
			<CardContent>
				<ResetPasswordForm />
			</CardContent>
		</Card>
	);
}
