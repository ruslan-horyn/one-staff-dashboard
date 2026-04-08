'use client';

import type { Row } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/data-table/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { useDataTableState } from '@/hooks/useDataTableState';
import type { PaginatedResult } from '@/services/shared/pagination';
import type { Worker } from '@/types/worker';
import { AssignmentExpandedRow } from './AssignmentExpandedRow';
import { BoardProvider } from './BoardProvider';
import { columns } from './columns';

interface BoardDataTableProps {
	initialData: PaginatedResult<Worker>;
}

const renderExpandedRow = (row: Row<Worker>) => (
	<AssignmentExpandedRow workerId={row.original.id} />
);

export const BoardDataTable = ({ initialData }: BoardDataTableProps) => {
	const router = useRouter();
	const tableState = useDataTableState({
		defaultSortBy: 'name',
		defaultSortOrder: 'asc',
	});

	return (
		<BoardProvider onMutationSuccess={() => router.refresh()}>
			<div className="space-y-4">
				<SearchInput
					placeholder="Search workers..."
					syncWithUrlParam="search"
					minChars={3}
					className="w-full sm:max-w-xs"
				/>

				<DataTable
					columns={columns}
					data={initialData.data}
					pagination={initialData.pagination}
					onPaginationChange={tableState.onPaginationChange}
					sorting={tableState.sorting}
					onSortingChange={tableState.onSortingChange}
					renderExpandedRow={renderExpandedRow}
					allowMultipleExpanded
					emptyState={{
						title: 'No workers found',
						description: 'No workers match the current search.',
					}}
				/>
			</div>
		</BoardProvider>
	);
};
