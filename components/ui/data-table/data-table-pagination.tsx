'use client';

import {
	ChevronLeftIcon,
	ChevronRightIcon,
	ChevronsLeftIcon,
	ChevronsRightIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils/cn';

import { Button } from '../button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '../select';

interface DataTablePaginationProps {
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (size: number) => void;
	pageSizeOptions?: number[];
	className?: string;
}

function DataTablePagination({
	page,
	pageSize,
	totalItems,
	totalPages,
	onPageChange,
	onPageSizeChange,
	pageSizeOptions = [10, 20, 50],
	className,
}: DataTablePaginationProps) {
	const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
	const endItem = Math.min(page * pageSize, totalItems);

	const canGoPrevious = page > 1;
	const canGoNext = page < totalPages;

	return (
		<div
			data-slot="data-table-pagination"
			className={cn(
				'flex flex-col items-center justify-between gap-4 px-2 sm:flex-row',
				className
			)}
		>
			<div
				data-slot="data-table-pagination-info"
				className="text-muted-foreground text-sm"
			>
				Showing {startItem}-{endItem} of {totalItems} items
			</div>

			<div className="flex items-center gap-6 lg:gap-8">
				<div className="flex items-center gap-2">
					<p className="font-medium text-sm">Rows per page</p>
					<Select
						value={pageSize.toString()}
						onValueChange={(value) => onPageSizeChange(Number(value))}
					>
						<SelectTrigger className="h-8 w-[70px]">
							<SelectValue placeholder={pageSize.toString()} />
						</SelectTrigger>
						<SelectContent>
							{pageSizeOptions.map((size) => (
								<SelectItem key={size} value={size.toString()}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className="flex items-center gap-2">
					<div className="flex w-[100px] items-center justify-center font-medium text-sm">
						Page {page} of {totalPages || 1}
					</div>

					<div className="flex items-center gap-1">
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => onPageChange(1)}
							disabled={!canGoPrevious}
							aria-label="Go to first page"
						>
							<ChevronsLeftIcon className="size-4" aria-hidden="true" />
						</Button>
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => onPageChange(page - 1)}
							disabled={!canGoPrevious}
							aria-label="Go to previous page"
						>
							<ChevronLeftIcon className="size-4" aria-hidden="true" />
						</Button>
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => onPageChange(page + 1)}
							disabled={!canGoNext}
							aria-label="Go to next page"
						>
							<ChevronRightIcon className="size-4" aria-hidden="true" />
						</Button>
						<Button
							variant="outline"
							size="icon-sm"
							onClick={() => onPageChange(totalPages)}
							disabled={!canGoNext}
							aria-label="Go to last page"
						>
							<ChevronsRightIcon className="size-4" aria-hidden="true" />
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}

export { DataTablePagination };
export type { DataTablePaginationProps };
