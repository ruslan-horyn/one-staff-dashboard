import { redirect } from 'next/navigation';

import { getSession } from '@/services/shared/auth';

export default async function Home() {
	const { user } = await getSession();

	// Redirect based on authentication status
	if (user) {
		redirect('/dashboard');
	} else {
		redirect('/login');
	}
}
