'use client';

import { createContext, useContext } from 'react';

interface BoardContextValue {
	onMutationSuccess: () => void;
}

const BoardContext = createContext<BoardContextValue | null>(null);

export const useBoardContext = () => {
	const ctx = useContext(BoardContext);
	if (!ctx) {
		throw new Error('useBoardContext must be used within BoardProvider');
	}
	return ctx;
};

export const BoardProvider = ({
	onMutationSuccess,
	children,
}: BoardContextValue & { children: React.ReactNode }) => (
	<BoardContext value={{ onMutationSuccess }}>{children}</BoardContext>
);
