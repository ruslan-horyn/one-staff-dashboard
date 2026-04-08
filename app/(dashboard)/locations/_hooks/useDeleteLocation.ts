'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import { deleteWorkLocation } from '@/services/work-locations/actions';
import { workLocationErrors } from '@/services/work-locations/error-handlers';
import type { WorkLocation } from '@/types/work-location';

interface UseDeleteLocationOptions {
	onSuccess?: () => void;
	onSettled?: () => void;
}

export function useDeleteLocation({
	onSuccess,
	onSettled,
}: UseDeleteLocationOptions = {}) {
	const {
		execute: executeAction,
		isPending,
		error,
		reset,
	} = useServerAction(deleteWorkLocation, {
		onError: (error) => {
			if (!workLocationErrors.isBlocking(error.code)) {
				toast.error(workLocationErrors.getMessage(error));
				onSettled?.();
			}
		},
	});

	const blockingError =
		error && workLocationErrors.isBlocking(error.code)
			? workLocationErrors.getMessage(error)
			: null;

	const execute = useCallback(
		async (location: WorkLocation) => {
			const result = await executeAction({ id: location.id });
			if (result.success) {
				toast.success('Work location deleted');
				onSuccess?.();
			}
		},
		[executeAction, onSuccess]
	);

	return { execute, isPending, blockingError, reset };
}
