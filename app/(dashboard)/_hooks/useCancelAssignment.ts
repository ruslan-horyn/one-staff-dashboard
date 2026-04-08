'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import { cancelAssignment } from '@/services/assignments/actions';
import { assignmentErrors } from '@/services/assignments/error-handlers';

interface UseCancelAssignmentOptions {
	onSuccess?: () => void;
	onSettled?: () => void;
}

export function useCancelAssignment({
	onSuccess,
	onSettled,
}: UseCancelAssignmentOptions = {}) {
	const {
		execute: executeAction,
		isPending,
		reset,
	} = useServerAction(cancelAssignment, {
		onError: (error) => {
			toast.error(assignmentErrors.getMessage(error));
			onSettled?.();
		},
	});

	const execute = useCallback(
		async (assignmentId: string) => {
			const result = await executeAction({ assignmentId });
			if (result.success) {
				toast.success('Assignment cancelled');
				onSuccess?.();
			}
		},
		[executeAction, onSuccess]
	);

	return { execute, isPending, reset };
}
