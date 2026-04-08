'use client';

import { useRouter } from 'next/navigation';

import { DataTable } from '@/components/ui/data-table/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { useDataTableState } from '@/hooks/useDataTableState';
import type { PaginatedResult } from '@/services/shared/pagination';
import type { WorkLocation } from '@/types/work-location';

import { AddLocationButton } from './AddLocationButton';
import { columns } from './columns';
import { LocationsProvider } from './LocationsProvider';
import { PositionList } from './PositionList';

export const LocationDataTable = ({
	initialData,
	clientsList,
}: {
	initialData: PaginatedResult<WorkLocation>;
	clientsList: { id: string; name: string }[];
}) => {
	const router = useRouter();
	const tableState = useDataTableState({
		defaultSortBy: 'name',
		defaultSortOrder: 'asc',
	});

	return (
		<LocationsProvider
			onMutationSuccess={() => router.refresh()}
			clientsList={clientsList}
		>
			<div className="space-y-4">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<SearchInput
						placeholder="Search locations..."
						syncWithUrlParam="search"
						minChars={3}
						className="w-full sm:max-w-xs"
					/>
					<AddLocationButton clientsList={clientsList} />
				</div>

				<DataTable
					columns={columns}
					data={initialData.data}
					pagination={initialData.pagination}
					onPaginationChange={tableState.onPaginationChange}
					sorting={tableState.sorting}
					onSortingChange={tableState.onSortingChange}
					renderExpandedRow={(row) => (
						<PositionList workLocationId={row.original.id} />
					)}
					emptyState={{
						title: 'No work locations found',
						description: 'Get started by adding your first work location.',
						action: <AddLocationButton clientsList={clientsList} />,
					}}
				/>
			</div>
		</LocationsProvider>
	);
};
