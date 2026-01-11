import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { signUpSchema } from '@/services/auth/schemas';

// Extend schema with confirmPassword (client-only validation)
export const registerFormSchema = signUpSchema
	.extend({
		confirmPassword: z
			.string()
			.min(8, 'Password must be at least 8 characters'),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword'],
	});

export type RegisterFormInput = z.infer<typeof registerFormSchema>;

export const useSignUpForm = () => {
	return useForm<RegisterFormInput>({
		resolver: zodResolver(registerFormSchema),
		defaultValues: {
			organizationName: '',
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});
};
