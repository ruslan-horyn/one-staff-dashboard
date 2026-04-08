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
import { useClientForm } from '../_hooks/useClientForm';
import { useCreateClient } from '../_hooks/useCreateClient';
import { ClientForm } from './ClientForm';
import { useClientsContext } from './ClientsProvider';

export const AddClientButton = () => {
	const { onMutationSuccess } = useClientsContext();
	const modal = useModalState();

	const createAction = useCreateClient({
		onSuccess: onMutationSuccess,
		onSettled: modal.close,
	});

	const { form, isPending, resetForCreate } = useClientForm({
		onSubmit: createAction.execute,
	});

	const { onCloseAutoFocus } = useDialogFocusRestore({
		triggerRef: modal.triggerRef,
	});

	const openDialog = () => {
		resetForCreate();
		modal.open();
	};

	return (
		<>
			<Button onClick={openDialog}>
				<PlusIcon className="mr-2 size-4" aria-hidden="true" />
				Add Client
			</Button>

			<Dialog open={modal.isOpen} onOpenChange={modal.close}>
				<DialogContent onCloseAutoFocus={onCloseAutoFocus}>
					<DialogHeader>
						<DialogTitle>Add Client</DialogTitle>
						<DialogDescription>
							Fill in the details to add a new client.
						</DialogDescription>
					</DialogHeader>
					<ClientForm
						form={form}
						onSubmit={createAction.execute}
						isPending={isPending || createAction.isPending}
						submitLabel="Add Client"
						onCancel={modal.close}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};
