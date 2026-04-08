'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import type { WorkLocation } from '@/types/work-location';
import { LocationRowActions } from './LocationRowActions';

export const columns: ColumnDef<WorkLocation>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		cell: ({ row }) => (
			<span
				className="block max-w-[200px] truncate"
				title={row.getValue('name')}
			>
				{row.getValue('name')}
			</span>
		),
		enableSorting: true,
	},
	{
		accessorKey: 'client_id',
		header: 'Client',
		cell: ({ row }) => {
			const location = row.original as any;
			return (
				<span
					className="block max-w-[150px] truncate"
					title={location.clients?.name}
				>
					{location.clients?.name || '-'}
				</span>
			);
		},
		enableSorting: false,
	},
	{
		accessorKey: 'address',
		header: 'Address',
		cell: ({ row }) => (
			<span
				className="line-clamp-2 max-w-[200px]"
				title={row.getValue('address')}
			>
				{row.getValue('address')}
			</span>
		),
		enableSorting: false,
	},
	{
		accessorKey: 'email',
		header: 'Email',
		cell: ({ row }) => (
			<span
				className="block max-w-[200px] truncate"
				title={row.getValue('email') || '-'}
			>
				{row.getValue('email') || '-'}
			</span>
		),
		enableSorting: false,
	},
	{
		accessorKey: 'phone',
		header: 'Phone',
		cell: ({ row }) => (
			<span className="tabular-nums">{row.getValue('phone') || '-'}</span>
		),
		enableSorting: false,
	},
	{
		id: 'actions',
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => <LocationRowActions location={row.original} />,
		enableSorting: false,
	},
];
