'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import type { Worker } from '@/types/worker';
import { BoardRowActions } from './BoardRowActions';

export const columns: ColumnDef<Worker>[] = [
	{
		accessorKey: 'full_name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Full Name" />
		),
		cell: ({ row }) => {
			const fullName = `${row.original.first_name} ${row.original.last_name}`;
			return (
				<span
					className="block max-w-[200px] truncate font-medium"
					title={fullName}
				>
					{fullName}
				</span>
			);
		},
		enableSorting: true,
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
		id: 'actions',
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => <BoardRowActions worker={row.original} />,
		enableSorting: false,
	},
];
