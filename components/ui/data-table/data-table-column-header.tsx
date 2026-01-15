'use client';

import type { Column } from '@tanstack/react-table';
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from 'lucide-react';
import type * as React from 'react';

import { cn } from '@/lib/utils/cn';

import { Button } from '../button';

interface DataTableColumnHeaderProps<TData, TValue>
	extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>;
	title: string;
}

function DataTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
}: DataTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort()) {
		return <div className={cn(className)}>{title}</div>;
	}

	const sorted = column.getIsSorted();

	return (
		<div className={cn('flex items-center space-x-2', className)}>
			<Button
				variant="ghost"
				size="sm"
				className="-ml-3 h-8 data-[state=open]:bg-accent"
				onClick={() => column.toggleSorting(sorted === 'asc')}
				aria-label={`Sort by ${title}`}
			>
				<span>{title}</span>
				{sorted === 'desc' ? (
					<ArrowDownIcon className="ml-2 size-4" aria-hidden="true" />
				) : sorted === 'asc' ? (
					<ArrowUpIcon className="ml-2 size-4" aria-hidden="true" />
				) : (
					<ArrowUpDownIcon className="ml-2 size-4" aria-hidden="true" />
				)}
			</Button>
		</div>
	);
}

export { DataTableColumnHeader };
export type { DataTableColumnHeaderProps };
