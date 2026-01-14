'use client';

import { Button } from '@/components/ui/button';
import { useServerAction } from '@/hooks';
import { signOut } from '@/services/auth/actions';

export const SignOutButton = () => {
	const { execute, isPending } = useServerAction(signOut);

	return (
		<Button onClick={execute} disabled={isPending}>
			{isPending ? 'Logging out...' : 'Log out'}
		</Button>
	);
};
