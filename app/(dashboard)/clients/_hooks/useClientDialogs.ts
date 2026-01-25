'use client';

import { type UseModalStateReturn, useModalState } from '@/hooks';
import type { Client } from '@/types/client';

export interface UseClientDialogsReturn {
	formDialog: UseModalStateReturn<Client>;
	deleteDialog: UseModalStateReturn<Client>;
}

/**
 * Hook for managing client form and delete dialog states.
 *
 * @example
 * const { formDialog, deleteDialog } = useClientDialogs();
 *
 * // Open create dialog
 * formDialog.open();
 *
 * // Open edit dialog with client data
 * formDialog.open(client);
 *
 * // Open delete confirmation
 * deleteDialog.open(client);
 */
export const useClientDialogs = (): UseClientDialogsReturn => ({
	formDialog: useModalState<Client>(),
	deleteDialog: useModalState<Client>(),
});
