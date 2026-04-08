'use client';

import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import type { ActionError } from '@/services/shared/result';
import { updateWorker } from '@/services/workers/actions';
import { workerErrors } from '@/services/workers/error-handlers';

interface UseUpdateWorkerOptions {
	onSuccess?: () => void;
	onError?: (error: ActionError) => void;
	onSettled?: () => void;
}

export function useUpdateWorker({
	onSuccess,
	onError,
	onSettled,
}: UseUpdateWorkerOptions = {}) {
	return useServerAction(updateWorker, {
		onSuccess: () => {
			toast.success('Worker updated');
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(workerErrors.getMessage(error));
			onError?.(error);
		},
		onSettled: () => onSettled?.(),
	});
}
