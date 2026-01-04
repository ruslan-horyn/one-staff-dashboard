'use client';

import { useRouter } from 'next/navigation';
import { useRef } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useServerAction } from '@/hooks/useServerAction';
import { signIn } from '@/services/auth/actions';

export default function LoginPage() {
	const router = useRouter();
	const formRef = useRef<HTMLFormElement>(null);

	const { execute, isPending, error } = useServerAction(signIn, {
		onSuccess: () => {
			router.push('/dashboard');
		},
	});

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;
		await execute({ email, password });
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background p-4">
			<Card className="w-full max-w-md">
				<CardHeader className="space-y-1">
					<CardTitle className="text-2xl font-bold">
						One Staff Dashboard
					</CardTitle>
					<CardDescription>
						Zaloguj się, aby uzyskać dostęp do panelu
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
						{error && (
							<Alert variant="destructive">
								<AlertDescription>{error.message}</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								name="email"
								type="email"
								placeholder="jan@firma.pl"
								required
								autoComplete="email"
								disabled={isPending}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Hasło</Label>
							<Input
								id="password"
								name="password"
								type="password"
								placeholder="••••••••"
								required
								autoComplete="current-password"
								minLength={8}
								disabled={isPending}
							/>
						</div>

						<Button type="submit" className="w-full" disabled={isPending}>
							{isPending ? 'Logowanie...' : 'Zaloguj się'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
