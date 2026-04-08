'use client';

import { createContext, useContext } from 'react';

interface LocationsContextValue {
	onMutationSuccess: () => void;
	clientsList: { id: string; name: string }[];
}

const LocationsContext = createContext<LocationsContextValue | null>(null);

export const useLocationsContext = () => {
	const ctx = useContext(LocationsContext);
	if (!ctx) {
		throw new Error(
			'useLocationsContext must be used within LocationsProvider'
		);
	}
	return ctx;
};

export const LocationsProvider = ({
	onMutationSuccess,
	clientsList,
	children,
}: LocationsContextValue & { children: React.ReactNode }) => (
	<LocationsContext value={{ onMutationSuccess, clientsList }}>
		{children}
	</LocationsContext>
);
