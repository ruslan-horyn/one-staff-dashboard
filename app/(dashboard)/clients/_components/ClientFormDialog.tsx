'use client';

import type { RefObject } from 'react';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useDialogFocusRestore } from '@/hooks/useDialogFocusRestore';
import type { Client } from '@/types/client';

import { useClientForm } from '../_hooks/useClientForm';
import { ClientForm } from './ClientForm';

interface ClientFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	client: Client | null;
	triggerRef?: RefObject<HTMLElement | null>;
	onSuccess: (isEdit: boolean) => void;
}

export const ClientFormDialog = ({
	open,
	onOpenChange,
	client,
	triggerRef,
	onSuccess,
}: ClientFormDialogProps) => {
	const { form, isPending, isEdit, onSubmit } = useClientForm({
		client,
		isOpen: open,
		onSuccess: () => onSuccess(isEdit),
	});

	const { onCloseAutoFocus } = useDialogFocusRestore({ triggerRef });

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent onCloseAutoFocus={onCloseAutoFocus}>
				<DialogHeader>
					<DialogTitle>{isEdit ? 'Edit Client' : 'Add Client'}</DialogTitle>
					<DialogDescription>
						{isEdit
							? 'Update the client information below.'
							: 'Fill in the details to add a new client.'}
					</DialogDescription>
				</DialogHeader>

				<ClientForm
					form={form}
					onSubmit={onSubmit}
					isPending={isPending}
					isEdit={isEdit}
					onCancel={() => onOpenChange(false)}
				/>
			</DialogContent>
		</Dialog>
	);
};
