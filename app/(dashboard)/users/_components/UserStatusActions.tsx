'use client';

import { UserCheckIcon, UserXIcon } from 'lucide-react';

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { DestructiveButton } from '@/components/ui/destructive-button';
import { useModalState } from '@/hooks/useModalState';
import type { UserProfile } from '@/services/users/actions';

import {
	useDeactivateUser,
	useReactivateUser,
} from '../_hooks/useDeactivateUser';
import { useUsersContext } from './UsersProvider';

interface UserStatusActionsProps {
	user: UserProfile;
}

export const UserStatusActions = ({ user }: UserStatusActionsProps) => {
	const { onMutationSuccess } = useUsersContext();
	const confirmModal = useModalState();

	const deactivateAction = useDeactivateUser({
		onSuccess: () => {
			onMutationSuccess();
			confirmModal.close();
		},
	});

	const reactivateAction = useReactivateUser({
		onSuccess: onMutationSuccess,
	});

	if (user.is_banned) {
		return (
			<Button
				variant="outline"
				size="sm"
				onClick={() => reactivateAction.execute({ userId: user.id })}
				disabled={reactivateAction.isPending}
				aria-label={`Reactivate ${user.first_name} ${user.last_name}`}
			>
				<UserCheckIcon className="mr-1 size-4" aria-hidden="true" />
				Reactivate
			</Button>
		);
	}

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				onClick={() => confirmModal.open()}
				aria-label={`Deactivate ${user.first_name} ${user.last_name}`}
			>
				<UserXIcon className="mr-1 size-4" aria-hidden="true" />
				Deactivate
			</Button>

			<AlertDialog open={confirmModal.isOpen} onOpenChange={confirmModal.close}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Deactivate User</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to deactivate{' '}
							<strong>
								{user.first_name} {user.last_name}
							</strong>
							? They will no longer be able to sign in.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deactivateAction.isPending}>
							Cancel
						</AlertDialogCancel>
						<DestructiveButton
							onClick={() => deactivateAction.execute({ userId: user.id })}
							isPending={deactivateAction.isPending}
							loadingText="Deactivating..."
						>
							Deactivate
						</DestructiveButton>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
