'use client';

import { createContext, useContext } from 'react';

interface WorkersContextValue {
	onMutationSuccess: () => void;
}

const WorkersContext = createContext<WorkersContextValue | null>(null);

export const useWorkersContext = () => {
	const ctx = useContext(WorkersContext);
	if (!ctx) {
		throw new Error('useWorkersContext must be used within WorkersProvider');
	}
	return ctx;
};

export const WorkersProvider = ({
	onMutationSuccess,
	children,
}: WorkersContextValue & { children: React.ReactNode }) => (
	<WorkersContext value={{ onMutationSuccess }}>{children}</WorkersContext>
);
