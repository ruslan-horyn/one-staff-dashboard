import { Skeleton } from '@/components/ui/skeleton';

const DashboardLoading = () => {
	return (
		<div className="p-4 md:p-6">
			{/* Page header skeleton */}
			<div className="flex flex-col gap-2 pb-4 md:flex-row md:items-center md:justify-between md:pb-6">
				<div className="space-y-2">
					<Skeleton className="h-8 w-48" />
					<Skeleton className="h-4 w-72" />
				</div>
			</div>
			{/* Content skeleton */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Skeleton className="h-32 rounded-lg" />
				<Skeleton className="h-32 rounded-lg" />
				<Skeleton className="h-32 rounded-lg" />
				<Skeleton className="h-32 rounded-lg" />
			</div>
			<div className="mt-4">
				<Skeleton className="h-64 rounded-lg" />
			</div>
		</div>
	);
};

export default DashboardLoading;
