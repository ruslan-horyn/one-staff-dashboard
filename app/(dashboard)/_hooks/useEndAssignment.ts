'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import { endAssignment } from '@/services/assignments/actions';
import { assignmentErrors } from '@/services/assignments/error-handlers';
import type { EndAssignmentInput } from '@/services/assignments/schemas';

interface UseEndAssignmentOptions {
	onSuccess?: () => void;
	onSettled?: () => void;
}

export function useEndAssignment({
	onSuccess,
	onSettled,
}: UseEndAssignmentOptions = {}) {
	const {
		execute: executeAction,
		isPending,
		reset,
	} = useServerAction(endAssignment, {
		onError: (error) => {
			toast.error(assignmentErrors.getMessage(error));
			onSettled?.();
		},
	});

	const execute = useCallback(
		async (input: EndAssignmentInput) => {
			const result = await executeAction(input);
			if (result.success) {
				toast.success('Assignment ended');
				onSuccess?.();
			}
		},
		[executeAction, onSuccess]
	);

	return { execute, isPending, reset };
}
