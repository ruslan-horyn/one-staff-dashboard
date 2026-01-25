'use client';

import { useCallback, useRef, useState } from 'react';

export interface UseModalStateReturn<T> {
	isOpen: boolean;
	data: T | null;
	triggerRef: React.RefObject<HTMLElement | null>;
	open: (data?: T) => void;
	close: () => void;
}

/**
 * Generic hook for managing modal open/close state with optional associated data.
 * Tracks the triggering element for focus management.
 *
 * @example
 * // Simple modal without data
 * const confirmModal = useModalState();
 * confirmModal.open();
 * confirmModal.close();
 *
 * @example
 * // Modal with data (e.g., edit form)
 * const editModal = useModalState<User>();
 * editModal.open(user); // Opens with user data
 * editModal.data; // Access the user
 * editModal.close();
 *
 * @example
 * // Focus management with dialog
 * <DialogContent onCloseAutoFocus={(e) => {
 *   e.preventDefault();
 *   modal.triggerRef.current?.focus();
 * }}>
 */
export const useModalState = <T = undefined>(): UseModalStateReturn<T> => {
	const [isOpen, setIsOpen] = useState(false);
	const [data, setData] = useState<T | null>(null);
	const triggerRef = useRef<HTMLElement | null>(null);

	const open = useCallback((item?: T) => {
		// Capture the currently focused element as the trigger
		triggerRef.current = document.activeElement as HTMLElement | null;
		setData(item ?? null);
		setIsOpen(true);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
	}, []);

	return { isOpen, data, triggerRef, open, close };
};
