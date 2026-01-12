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
import { ForgotPasswordForm } from './_components/ForgotPasswordForm';

export const metadata: Metadata = {
	title: 'Forgot Password | One Staff Dashboard',
	description: 'Reset your password',
};

interface ForgotPasswordPageProps {
	searchParams: Promise<{ error?: string }>;
}

export default async function ForgotPasswordPage({
	searchParams,
}: ForgotPasswordPageProps) {
	const { user } = await getSession();

	if (user) {
		redirect('/');
	}

	const { error } = await searchParams;

	return (
		<Card>
			<CardHeader className="space-y-1 sm:text-center">
				<div className="mb-4 flex justify-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<span className="font-bold text-primary text-xl">OS</span>
					</div>
				</div>
				<CardTitle className="text-2xl">Forgot password?</CardTitle>
				<CardDescription>
					Enter your email address and we&apos;ll send you a link to reset your
					password.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ForgotPasswordForm initialError={error} />
			</CardContent>
		</Card>
	);
}
