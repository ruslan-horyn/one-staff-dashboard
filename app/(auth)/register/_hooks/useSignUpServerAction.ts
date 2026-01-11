import { useRouter } from 'next/navigation';

import { useServerAction } from '@/hooks/useServerAction';
import { signUp } from '@/services/auth/actions';
import type { SignUpInput } from '@/services/auth/schemas';

interface UseSignUpServerActionOptions {
	onSuccess?: () => void;
}

export const useSignUpServerAction = ({
	onSuccess,
}: UseSignUpServerActionOptions = {}) => {
	const router = useRouter();

	return useServerAction(signUp, {
		onSuccess: () => {
			onSuccess?.();
			router.refresh();
			router.push('/');
		},
	});
};

// Helper to strip confirmPassword before sending to server
export const prepareSignUpInput = (data: {
	organizationName: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	confirmPassword: string;
}): SignUpInput => {
	const { confirmPassword: _, ...signUpData } = data;
	return signUpData;
};
