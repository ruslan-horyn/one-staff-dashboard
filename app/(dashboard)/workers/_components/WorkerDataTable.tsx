'use client';

import { useRouter } from 'next/navigation';

import { DataTable } from '@/components/ui/data-table/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { useDataTableState } from '@/hooks/useDataTableState';
import type { PaginatedResult } from '@/services/shared/pagination';
import type { Worker } from '@/types/worker';

import { AddWorkerButton } from './AddWorkerButton';
import { columns } from './columns';
import { WorkersProvider } from './WorkersProvider';

export const WorkerDataTable = ({
	initialData,
}: {
	initialData: PaginatedResult<Worker>;
}) => {
	const router = useRouter();
	const tableState = useDataTableState({
		defaultSortBy: 'name',
		defaultSortOrder: 'asc',
	});

	return (
		<WorkersProvider onMutationSuccess={() => router.refresh()}>
			<div className="space-y-4">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<SearchInput
						placeholder="Search workers..."
						syncWithUrlParam="search"
						minChars={3}
						className="w-full sm:max-w-xs"
					/>
					<AddWorkerButton />
				</div>

				<DataTable
					columns={columns}
					data={initialData.data}
					pagination={initialData.pagination}
					onPaginationChange={tableState.onPaginationChange}
					sorting={tableState.sorting}
					onSortingChange={tableState.onSortingChange}
					emptyState={{
						title: 'No workers found',
						description: 'Get started by adding your first worker.',
						action: <AddWorkerButton />,
					}}
				/>
			</div>
		</WorkersProvider>
	);
};
