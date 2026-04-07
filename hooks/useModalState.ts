// hooks/useModalState.ts
'use client';

import { useCallback, useRef, useState } from 'react';

export interface UseModalStateOptions<T> {
	onOpen?: (data?: T) => void;
	onClose?: () => void;
}

export interface UseModalStateReturn<T> {
	isOpen: boolean;
	data: T | null;
	triggerRef: React.RefObject<HTMLElement | null>;
	open: (data?: T) => void;
	close: () => void;
}

export const useModalState = <T = undefined>(
	options: UseModalStateOptions<T> = {}
): UseModalStateReturn<T> => {
	const [isOpen, setIsOpen] = useState(false);
	const [data, setData] = useState<T | null>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const optionsRef = useRef(options);
	optionsRef.current = options;

	const open = useCallback((item?: T) => {
		triggerRef.current = document.activeElement as HTMLElement | null;
		setData(item ?? null);
		setIsOpen(true);
		optionsRef.current.onOpen?.(item);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
		optionsRef.current.onClose?.();
	}, []);

	return { isOpen, data, triggerRef, open, close };
};
