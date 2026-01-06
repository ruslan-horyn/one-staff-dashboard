import { useRouter } from 'next/navigation';

import { useServerAction } from '@/hooks/useServerAction';
import { signIn } from '@/services/auth/actions';

interface UseSignInServerActionOptions {
	redirectTo?: string;
	onSuccess?: () => void;
}

export const useSignInServerAction = ({
	redirectTo = '/',
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
