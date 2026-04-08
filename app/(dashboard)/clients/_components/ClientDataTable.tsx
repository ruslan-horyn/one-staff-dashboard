'use client';

import { useRouter } from 'next/navigation';

import { DataTable } from '@/components/ui/data-table/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { useDataTableState } from '@/hooks/useDataTableState';
import type { PaginatedResult } from '@/services/shared/pagination';
import type { Client } from '@/types/client';

import { AddClientButton } from './AddClientButton';
import { ClientsProvider } from './ClientsProvider';
import { columns } from './columns';

export const ClientDataTable = ({
	initialData,
}: {
	initialData: PaginatedResult<Client>;
}) => {
	const router = useRouter();
	const tableState = useDataTableState({
		defaultSortBy: 'created_at',
		defaultSortOrder: 'desc',
	});

	return (
		<ClientsProvider onMutationSuccess={() => router.refresh()}>
			<div className="space-y-4">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<SearchInput
						placeholder="Search clients..."
						syncWithUrlParam="search"
						minChars={3}
						className="w-full sm:max-w-xs"
					/>
					<AddClientButton />
				</div>

				<DataTable
					columns={columns}
					data={initialData.data}
					pagination={initialData.pagination}
					onPaginationChange={tableState.onPaginationChange}
					sorting={tableState.sorting}
					onSortingChange={tableState.onSortingChange}
					emptyState={{
						title: 'No clients found',
						description: 'Get started by adding your first client.',
						action: <AddClientButton />,
					}}
				/>
			</div>
		</ClientsProvider>
	);
};
