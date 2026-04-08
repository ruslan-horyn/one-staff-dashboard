'use client';

import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import type { ActionError } from '@/services/shared/result';
import { createWorkLocation } from '@/services/work-locations/actions';
import { workLocationErrors } from '@/services/work-locations/error-handlers';

interface UseCreateLocationOptions {
	onSuccess?: () => void;
	onError?: (error: ActionError) => void;
	onSettled?: () => void;
}

export function useCreateLocation({
	onSuccess,
	onError,
	onSettled,
}: UseCreateLocationOptions = {}) {
	return useServerAction(createWorkLocation, {
		onSuccess: () => {
			toast.success('Work location created');
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(workLocationErrors.getMessage(error));
			onError?.(error);
		},
		onSettled: () => onSettled?.(),
	});
}
