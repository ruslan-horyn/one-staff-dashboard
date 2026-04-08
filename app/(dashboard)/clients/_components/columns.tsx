'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import type { Client } from '@/types/client';
import { ClientRowActions } from './ClientRowActions';

export const columns: ColumnDef<Client>[] = [
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
		accessorKey: 'phone',
		header: 'Phone',
		cell: ({ row }) => (
			<span className="tabular-nums">{row.getValue('phone')}</span>
		),
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
		id: 'actions',
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => <ClientRowActions client={row.original} />,
		enableSorting: false,
	},
];
