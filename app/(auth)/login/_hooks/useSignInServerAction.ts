import type { Route } from 'next';
import { useRouter } from 'next/navigation';

import { useServerAction } from '@/hooks/useServerAction';
import { routes } from '@/lib/routes';
import { isSafeInternalRedirect } from '@/lib/utils/safe-redirect';
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
			const safeTarget = isSafeInternalRedirect(redirectTo)
				? redirectTo
				: routes.board;
			router.push(safeTarget);
		},
	});
};
