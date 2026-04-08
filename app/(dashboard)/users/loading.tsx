import { PageContainer } from '@/components/layout/pageContainer';
import { PageHeader } from '@/components/layout/pageHeader';
import { DataTableSkeleton } from '@/components/ui/data-table/data-table-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

export default function UsersLoading() {
	return (
		<PageContainer>
			<PageHeader title="Users" actions={<Skeleton className="h-9 w-36" />} />
			<div className="space-y-4">
				<Skeleton className="h-9 w-64" />
				<DataTableSkeleton columns={5} rows={10} />
			</div>
		</PageContainer>
	);
}
