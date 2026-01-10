'use client';

import { Button } from '@/components/ui/button';
import { useServerAction } from '@/hooks';
import { signOut } from '@/services/auth/actions';

export const SignOutButton = () => {
	const { execute, isPending } = useServerAction(signOut);

	const handleSignOut = () => {
		execute();
	};

	return (
		<Button onClick={handleSignOut} disabled={isPending}>
			{isPending ? 'Logging out...' : 'Log out'}
		</Button>
	);
};
