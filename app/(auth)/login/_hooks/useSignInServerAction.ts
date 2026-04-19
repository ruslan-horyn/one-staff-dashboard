import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { useServerAction } from '@/hooks/useServerAction';
import { routes } from '@/lib/routes';
import { signIn } from '@/services/auth/actions';

interface UseSignInServerActionOptions {
	redirectTo?: Route;
	onSuccess?: () => void;
}

export const useSignInServerAction = ({
	redirectTo = routes.board,
	onSuccess,
}: UseSignInServerActionOptions = {}) => {
	const router = useRouter();

	return useServerAction(signIn, {
		onSuccess: () => {
			onSuccess?.();
			router.push(redirectTo);
		},
	});
};
