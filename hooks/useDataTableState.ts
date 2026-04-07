// hooks/useDataTableState.ts
'use client';

import type { SortingState } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { type UseTableParamsOptions, useTableParams } from './useTableParams';

export interface UseDataTableStateReturn {
	page: number;
	pageSize: number;
	sorting: SortingState;
	sortBy: string | null;
	sortOrder: 'asc' | 'desc';
	onSortingChange: (
		updater: SortingState | ((old: SortingState) => SortingState)
	) => void;
	onPaginationChange: (page: number, pageSize: number) => void;
}

export function useDataTableState(
	options: UseTableParamsOptions = {}
): UseDataTableStateReturn {
	const router = useRouter();
	const {
		page,
		pageSize,
		sortBy,
		sortOrder,
		setPage,
		setPageSize,
		setSorting,
	} = useTableParams(options);

	const sorting: SortingState = useMemo(
		() => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
		[sortBy, sortOrder]
	);

	const onSortingChange = useCallback(
		(updater: SortingState | ((old: SortingState) => SortingState)) => {
			const newSorting =
				typeof updater === 'function' ? updater(sorting) : updater;
			if (newSorting.length > 0) {
				setSorting(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc');
			} else {
				setSorting(null, 'asc');
			}
		},
		[sorting, setSorting]
	);

	const onPaginationChange = useCallback(
		(newPage: number, newPageSize: number) => {
			if (newPageSize !== pageSize) {
				setPageSize(newPageSize);
			} else {
				setPage(newPage);
			}
			router.refresh();
		},
		[setPage, setPageSize, pageSize, router]
	);

	return {
		page,
		pageSize,
		sorting,
		sortBy,
		sortOrder,
		onSortingChange,
		onPaginationChange,
	};
}
