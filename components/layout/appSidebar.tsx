'use client';

import { ChevronUp, Home, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarSeparator,
} from '@/components/ui/sidebar';
import { useServerAction } from '@/hooks/useServerAction';
import { signOut } from '@/services/auth';
import type { UserRole } from '@/types/common';
import { getFullName, getInitials } from '@/utils';
import { adminNavItems, mainNavItems } from './constants';
import { SidebarNav } from './sidebarNav';

interface AppSidebarProps {
	user: {
		firstName: string;
		lastName: string;
		email: string;
		role: UserRole;
		organizationName: string;
	};
}

export const AppSidebar = ({ user }: AppSidebarProps) => {
	const router = useRouter();
	const { execute: executeSignOut, isPending: isSigningOut } = useServerAction(
		signOut,
		{
			onSuccess: () => router.push('/login'),
		}
	);

	const initials = getInitials(user.firstName, user.lastName);
	const fullName = getFullName(user.firstName, user.lastName);
	const isAdmin = user.role === 'admin';

	return (
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton size="lg" asChild>
							<Link href="/">
								<div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
									<Home className="size-4" />
								</div>
								<div className="grid flex-1 text-left text-sm leading-tight">
									<span className="truncate font-semibold">One Staff</span>
									<span className="truncate text-xs">
										{user.organizationName}
									</span>
								</div>
							</Link>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Main</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarNav items={mainNavItems} aria-label="Main navigation" />
					</SidebarGroupContent>
				</SidebarGroup>
				{isAdmin && (
					<>
						<SidebarSeparator />
						<SidebarGroup>
							<SidebarGroupLabel>Administration</SidebarGroupLabel>
							<SidebarGroupContent>
								<SidebarNav
									items={adminNavItems}
									aria-label="Admin navigation"
								/>
							</SidebarGroupContent>
						</SidebarGroup>
					</>
				)}
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<SidebarMenuButton
									size="lg"
									className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								>
									<Avatar className="size-8 rounded-lg">
										<AvatarFallback className="rounded-lg">
											{initials}
										</AvatarFallback>
									</Avatar>
									<div className="grid flex-1 text-left text-sm leading-tight">
										<span className="truncate font-semibold">{fullName}</span>
										<span className="truncate text-xs">{user.email}</span>
									</div>
									<ChevronUp className="ml-auto size-4" />
								</SidebarMenuButton>
							</DropdownMenuTrigger>
							<DropdownMenuContent
								className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
								side="top"
								align="end"
								sideOffset={4}
							>
								<DropdownMenuLabel className="p-0 font-normal">
									<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
										<Avatar className="size-8 rounded-lg">
											<AvatarFallback className="rounded-lg">
												{initials}
											</AvatarFallback>
										</Avatar>
										<div className="grid flex-1 text-left text-sm leading-tight">
											<span className="truncate font-semibold">{fullName}</span>
											<span className="truncate text-xs">{user.email}</span>
										</div>
									</div>
								</DropdownMenuLabel>
								<DropdownMenuSeparator />
								<DropdownMenuGroup>
									<DropdownMenuItem asChild>
										<Link href="/profile" className="cursor-pointer">
											<User className="mr-2 size-4" />
											Profile
										</Link>
									</DropdownMenuItem>
								</DropdownMenuGroup>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									variant="destructive"
									onClick={executeSignOut}
									disabled={isSigningOut}
								>
									<LogOut className="mr-2 size-4" />
									{isSigningOut ? 'Signing out...' : 'Sign out'}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
};
