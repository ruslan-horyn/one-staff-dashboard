# File Templates

Standard templates for common Next.js App Router files.

## Page Template

```tsx
// app/(<group>)/<view>/page.tsx
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { MainComponent } from './_components/MainComponent';

export const metadata: Metadata = {
  title: 'Page Title | One Staff Dashboard',
  description: 'Page description for SEO',
};

interface PageProps {
  params: Promise<{ id?: string }>;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function PageName({ params, searchParams }: PageProps) {
  // Auth check (if needed)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Await params/searchParams
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;

  // Fetch data (if needed)
  // const data = await fetchData(resolvedParams.id);

  return (
    <div className="container py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Page Title</h1>
        <p className="text-muted-foreground mt-1">Page description</p>
      </header>

      <main>
        <MainComponent />
      </main>
    </div>
  );
}
```

## Layout Template

```tsx
// app/(<group>)/layout.tsx
interface LayoutProps {
  children: React.ReactNode;
}

export default function GroupLayout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
```

## Auth Layout Template

```tsx
// app/(auth)/layout.tsx
interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
```

## Dashboard Layout Template

```tsx
// app/(dashboard)/layout.tsx
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
```

## Loading Template

```tsx
// app/(<group>)/<view>/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container py-6">
      {/* Header skeleton */}
      <div className="mb-6 space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Content skeleton - adjust based on page content */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
```

## Loading Template - Form Page

```tsx
// app/(<group>)/<view>/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function FormLoading() {
  return (
    <div className="container py-6 max-w-md mx-auto">
      <Card>
        <CardHeader>
          <Skeleton className="h-7 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <Skeleton className="h-10 w-full mt-4" />
        </CardContent>
      </Card>
    </div>
  );
}
```

## Loading Template - Table Page

```tsx
// app/(<group>)/<view>/loading.tsx
import { Skeleton } from '@/components/ui/skeleton';

export default function TableLoading() {
  return (
    <div className="container py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Search/Filters */}
      <div className="flex gap-4 mb-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Table */}
      <div className="border rounded-md">
        {/* Header row */}
        <div className="border-b p-4 flex gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
        {/* Data rows */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border-b p-4 flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4 gap-2">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}
```

## Error Template

```tsx
// app/(<group>)/<view>/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container py-6">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground mb-4">
          An error occurred while loading this page.
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  );
}
```

## Not Found Template

```tsx
// app/(<group>)/<view>/not-found.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container py-6">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <FileQuestion className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Not Found</h2>
        <p className="text-muted-foreground mb-4">
          The requested resource could not be found.
        </p>
        <Button asChild>
          <Link href="/">Go back home</Link>
        </Button>
      </div>
    </div>
  );
}
```

## Component File Template

```tsx
// app/(<group>)/<view>/_components/ComponentName.tsx
'use client';

import { useState } from 'react';

interface ComponentNameProps {
  // Define props
  data?: DataType;
  onAction?: () => void;
}

export const ComponentName = ({ data, onAction }: ComponentNameProps) => {
  const [state, setState] = useState(false);

  return (
    <div>
      {/* Component content */}
    </div>
  );
};
```

## Server Component Template

```tsx
// app/(<group>)/<view>/_components/ServerComponent.tsx
import { createClient } from '@/lib/supabase/server';

interface ServerComponentProps {
  id: string;
}

export const ServerComponent = async ({ id }: ServerComponentProps) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('table')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return <div>Not found</div>;
  }

  return (
    <div>
      {/* Render data */}
    </div>
  );
};
```

## Folder Structure Reference

```
app/
├── (auth)/                    # Auth group (no sidebar)
│   ├── layout.tsx
│   ├── login/
│   │   ├── page.tsx
│   │   ├── loading.tsx
│   │   └── _components/
│   │       ├── LoginForm.tsx
│   │       └── LoginForm.test.tsx
│   ├── forgot-password/
│   └── reset-password/
│
├── (dashboard)/               # Dashboard group (with sidebar)
│   ├── layout.tsx
│   ├── page.tsx               # Board (main view)
│   ├── workers/
│   │   ├── page.tsx           # List
│   │   ├── new/
│   │   │   └── page.tsx       # Create form
│   │   └── [id]/
│   │       └── page.tsx       # Edit form
│   ├── clients/
│   ├── locations/
│   ├── reports/
│   └── profile/
│
└── admin/                     # Admin routes
    └── users/
```
