'use client';

import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import { createClient } from '@/services/clients/actions';
import { clientErrors } from '@/services/clients/error-handlers';
import type { ActionError } from '@/services/shared/result';

interface UseCreateClientOptions {
	onSuccess?: () => void;
	onError?: (error: ActionError) => void;
	onSettled?: () => void;
}

export function useCreateClient({
	onSuccess,
	onError,
	onSettled,
}: UseCreateClientOptions = {}) {
	return useServerAction(createClient, {
		onSuccess: () => {
			toast.success('Client created');
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(clientErrors.getMessage(error));
			onError?.(error);
		},
		onSettled: () => onSettled?.(),
	});
}
