import { PageContainer } from '@/components/layout/pageContainer';
import { PageHeader } from '@/components/layout/pageHeader';
import { DataTableSkeleton } from '@/components/ui/data-table/data-table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function LocationsLoading() {
	return (
		<PageContainer>
			<PageHeader
				title="Work Locations"
				actions={<Skeleton className="h-9 w-28" />}
			/>
			<div className="space-y-4">
				<Skeleton className="h-9 w-64" />
				<DataTableSkeleton columns={6} rows={10} />
			</div>
		</PageContainer>
	);
}
