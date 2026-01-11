import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { getSession } from '@/services';

import { RegisterForm } from './_components/RegisterForm';

export const metadata: Metadata = {
	title: 'Register | One Staff Dashboard',
	description: 'Create your organization and administrator account',
};

export default async function RegisterPage() {
	const { user } = await getSession();

	// Already logged in - redirect to dashboard
	if (user) {
		redirect('/');
	}

	return (
		<Card className="w-full max-w-md">
			<CardHeader className="space-y-1 sm:text-center">
				{/* Logo */}
				<div className="mb-4 flex justify-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<span className="font-bold text-primary text-xl">OS</span>
					</div>
				</div>
				<CardTitle className="text-2xl">Create your organization</CardTitle>
				<CardDescription>
					Enter your details to create your organization account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<RegisterForm />
			</CardContent>
		</Card>
	);
}
