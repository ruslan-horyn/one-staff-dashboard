import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
	type ResetPasswordInput,
	resetPasswordSchema,
} from '@/services/auth/schemas';

export const useForgotPasswordForm = () => {
	return useForm<ResetPasswordInput>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: { email: '' },
	});
};
