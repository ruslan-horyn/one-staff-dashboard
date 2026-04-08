'use client';

import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import { updateWorkLocation } from '@/services/work-locations/actions';
import { workLocationErrors } from '@/services/work-locations/error-handlers';
import type { ActionError } from '@/services/shared/result';

interface UseUpdateLocationOptions {
	onSuccess?: () => void;
	onError?: (error: ActionError) => void;
	onSettled?: () => void;
}

export function useUpdateLocation({
	onSuccess,
	onError,
	onSettled,
}: UseUpdateLocationOptions = {}) {
	return useServerAction(updateWorkLocation, {
		onSuccess: () => {
			toast.success('Work location updated');
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(workLocationErrors.getMessage(error));
			onError?.(error);
		},
		onSettled: () => onSettled?.(),
	});
}
