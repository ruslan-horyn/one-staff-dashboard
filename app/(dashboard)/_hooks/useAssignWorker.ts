'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import { createAssignment } from '@/services/assignments/actions';
import { assignmentErrors } from '@/services/assignments/error-handlers';
import type { CreateAssignmentInput } from '@/services/assignments/schemas';

interface UseAssignWorkerOptions {
	onSuccess?: () => void;
	onSettled?: () => void;
}

export function useAssignWorker({
	onSuccess,
	onSettled,
}: UseAssignWorkerOptions = {}) {
	const {
		execute: executeAction,
		isPending,
		reset,
	} = useServerAction(createAssignment, {
		onError: (error) => {
			toast.error(assignmentErrors.getMessage(error));
			onSettled?.();
		},
	});

	const execute = useCallback(
		async (input: CreateAssignmentInput) => {
			const result = await executeAction(input);
			if (result.success) {
				toast.success('Worker assigned');
				onSuccess?.();
			}
		},
		[executeAction, onSuccess]
	);

	return { execute, isPending, reset };
}
