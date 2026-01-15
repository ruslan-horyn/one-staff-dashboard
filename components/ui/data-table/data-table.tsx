'use client';

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	type OnChangeFn,
	type Row,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { Fragment } from 'react';

import { useExpandableRows } from '@/hooks/useExpandableRows';
import { useRowSelection } from '@/hooks/useRowSelection';
import { cn } from '@/lib/utils/cn';
import type { PaginationMeta } from '@/services/shared/pagination';

import { Checkbox } from '../checkbox';
import { EmptyState, type EmptyStateProps } from '../empty-state';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../table';
import { DataTablePagination } from './data-table-pagination';
import { DataTableSkeleton } from './data-table-skeleton';

// ============================================================================
// Types
// ============================================================================

interface DataTablePaginationOptions {
	pagination?: PaginationMeta;
	onPaginationChange?: (page: number, pageSize: number) => void;
}

interface DataTableSortingOptions {
	sorting?: SortingState;
	onSortingChange?: OnChangeFn<SortingState>;
}

interface DataTableSelectionOptions<TData> {
	enableRowSelection?: boolean;
	onRowSelectionChange?: (rows: TData[]) => void;
}

interface DataTableExpandOptions<TData> {
	renderExpandedRow?: (row: Row<TData>) => React.ReactNode;
	allowMultipleExpanded?: boolean;
}

interface DataTableStateOptions {
	isLoading?: boolean;
	emptyState?: EmptyStateProps;
}

interface DataTableProps<TData, TValue>
	extends DataTablePaginationOptions,
		DataTableSortingOptions,
		DataTableSelectionOptions<TData>,
		DataTableExpandOptions<TData>,
		DataTableStateOptions {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	className?: string;
}

// ============================================================================
// Internal Components
// ============================================================================

interface SelectionCheckboxProps {
	checked: boolean | 'indeterminate';
	onCheckedChange: (checked: boolean) => void;
	ariaLabel: string;
}

function SelectionCheckbox({
	checked,
	onCheckedChange,
	ariaLabel,
}: SelectionCheckboxProps) {
	return (
		<Checkbox
			checked={checked}
			onCheckedChange={(value) => onCheckedChange(!!value)}
			aria-label={ariaLabel}
		/>
	);
}

interface ExpandButtonProps {
	isExpanded: boolean;
	onToggle: () => void;
}

function ExpandButton({ isExpanded, onToggle }: ExpandButtonProps) {
	return (
		<button
			type="button"
			onClick={onToggle}
			className="rounded p-1 hover:bg-muted"
			aria-expanded={isExpanded}
			aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
		>
			{isExpanded ? (
				<ChevronDownIcon className="size-4" aria-hidden="true" />
			) : (
				<ChevronRightIcon className="size-4" aria-hidden="true" />
			)}
		</button>
	);
}

// ============================================================================
// Column Builders
// ============================================================================

function createSelectionColumn<TData, TValue>(): ColumnDef<TData, TValue> {
	return {
		id: 'select',
		header: ({ table }) => (
			<SelectionCheckbox
				checked={
					table.getIsAllPageRowsSelected() ||
					(table.getIsSomePageRowsSelected() && 'indeterminate')
				}
				onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
				ariaLabel="Select all"
			/>
		),
		cell: ({ row }) => (
			<SelectionCheckbox
				checked={row.getIsSelected()}
				onCheckedChange={(checked) => row.toggleSelected(checked)}
				ariaLabel="Select row"
			/>
		),
		enableSorting: false,
		enableHiding: false,
	} as ColumnDef<TData, TValue>;
}

function createExpandColumn<TData, TValue>(
	isExpanded: (rowId: string) => boolean,
	toggleRow: (rowId: string) => void
): ColumnDef<TData, TValue> {
	return {
		id: 'expand',
		header: () => null,
		cell: ({ row }) => (
			<ExpandButton
				isExpanded={isExpanded(row.id)}
				onToggle={() => toggleRow(row.id)}
			/>
		),
		enableSorting: false,
		enableHiding: false,
	} as ColumnDef<TData, TValue>;
}

// ============================================================================
// Main Component
// ============================================================================

function DataTable<TData, TValue>({
	columns,
	data,
	pagination,
	onPaginationChange,
	sorting,
	onSortingChange,
	renderExpandedRow,
	allowMultipleExpanded = false,
	enableRowSelection = false,
	onRowSelectionChange,
	isLoading = false,
	emptyState,
	className,
}: DataTableProps<TData, TValue>) {
	// Hooks
	const { rowSelection, onRowSelectionChange: handleRowSelectionChange } =
		useRowSelection({
			data,
			onSelectionChange: onRowSelectionChange,
		});

	const { expandedRows, isExpanded, toggleRow } = useExpandableRows({
		allowMultiple: allowMultipleExpanded,
	});

	// Build columns with optional selection and expand columns
	const tableColumns: ColumnDef<TData, TValue>[] = [
		...(enableRowSelection ? [createSelectionColumn<TData, TValue>()] : []),
		...(renderExpandedRow
			? [createExpandColumn<TData, TValue>(isExpanded, toggleRow)]
			: []),
		...columns,
	];

	// Initialize table
	const table = useReactTable({
		data,
		columns: tableColumns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		manualSorting: true,
		onSortingChange,
		onRowSelectionChange: enableRowSelection
			? handleRowSelectionChange
			: undefined,
		state: {
			sorting: sorting ?? [],
			rowSelection: enableRowSelection ? rowSelection : {},
		},
		enableRowSelection,
	});

	// Loading state
	if (isLoading) {
		return (
			<DataTableSkeleton columns={tableColumns.length} className={className} />
		);
	}

	// Empty state
	if (data.length === 0 && emptyState) {
		return <EmptyState {...emptyState} className={className} />;
	}

	return (
		<div data-slot="data-table" className={cn('w-full space-y-4', className)}>
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead
									key={header.id}
									aria-sort={
										header.column.getIsSorted()
											? header.column.getIsSorted() === 'asc'
												? 'ascending'
												: 'descending'
											: header.column.getCanSort()
												? 'none'
												: undefined
									}
								>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows.length ? (
						table.getRowModel().rows.map((row) => (
							<Fragment key={row.id}>
								<TableRow
									data-state={row.getIsSelected() ? 'selected' : undefined}
									aria-selected={row.getIsSelected() || undefined}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									))}
								</TableRow>
								{renderExpandedRow && expandedRows[row.id] && (
									<TableRow>
										<TableCell
											colSpan={tableColumns.length}
											className="bg-muted/30 p-4"
										>
											{renderExpandedRow(row)}
										</TableCell>
									</TableRow>
								)}
							</Fragment>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={tableColumns.length}
								className="h-24 text-center"
							>
								No results.
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>

			{pagination && onPaginationChange && (
				<DataTablePagination
					page={pagination.page}
					pageSize={pagination.pageSize}
					totalItems={pagination.totalItems}
					totalPages={pagination.totalPages}
					onPageChange={(page) => onPaginationChange(page, pagination.pageSize)}
					onPageSizeChange={(pageSize) => onPaginationChange(1, pageSize)}
				/>
			)}
		</div>
	);
}

export { DataTable };
export type { DataTableProps };
