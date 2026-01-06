import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function LoginLoading() {
	return (
		<div className="space-y-6">
			<div className="flex flex-col items-center space-y-2">
				<Skeleton className="h-12 w-12 rounded-lg" />
				<Skeleton className="h-8 w-48" />
				<Skeleton className="h-4 w-36" />
			</div>

			<Card>
				<CardHeader className="pb-4">
					<Skeleton className="h-6 w-32" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-2">
						<Skeleton className="h-4 w-12" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-16" />
						<Skeleton className="h-10 w-full" />
					</div>
					<Skeleton className="h-10 w-full" />
				</CardContent>
			</Card>

			<div className="flex justify-center">
				<Skeleton className="h-4 w-36" />
			</div>
		</div>
	);
}
