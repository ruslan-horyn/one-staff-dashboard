import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { type SignInInput, signInSchema } from '@/services/auth/schemas';

export const useSignInForm = () => {
	return useForm<SignInInput>({
		resolver: zodResolver(signInSchema),
		defaultValues: { email: '', password: '' },
	});
};
