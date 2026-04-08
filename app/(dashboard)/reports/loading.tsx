import { PageContainer } from '@/components/layout/pageContainer';
import { PageHeader } from '@/components/layout/pageHeader';
import { Skeleton } from '@/components/ui/skeleton';

export default function ReportsLoading() {
	return (
		<PageContainer>
			<PageHeader title="Reports" />
			<div className="space-y-6">
				{/* Filter section skeleton */}
				<div className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-3">
						<Skeleton className="h-10" />
						<Skeleton className="h-10" />
						<Skeleton className="h-10" />
					</div>
				</div>

				{/* Table skeleton */}
				<div className="space-y-3">
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
					<Skeleton className="h-10 w-full" />
				</div>
			</div>
		</PageContainer>
	);
}
