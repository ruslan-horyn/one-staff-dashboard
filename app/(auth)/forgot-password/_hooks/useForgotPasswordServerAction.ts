import { useServerAction } from '@/hooks/useServerAction';
import { resetPassword } from '@/services/auth/actions';

export const useForgotPasswordServerAction = () => {
	return useServerAction(resetPassword);
};
