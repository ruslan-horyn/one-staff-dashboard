'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';

import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from './constants';

interface SidebarNavProps extends ComponentProps<'nav'> {
	items: NavItem[];
}

export const SidebarNav = ({ items, ...navProps }: SidebarNavProps) => {
	const pathname = usePathname();

	const isActive = (href: string) => {
		if (href === '/') {
			return pathname === '/';
		}
		return pathname.startsWith(href);
	};

	return (
		<nav {...navProps}>
			<SidebarMenu>
				{items.map((item) => (
					<SidebarMenuItem key={item.href}>
						<SidebarMenuButton
							asChild
							isActive={isActive(item.href)}
							tooltip={item.title}
						>
							<Link
								href={item.href}
								aria-current={isActive(item.href) ? 'page' : undefined}
							>
								<item.icon className="size-4" />
								<span>{item.title}</span>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				))}
			</SidebarMenu>
		</nav>
	);
};
