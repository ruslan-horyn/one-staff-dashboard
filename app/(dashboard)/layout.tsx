import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { AppSidebar } from '@/components/layout/appSidebar';
import { Header } from '@/components/layout/header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getCurrentUser } from '@/services/auth';
import { isSuccess } from '@/services/shared/result';
import { AuthToastHandler } from './_components/AuthToastHandler';

interface DashboardLayoutProps {
	children: React.ReactNode;
}

const DashboardLayout = async ({ children }: DashboardLayoutProps) => {
	const result = await getCurrentUser({});

	if (!isSuccess(result)) {
		redirect('/login');
	}

	const { user, profile } = result.data;
	const cookieStore = await cookies();
	const defaultOpen = cookieStore.get('sidebar_state')?.value !== 'false';

	const userData = {
		firstName: profile.first_name ?? '',
		lastName: profile.last_name ?? '',
		email: user.email ?? '',
		role: profile.role,
		organizationName: profile.organization_name ?? 'Organization',
	};

	return (
		<SidebarProvider defaultOpen={defaultOpen}>
			<Suspense fallback={null}>
				<AuthToastHandler />
			</Suspense>
			<AppSidebar user={userData} />
			<SidebarInset>
				<Header user={userData} />
				<main className="flex-1">{children}</main>
			</SidebarInset>
		</SidebarProvider>
	);
};

export default DashboardLayout;
