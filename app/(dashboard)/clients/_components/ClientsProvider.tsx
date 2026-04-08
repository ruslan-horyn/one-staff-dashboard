'use client';

import { createContext, useContext } from 'react';

interface ClientsContextValue {
	onMutationSuccess: () => void;
}

const ClientsContext = createContext<ClientsContextValue | null>(null);

export const useClientsContext = () => {
	const ctx = useContext(ClientsContext);
	if (!ctx) {
		throw new Error('useClientsContext must be used within ClientsProvider');
	}
	return ctx;
};

export const ClientsProvider = ({
	onMutationSuccess,
	children,
}: ClientsContextValue & { children: React.ReactNode }) => (
	<ClientsContext value={{ onMutationSuccess }}>{children}</ClientsContext>
);
