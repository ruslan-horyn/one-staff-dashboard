import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './_components/LoginForm';

export const metadata: Metadata = {
	title: 'Login | One Staff Dashboard',
	description: 'Sign in to access the One Staff Dashboard',
};

interface LoginPageProps {
	searchParams: Promise<{ redirect?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect('/');
	}

	const params = await searchParams;

	return (
		<Card>
			<CardHeader className="space-y-1 sm:text-center">
				{/* Logo inside card */}
				<div className="mb-4 flex justify-center">
					<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
						<span className="font-bold text-primary text-xl">OS</span>
					</div>
				</div>
				<CardTitle className="text-2xl">Welcome back</CardTitle>
				<CardDescription>
					Enter your credentials to login to your account.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<LoginForm redirectTo={params.redirect} />
			</CardContent>
		</Card>
	);
}
