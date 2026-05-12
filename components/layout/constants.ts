import {
	BarChart3,
	Building2,
	Home,
	MapPin,
	UserCog,
	Users,
} from 'lucide-react';
import type { Route } from 'next';

import { routes } from '@/lib/routes';

export interface NavItem {
	title: string;
	href: Route;
	icon: React.ComponentType<{ className?: string }>;
}

export const mainNavItems: NavItem[] = [
	{ title: 'Board', href: routes.board, icon: Home },
	{ title: 'Workers', href: routes.workers, icon: Users },
	{ title: 'Reports', href: routes.reports, icon: BarChart3 },
];

export const adminNavItems: NavItem[] = [
	{ title: 'Clients', href: routes.clients, icon: Building2 },
	{ title: 'Locations', href: routes.locations, icon: MapPin },
	{ title: 'Users', href: routes.users, icon: UserCog },
];
