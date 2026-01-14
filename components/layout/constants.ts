import {
	BarChart3,
	Building2,
	Home,
	MapPin,
	UserCog,
	Users,
} from 'lucide-react';

export interface NavItem {
	title: string;
	href: string;
	icon: React.ComponentType<{ className?: string }>;
}

export const mainNavItems: NavItem[] = [
	{ title: 'Board', href: '/', icon: Home },
	{ title: 'Workers', href: '/workers', icon: Users },
	{ title: 'Reports', href: '/reports', icon: BarChart3 },
];

export const adminNavItems: NavItem[] = [
	{ title: 'Clients', href: '/clients', icon: Building2 },
	{ title: 'Locations', href: '/locations', icon: MapPin },
	{ title: 'Users', href: '/users', icon: UserCog },
];
