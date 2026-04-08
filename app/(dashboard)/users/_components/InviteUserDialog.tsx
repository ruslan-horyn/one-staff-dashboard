'use client';

import { PlusIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useDialogFocusRestore } from '@/hooks/useDialogFocusRestore';
import { useModalState } from '@/hooks/useModalState';

import { useInviteUser } from '../_hooks/useInviteUser';
import { InviteUserForm } from './InviteUserForm';
import { useUsersContext } from './UsersProvider';

export const InviteUserDialog = () => {
	const { onMutationSuccess } = useUsersContext();
	const modal = useModalState();

	const inviteAction = useInviteUser({
		onSuccess: () => {
			onMutationSuccess();
			modal.close();
		},
	});

	const { onCloseAutoFocus } = useDialogFocusRestore({
		triggerRef: modal.triggerRef,
	});

	return (
		<>
			<Button onClick={() => modal.open()}>
				<PlusIcon className="mr-2 size-4" aria-hidden="true" />
				Invite Coordinator
			</Button>

			<Dialog open={modal.isOpen} onOpenChange={modal.close}>
				<DialogContent onCloseAutoFocus={onCloseAutoFocus}>
					<DialogHeader>
						<DialogTitle>Invite Coordinator</DialogTitle>
						<DialogDescription>
							Send an invitation email to add a new coordinator to your
							organization.
						</DialogDescription>
					</DialogHeader>
					<InviteUserForm
						onSubmit={inviteAction.execute}
						isPending={inviteAction.isPending}
						onCancel={modal.close}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};
