import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function RegisterLoading() {
	return (
		<Card className="w-full max-w-md">
			<CardHeader className="space-y-1 text-center">
				{/* Logo skeleton */}
				<div className="mb-4 flex justify-center">
					<Skeleton className="h-12 w-12 rounded-lg" />
				</div>
				<Skeleton className="mx-auto h-8 w-48" />
				<Skeleton className="mx-auto h-4 w-64" />
			</CardHeader>
			<CardContent className="space-y-4">
				{/* Organization name */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-10 w-full" />
				</div>
				{/* Name fields */}
				<div className="grid gap-4 sm:grid-cols-2">
					<div className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-10 w-full" />
					</div>
					<div className="space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-10 w-full" />
					</div>
				</div>
				{/* Email */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-12" />
					<Skeleton className="h-10 w-full" />
				</div>
				{/* Password */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-16" />
					<Skeleton className="h-10 w-full" />
				</div>
				{/* Confirm password */}
				<div className="space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-10 w-full" />
				</div>
				{/* Button */}
				<Skeleton className="h-10 w-full" />
				{/* Link */}
				<Skeleton className="mx-auto h-4 w-48" />
			</CardContent>
		</Card>
	);
}
