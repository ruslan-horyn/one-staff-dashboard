'use client';

import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { UserRole } from '@/types/common';
import { UserMenu } from './userMenu';

interface HeaderProps {
	user: {
		firstName: string;
		lastName: string;
		email: string;
		role: UserRole;
		organizationName: string;
	};
}

export const Header = ({ user }: HeaderProps) => {
	return (
		<header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4">
			<div className="flex items-center gap-2">
				<SidebarTrigger className="-ml-1" aria-label="Toggle sidebar" />
				<Separator orientation="vertical" className="mr-2 h-4" />
				<span className="font-semibold text-sm">One Staff Dashboard</span>
			</div>
			<div className="flex items-center gap-4">
				<span className="hidden text-muted-foreground text-sm md:block">
					{user.organizationName}
				</span>
				<UserMenu user={user} />
			</div>
		</header>
	);
};
