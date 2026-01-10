import { redirect } from 'next/navigation';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { getSession } from '@/services/shared/auth';
import { SignOutButton } from './_components/SignOutButton';

export default async function DashboardPage() {
	const { user } = await getSession();

	if (!user) {
		redirect('/login');
	}

	return (
		<div className="min-h-screen bg-background p-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<h1 className="font-bold text-3xl">Dashboard</h1>

				<Card>
					<CardHeader>
						<CardTitle>Witaj!</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-muted-foreground">
							Zalogowano jako: <strong>{user.email}</strong>
						</p>
					</CardContent>
					<CardFooter>
						<SignOutButton />
					</CardFooter>
				</Card>
			</div>
		</div>
	);
}
