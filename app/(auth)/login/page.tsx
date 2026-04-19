import type { Metadata, Route } from 'next';
import { redirect } from 'next/navigation';

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

import { routes } from '@/lib/routes';
import { getSession } from '@/services/shared/auth';
import { LoginForm } from './_components/LoginForm';

export const metadata: Metadata = {
	title: 'Login | One Staff Dashboard',
	description: 'Sign in to access the One Staff Dashboard',
};

interface LoginPageProps {
	searchParams: Promise<{
		redirect?: string;
		message?: string;
		error?: string;
		// Supabase native error params (when verification fails, Supabase redirects directly)
		error_code?: string;
		error_description?: string;
	}>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
	const { user } = await getSession();

	if (user) {
		redirect(routes.board);
	}

	const params = await searchParams;

	return (
		<Card>
			<CardHeader className="space-y-1 text-center">
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
				<LoginForm
					redirectTo={params.redirect as Route | undefined}
					message={params.message}
					initialError={params.error}
					supabaseErrorCode={params.error_code}
					supabaseErrorDescription={params.error_description}
				/>
			</CardContent>
		</Card>
	);
}
