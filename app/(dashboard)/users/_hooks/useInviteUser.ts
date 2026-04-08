'use client';

import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import type { ActionError } from '@/services/shared/result';
import { inviteCoordinator } from '@/services/users/actions';
import { userErrors } from '@/services/users/error-handlers';

interface UseInviteUserOptions {
	onSuccess?: () => void;
	onError?: (error: ActionError) => void;
	onSettled?: () => void;
}

export function useInviteUser({
	onSuccess,
	onError,
	onSettled,
}: UseInviteUserOptions = {}) {
	return useServerAction(inviteCoordinator, {
		onSuccess: () => {
			toast.success('Invitation sent');
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(userErrors.getMessage(error));
			onError?.(error);
		},
		onSettled: () => onSettled?.(),
	});
}
