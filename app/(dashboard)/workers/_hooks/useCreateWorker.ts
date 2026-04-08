'use client';

import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import type { ActionError } from '@/services/shared/result';
import { createWorker } from '@/services/workers/actions';
import { workerErrors } from '@/services/workers/error-handlers';

interface UseCreateWorkerOptions {
	onSuccess?: () => void;
	onError?: (error: ActionError) => void;
	onSettled?: () => void;
}

export function useCreateWorker({
	onSuccess,
	onError,
	onSettled,
}: UseCreateWorkerOptions = {}) {
	return useServerAction(createWorker, {
		onSuccess: () => {
			toast.success('Worker created');
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(workerErrors.getMessage(error));
			onError?.(error);
		},
		onSettled: () => onSettled?.(),
	});
}
