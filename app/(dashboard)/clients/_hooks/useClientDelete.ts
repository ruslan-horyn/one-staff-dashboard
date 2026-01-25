'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useServerAction } from '@/hooks/useServerAction';
import { deleteClient } from '@/services/clients/actions';
import {
	getClientErrorMessage,
	isBlockingError,
} from '@/services/clients/error-handlers';
import type { Client } from '@/types/client';

export interface UseClientDeleteOptions {
	/** Callback on successful deletion */
	onSuccess: () => void;
	/** Callback when a non-blocking error occurs (closes dialog) */
	onNonBlockingError: () => void;
}

export interface UseClientDeleteReturn {
	/** Execute the delete action */
	execute: (client: Client) => Promise<void>;
	/** Whether a delete operation is in progress */
	isPending: boolean;
	/** Blocking error message to display inline, null if none */
	blockingError: string | null;
	/** Clear the blocking error */
	clearBlockingError: () => void;
}

/**
 * Hook that encapsulates client deletion logic.
 * Handles error classification (blocking vs non-blocking) and state management.
 *
 * @param options - Configuration for the delete hook
 * @returns Delete state and handlers
 *
 * @example
 * const { execute, isPending, blockingError, clearBlockingError } = useClientDelete({
 *   onSuccess: () => onOpenChange(false),
 *   onNonBlockingError: () => onOpenChange(false),
 * });
 */
export function useClientDelete({
	onSuccess,
	onNonBlockingError,
}: UseClientDeleteOptions): UseClientDeleteReturn {
	const [blockingError, setBlockingError] = useState<string | null>(null);

	const { execute: executeDelete, isPending } = useServerAction(deleteClient, {
		onError: (error) => {
			const message = getClientErrorMessage(error);

			if (isBlockingError(error.code)) {
				setBlockingError(message);
				return;
			}

			// Non-blocking errors: show toast and close
			toast.error(message);
			onNonBlockingError();
		},
	});

	const execute = async (client: Client) => {
		setBlockingError(null);
		const result = await executeDelete({ id: client.id });
		if (result.success) {
			onSuccess();
		}
	};

	const clearBlockingError = useCallback(() => setBlockingError(null), []);

	return {
		execute,
		isPending,
		blockingError,
		clearBlockingError,
	};
}

export interface UseClientDeleteWithResetOptions
	extends UseClientDeleteOptions {
	/** Whether the dialog is open - used to reset error on close */
	isOpen: boolean;
}

/**
 * Extended hook that also resets blocking error when dialog closes.
 * Useful when the dialog manages its own open state.
 *
 * @param options - Configuration including isOpen state
 * @returns Delete state and handlers
 */
export function useClientDeleteWithReset({
	isOpen,
	onSuccess,
	onNonBlockingError,
}: UseClientDeleteWithResetOptions): UseClientDeleteReturn {
	const result = useClientDelete({ onSuccess, onNonBlockingError });

	// Reset error when dialog closes
	useEffect(() => {
		if (!isOpen) {
			result.clearBlockingError();
		}
	}, [isOpen, result.clearBlockingError]);

	return result;
}
