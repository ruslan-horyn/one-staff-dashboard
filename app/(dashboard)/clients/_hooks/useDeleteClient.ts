'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import { deleteClient } from '@/services/clients/actions';
import { clientErrors } from '@/services/clients/error-handlers';
import type { Client } from '@/types/client';

interface UseDeleteClientOptions {
	onSuccess?: () => void;
	onSettled?: () => void;
}

export function useDeleteClient({
	onSuccess,
	onSettled,
}: UseDeleteClientOptions = {}) {
	const {
		execute: executeAction,
		isPending,
		error,
		reset,
	} = useServerAction(deleteClient, {
		onError: (error) => {
			if (!clientErrors.isBlocking(error.code)) {
				toast.error(clientErrors.getMessage(error));
				onSettled?.();
			}
		},
	});

	const blockingError =
		error && clientErrors.isBlocking(error.code)
			? clientErrors.getMessage(error)
			: null;

	const execute = useCallback(
		async (client: Client) => {
			const result = await executeAction({ id: client.id });
			if (result.success) {
				toast.success('Client deleted');
				onSuccess?.();
			}
		},
		[executeAction, onSuccess]
	);

	return { execute, isPending, blockingError, reset };
}
