// Example: app/(auth)/login/_hooks/useSignInForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { signInSchema, type SignInInput } from '@/services/auth/schemas';

export const useSignInForm = () => {
  return useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
};
