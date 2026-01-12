import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { useServerAction } from '@/hooks/useServerAction';
import { updatePassword } from '@/services/auth/actions';

export const useResetPasswordServerAction = () => {
	const router = useRouter();

	return useServerAction(updatePassword, {
		onSuccess: () => {
			toast.success(
				'Password updated successfully. Please sign in with your new password.'
			);
			router.push('/login');
		},
	});
};
