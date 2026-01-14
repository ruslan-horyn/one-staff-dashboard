'use client';

import { ChevronUp, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useServerAction } from '@/hooks/useServerAction';
import { signOut } from '@/services/auth';
import type { UserRole } from '@/types/common';
import { getFullName, getInitials } from '@/utils';

interface UserMenuProps {
	user: {
		firstName: string;
		lastName: string;
		email: string;
		role: UserRole;
	};
}

export const UserMenu = ({ user }: UserMenuProps) => {
	const router = useRouter();
	const { execute: executeSignOut, isPending: isSigningOut } = useServerAction(
		signOut,
		{
			onSuccess: () => router.push('/login'),
		}
	);

	const initials = getInitials(user.firstName, user.lastName);
	const fullName = getFullName(user.firstName, user.lastName);
	const roleLabel = user.role === 'admin' ? 'Administrator' : 'Coordinator';

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				className="flex items-center gap-2 rounded-md p-2 hover:bg-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				aria-label="User menu"
			>
				<Avatar className="size-8">
					<AvatarFallback className="text-xs">{initials}</AvatarFallback>
				</Avatar>
				<ChevronUp className="size-4 text-muted-foreground" />
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuLabel className="font-normal">
					<div className="flex flex-col space-y-1">
						<p className="font-medium text-sm leading-none">{fullName}</p>
						<p className="text-muted-foreground text-xs leading-none">
							{user.email}
						</p>
						<Badge variant="secondary" className="mt-1 w-fit text-xs">
							{roleLabel}
						</Badge>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild>
						<Link href="/profile" className="flex cursor-pointer items-center">
							<User className="mr-2 size-4" />
							<span>Profile</span>
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
					<span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
