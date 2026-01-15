'use client';

import { useCallback, useState } from 'react';

interface UseExpandableRowsOptions {
	allowMultiple?: boolean;
}

interface UseExpandableRowsReturn {
	expandedRows: Record<string, boolean>;
	isExpanded: (rowId: string) => boolean;
	toggleRow: (rowId: string) => void;
	expandRow: (rowId: string) => void;
	collapseRow: (rowId: string) => void;
	collapseAll: () => void;
}

function useExpandableRows(
	options: UseExpandableRowsOptions = {}
): UseExpandableRowsReturn {
	const { allowMultiple = false } = options;

	const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

	const isExpanded = useCallback(
		(rowId: string) => Boolean(expandedRows[rowId]),
		[expandedRows]
	);

	const toggleRow = useCallback(
		(rowId: string) => {
			setExpandedRows((prev) => {
				const isCurrentlyExpanded = prev[rowId];

				if (allowMultiple) {
					return {
						...prev,
						[rowId]: !isCurrentlyExpanded,
					};
				}

				// Single expansion mode: collapse all others
				return {
					[rowId]: !isCurrentlyExpanded,
				};
			});
		},
		[allowMultiple]
	);

	const expandRow = useCallback(
		(rowId: string) => {
			setExpandedRows((prev) => {
				if (allowMultiple) {
					return { ...prev, [rowId]: true };
				}
				return { [rowId]: true };
			});
		},
		[allowMultiple]
	);

	const collapseRow = useCallback((rowId: string) => {
		setExpandedRows((prev) => {
			const { [rowId]: _, ...rest } = prev;
			return rest;
		});
	}, []);

	const collapseAll = useCallback(() => {
		setExpandedRows({});
	}, []);

	return {
		expandedRows,
		isExpanded,
		toggleRow,
		expandRow,
		collapseRow,
		collapseAll,
	};
}

export { useExpandableRows };
export type { UseExpandableRowsOptions, UseExpandableRowsReturn };
