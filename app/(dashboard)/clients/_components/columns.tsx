'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontalIcon, PencilIcon, TrashIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Client } from '@/types/client';

interface ColumnActionsProps {
	onEdit: (client: Client) => void;
	onDelete: (client: Client) => void;
}

export const createColumns = ({
	onEdit,
	onDelete,
}: ColumnActionsProps): ColumnDef<Client>[] => [
	{
		accessorKey: 'name',
		header: ({ column }) => (
			<DataTableColumnHeader column={column} title="Name" />
		),
		cell: ({ row }) => {
			const name = row.getValue('name') as string;
			return (
				<span className="block max-w-[200px] truncate" title={name}>
					{name}
				</span>
			);
		},
		enableSorting: true,
	},
	{
		accessorKey: 'email',
		header: 'Email',
		cell: ({ row }) => {
			const email = row.getValue('email') as string;
			return (
				<span className="block max-w-[200px] truncate" title={email}>
					{email}
				</span>
			);
		},
		enableSorting: false,
	},
	{
		accessorKey: 'phone',
		header: 'Phone',
		cell: ({ row }) => {
			const phone = row.getValue('phone') as string;
			return <span className="tabular-nums">{phone}</span>;
		},
		enableSorting: false,
	},
	{
		accessorKey: 'address',
		header: 'Address',
		enableSorting: false,
		cell: ({ row }) => {
			const address = row.getValue('address') as string;
			return (
				<span className="line-clamp-2 max-w-[200px]" title={address}>
					{address}
				</span>
			);
		},
	},
	{
		id: 'actions',
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => {
			const client = row.original;

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label={`Actions for ${client.name}`}
						>
							<MoreHorizontalIcon className="size-4" aria-hidden="true" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => onEdit(client)}>
							<PencilIcon className="mr-2 size-4" aria-hidden="true" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => onDelete(client)}
							className="text-destructive focus:text-destructive"
						>
							<TrashIcon className="mr-2 size-4" aria-hidden="true" />
							Delete
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
		enableSorting: false,
	},
];
