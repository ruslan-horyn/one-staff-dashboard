'use client';

import type { SortingState } from '@tanstack/react-table';
import { PlusIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { useServerAction } from '@/hooks/useServerAction';
import { useTableParams } from '@/hooks/useTableParams';
import { getClients } from '@/services/clients/actions';
import type { PaginatedResult } from '@/services/shared/pagination';
import { isSuccess } from '@/services/shared/result';
import type { Client } from '@/types/client';

import { useClientDialogs } from '../_hooks/useClientDialogs';
import { ClientDeleteDialog } from './ClientDeleteDialog';
import { ClientFormDialog } from './ClientFormDialog';
import { createColumns } from './columns';

// Hoisted static JSX element to avoid recreation on every render
const plusIcon = <PlusIcon className="mr-2 size-4" aria-hidden="true" />;

interface ClientDataTableProps {
	initialData: PaginatedResult<Client>;
}

export const ClientDataTable = ({ initialData }: ClientDataTableProps) => {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [data, setData] = useState(initialData);

	// Sync state when initialData changes (e.g., after router.refresh())
	useEffect(() => {
		setData(initialData);
	}, [initialData]);

	// Dialog state management
	const { formDialog, deleteDialog } = useClientDialogs();

	// Table params (URL synced)
	const {
		page,
		pageSize,
		sortBy,
		sortOrder,
		setPage,
		setPageSize,
		setSorting,
	} = useTableParams({
		defaultSortBy: 'created_at',
		defaultSortOrder: 'desc',
	});

	const { execute: fetchClients, isPending: isRefreshing } =
		useServerAction(getClients);

	// Refresh data from server
	const refreshData = useCallback(async () => {
		const search = searchParams.get('search') || undefined;
		const result = await fetchClients({
			page,
			pageSize,
			sortBy:
				sortBy === 'name' || sortBy === 'created_at' ? sortBy : 'created_at',
			sortOrder,
			search,
			includeDeleted: false,
		});
		if (isSuccess(result)) {
			setData(result.data);
		}
	}, [fetchClients, page, pageSize, sortBy, sortOrder, searchParams]);

	// Sorting state conversion
	const sorting: SortingState = useMemo(
		() => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
		[sortBy, sortOrder]
	);

	const handleSortingChange = useCallback(
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

	const handlePaginationChange = useCallback(
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

	const columns = useMemo(
		() =>
			createColumns({
				onEdit: formDialog.open,
				onDelete: deleteDialog.open,
			}),
		[formDialog.open, deleteDialog.open]
	);

	// Memoized callbacks to prevent unnecessary re-renders
	const handleOpenFormDialog = useCallback(() => {
		formDialog.open();
	}, [formDialog.open]);

	const handleFormSuccess = useCallback(
		(isEdit: boolean) => {
			formDialog.close();
			toast.success(isEdit ? 'Client updated' : 'Client created');
			refreshData();
		},
		[formDialog.close, refreshData]
	);

	const handleDeleteSuccess = useCallback(() => {
		deleteDialog.close();
		toast.success('Client deleted');
		refreshData();
	}, [deleteDialog.close, refreshData]);

	return (
		<div className="space-y-4">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<SearchInput
					placeholder="Search clients..."
					syncWithUrlParam="search"
					minChars={3}
					className="w-full sm:max-w-xs"
				/>
				<Button onClick={handleOpenFormDialog}>
					{plusIcon}
					Add Client
				</Button>
			</div>

			<DataTable
				columns={columns}
				data={data.data}
				pagination={data.pagination}
				onPaginationChange={handlePaginationChange}
				sorting={sorting}
				onSortingChange={handleSortingChange}
				isLoading={isRefreshing}
				emptyState={{
					title: 'No clients found',
					description: 'Get started by adding your first client.',
					action: (
						<Button onClick={handleOpenFormDialog}>
							{plusIcon}
							Add Client
						</Button>
					),
				}}
			/>

			<ClientFormDialog
				open={formDialog.isOpen}
				onOpenChange={formDialog.close}
				client={formDialog.data}
				triggerRef={formDialog.triggerRef}
				onSuccess={handleFormSuccess}
			/>

			{deleteDialog.data && (
				<ClientDeleteDialog
					open={deleteDialog.isOpen}
					onOpenChange={deleteDialog.close}
					client={deleteDialog.data}
					triggerRef={deleteDialog.triggerRef}
					onSuccess={handleDeleteSuccess}
				/>
			)}
		</div>
	);
};
