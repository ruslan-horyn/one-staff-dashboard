'use client';

import type { RowSelectionState } from '@tanstack/react-table';
import { useCallback, useState } from 'react';

interface UseRowSelectionOptions<TData> {
	data: TData[];
	onSelectionChange?: (rows: TData[]) => void;
}

interface UseRowSelectionReturn {
	rowSelection: RowSelectionState;
	onRowSelectionChange: (
		updater:
			| RowSelectionState
			| ((prev: RowSelectionState) => RowSelectionState)
	) => void;
	clearSelection: () => void;
	selectAll: () => void;
}

function useRowSelection<TData>({
	data,
	onSelectionChange,
}: UseRowSelectionOptions<TData>): UseRowSelectionReturn {
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const onRowSelectionChange = useCallback(
		(
			updater:
				| RowSelectionState
				| ((prev: RowSelectionState) => RowSelectionState)
		) => {
			setRowSelection((prev) => {
				const next = typeof updater === 'function' ? updater(prev) : updater;

				if (onSelectionChange) {
					const selectedIndices = Object.keys(next).filter((key) => next[key]);
					const selectedRows = selectedIndices.map(
						(index) => data[Number(index)]
					);
					onSelectionChange(selectedRows);
				}

				return next;
			});
		},
		[data, onSelectionChange]
	);

	const clearSelection = useCallback(() => {
		setRowSelection({});
		onSelectionChange?.([]);
	}, [onSelectionChange]);

	const selectAll = useCallback(() => {
		const allSelected = data.reduce<RowSelectionState>((acc, _, index) => {
			acc[index] = true;
			return acc;
		}, {});
		setRowSelection(allSelected);
		onSelectionChange?.(data);
	}, [data, onSelectionChange]);

	return {
		rowSelection,
		onRowSelectionChange,
		clearSelection,
		selectAll,
	};
}

export { useRowSelection };
export type { UseRowSelectionOptions, UseRowSelectionReturn };
