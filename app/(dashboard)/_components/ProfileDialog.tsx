'use client';

import { toast } from 'sonner';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useServerAction } from '@/hooks/useServerAction';
import { updateProfile } from '@/services/users/actions';
import type { UserRole } from '@/types/common';

import { ProfileForm } from './ProfileForm';

interface ProfileDialogProps {
	open: boolean;
	onClose: () => void;
	user: {
		firstName: string;
		lastName: string;
		email: string;
		role: UserRole;
	};
}

export const ProfileDialog = ({ open, onClose, user }: ProfileDialogProps) => {
	const { execute, isPending } = useServerAction(updateProfile, {
		onSuccess: () => {
			toast.success('Profile updated');
			onClose();
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Profile</DialogTitle>
					<DialogDescription>
						Update your name. Email and role cannot be changed here.
					</DialogDescription>
				</DialogHeader>
				<ProfileForm
					defaultValues={{
						firstName: user.firstName,
						lastName: user.lastName,
					}}
					email={user.email}
					role={user.role}
					onSubmit={execute}
					isPending={isPending}
					onCancel={onClose}
				/>
			</DialogContent>
		</Dialog>
	);
};
