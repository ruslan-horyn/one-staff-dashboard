import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
	type ResetPasswordFormInput,
	resetPasswordFormSchema,
} from '@/services/auth/schemas';

export const useResetPasswordForm = () => {
	return useForm<ResetPasswordFormInput>({
		resolver: zodResolver(resetPasswordFormSchema),
		defaultValues: { newPassword: '', confirmPassword: '' },
	});
};
