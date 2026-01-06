// Example: app/(auth)/login/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function LoginLoading() {
  return (
    <Card>
      <CardHeader className="space-y-1">
        {/* Logo placeholder skeleton */}
        <div className="flex justify-center mb-4">
          <Skeleton className="w-12 h-12 rounded-full" />
        </div>
        {/* Title skeleton */}
        <Skeleton className="h-8 w-24 mx-auto" />
        {/* Description skeleton */}
        <Skeleton className="h-4 w-48 mx-auto" />
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email field skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Password field skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
        {/* Submit button skeleton */}
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
}
