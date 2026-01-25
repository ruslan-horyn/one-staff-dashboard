'use client';

import type { RefObject } from 'react';
import { useCallback } from 'react';

export interface UseDialogFocusRestoreOptions {
	/**
	 * Reference to the element that should receive focus when dialog closes.
	 * Typically the trigger button that opened the dialog.
	 */
	triggerRef?: RefObject<HTMLElement | null>;
}

export interface UseDialogFocusRestoreReturn {
	/**
	 * Handler for DialogContent's onCloseAutoFocus event.
	 * Prevents default focus behavior and restores focus to trigger.
	 */
	onCloseAutoFocus: (e: Event) => void;
}

/**
 * Hook for managing focus restoration when dialogs close.
 * Returns focus to the trigger element for better accessibility.
 *
 * @param options - Configuration with optional triggerRef
 * @returns Object with onCloseAutoFocus handler
 *
 * @example
 * const { onCloseAutoFocus } = useDialogFocusRestore({ triggerRef });
 *
 * return (
 *   <DialogContent onCloseAutoFocus={onCloseAutoFocus}>
 *     ...
 *   </DialogContent>
 * );
 */
export function useDialogFocusRestore({
	triggerRef,
}: UseDialogFocusRestoreOptions = {}): UseDialogFocusRestoreReturn {
	const onCloseAutoFocus = useCallback(
		(e: Event) => {
			e.preventDefault();
			triggerRef?.current?.focus();
		},
		[triggerRef]
	);

	return { onCloseAutoFocus };
}
