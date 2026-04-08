'use client';

import { createContext, useContext } from 'react';

interface UsersContextValue {
	onMutationSuccess: () => void;
}

const UsersContext = createContext<UsersContextValue | null>(null);

export const useUsersContext = () => {
	const ctx = useContext(UsersContext);
	if (!ctx) {
		throw new Error('useUsersContext must be used within UsersProvider');
	}
	return ctx;
};

export const UsersProvider = ({
	onMutationSuccess,
	children,
}: UsersContextValue & { children: React.ReactNode }) => (
	<UsersContext value={{ onMutationSuccess }}>{children}</UsersContext>
);
