'use client';

import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import { deactivateUser, reactivateUser } from '@/services/users/actions';
import { userErrors } from '@/services/users/error-handlers';

interface UseDeactivateUserOptions {
	onSuccess?: () => void;
	onSettled?: () => void;
}

export function useDeactivateUser({
	onSuccess,
	onSettled,
}: UseDeactivateUserOptions = {}) {
	return useServerAction(deactivateUser, {
		onSuccess: () => {
			toast.success('User deactivated');
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(userErrors.getMessage(error));
		},
		onSettled: () => onSettled?.(),
	});
}

export function useReactivateUser({
	onSuccess,
	onSettled,
}: UseDeactivateUserOptions = {}) {
	return useServerAction(reactivateUser, {
		onSuccess: () => {
			toast.success('User reactivated');
			onSuccess?.();
		},
		onError: (error) => {
			toast.error(userErrors.getMessage(error));
		},
		onSettled: () => onSettled?.(),
	});
}
