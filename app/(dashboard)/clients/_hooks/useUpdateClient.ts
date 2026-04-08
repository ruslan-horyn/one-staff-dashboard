'use client';

import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import { updateClient } from '@/services/clients/actions';
import { clientErrors } from '@/services/clients/error-handlers';
import type { ActionError } from '@/services/shared/result';

interface UseUpdateClientOptions {
	onSuccess?: () => void;
	onError?: (error: ActionError) => void;
	onSettled?: () => void;
}

export function useUpdateClient({
	onSuccess,
	onError,
	onSettled,
}: UseUpdateClientOptions = {}) {
	return useServerAction(updateClient, {
		onSuccess: () => {
			toast.success('Client updated');
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(clientErrors.getMessage(error));
			onError?.(error);
		},
		onSettled: () => onSettled?.(),
	});
}
