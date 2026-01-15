import { cn } from '@/lib/utils/cn';

import { Skeleton } from '../skeleton';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '../table';

interface DataTableSkeletonProps {
	columns: number;
	rows?: number;
	className?: string;
}

function DataTableSkeleton({
	columns,
	rows = 5,
	className,
}: DataTableSkeletonProps) {
	return (
		<div data-slot="data-table-skeleton" className={cn('w-full', className)}>
			<Table>
				<TableHeader>
					<TableRow>
						{Array.from({ length: columns }).map((_, i) => (
							<TableHead key={`header-${i.toString()}`}>
								<Skeleton className="h-4 w-24" />
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: rows }).map((_, rowIndex) => (
						<TableRow key={`row-${rowIndex.toString()}`}>
							{Array.from({ length: columns }).map((_, colIndex) => (
								<TableCell
									key={`cell-${rowIndex.toString()}-${colIndex.toString()}`}
								>
									<Skeleton className="h-4 w-full max-w-32" />
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export { DataTableSkeleton };
export type { DataTableSkeletonProps };
