'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import type { UserProfile } from '@/services/users/actions';

import { UserStatusActions } from './UserStatusActions';

export const columns: ColumnDef<UserProfile>[] = [
	{
		id: 'name',
		accessorFn: (row) => `${row.first_name} ${row.last_name}`,
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		cell: ({ row }) => (
			<span className="block max-w-[200px] truncate font-medium">
				{row.original.first_name} {row.original.last_name}
			</span>
		),
		enableSorting: true,
	},
	{
		accessorKey: 'email',
		header: 'Email',
		cell: ({ row }) => (
			<span
				className="block max-w-[200px] truncate"
				title={row.getValue('email')}
			>
				{row.getValue('email')}
			</span>
		),
		enableSorting: false,
	},
	{
		accessorKey: 'role',
		header: 'Role',
		cell: ({ row }) => {
			const role = row.getValue<'admin' | 'coordinator'>('role');
			return (
				<Badge variant={role === 'admin' ? 'default' : 'secondary'}>
					{role === 'admin' ? 'Administrator' : 'Coordinator'}
				</Badge>
			);
		},
		enableSorting: false,
	},
	{
		id: 'status',
		header: 'Status',
		cell: ({ row }) => {
			const isBanned = row.original.is_banned;
			return (
				<Badge variant={isBanned ? 'destructive' : 'outline'}>
					{isBanned ? 'Inactive' : 'Active'}
				</Badge>
			);
		},
		enableSorting: false,
	},
	{
		id: 'actions',
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => <UserStatusActions user={row.original} />,
		enableSorting: false,
	},
];
