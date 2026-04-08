'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import { deleteWorker } from '@/services/workers/actions';
import { workerErrors } from '@/services/workers/error-handlers';
import type { Worker } from '@/types/worker';

interface UseDeleteWorkerOptions {
	onSuccess?: () => void;
	onSettled?: () => void;
}

export function useDeleteWorker({
	onSuccess,
	onSettled,
}: UseDeleteWorkerOptions = {}) {
	const {
		execute: executeAction,
		isPending,
		error,
		reset,
	} = useServerAction(deleteWorker, {
		onError: (error) => {
			if (!workerErrors.isBlocking(error.code)) {
				toast.error(workerErrors.getMessage(error));
				onSettled?.();
			}
		},
	});

	const blockingError =
		error && workerErrors.isBlocking(error.code)
			? workerErrors.getMessage(error)
			: null;

	const execute = useCallback(
		async (worker: Worker) => {
			const result = await executeAction({ id: worker.id });
			if (result.success) {
				toast.success('Worker deleted');
				onSuccess?.();
			}
		},
		[executeAction, onSuccess]
	);

	return { execute, isPending, blockingError, reset };
}
