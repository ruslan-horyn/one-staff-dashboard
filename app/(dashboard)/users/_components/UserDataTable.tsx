'use client';

import { useRouter } from 'next/navigation';

import { DataTable } from '@/components/ui/data-table/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { useDataTableState } from '@/hooks/useDataTableState';
import type { PaginatedResult } from '@/services/shared/pagination';
import type { UserProfile } from '@/services/users/actions';
import { columns } from './columns';
import { InviteUserDialog } from './InviteUserDialog';
import { UsersProvider } from './UsersProvider';

export const UserDataTable = ({
	initialData,
}: {
	initialData: PaginatedResult<UserProfile>;
}) => {
	const router = useRouter();
	const tableState = useDataTableState({
		defaultSortBy: 'name',
		defaultSortOrder: 'asc',
	});

	return (
		<UsersProvider onMutationSuccess={() => router.refresh()}>
			<div className="space-y-4">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<SearchInput
						placeholder="Search users..."
						syncWithUrlParam="search"
						minChars={2}
						className="w-full sm:max-w-xs"
					/>
					<InviteUserDialog />
				</div>

				<DataTable
					columns={columns}
					data={initialData.data}
					pagination={initialData.pagination}
					onPaginationChange={tableState.onPaginationChange}
					sorting={tableState.sorting}
					onSortingChange={tableState.onSortingChange}
					emptyState={{
						title: 'No users found',
						description:
							'Get started by inviting a coordinator to your organization.',
						action: <InviteUserDialog />,
					}}
				/>
			</div>
		</UsersProvider>
	);
};
