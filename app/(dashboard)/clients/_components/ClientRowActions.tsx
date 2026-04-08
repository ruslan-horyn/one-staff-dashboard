'use client';

import { MoreHorizontalIcon, PencilIcon, TrashIcon } from 'lucide-react';
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
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDialogFocusRestore } from '@/hooks/useDialogFocusRestore';
import { useModalState } from '@/hooks/useModalState';
import type { CreateClientInput } from '@/services/clients/schemas';
import type { Client } from '@/types/client';
import { useClientForm } from '../_hooks/useClientForm';
import { useDeleteClient } from '../_hooks/useDeleteClient';
import { useUpdateClient } from '../_hooks/useUpdateClient';
import { ClientForm } from './ClientForm';
import { useClientsContext } from './ClientsProvider';

export const ClientRowActions = ({ client }: { client: Client }) => {
	const { onMutationSuccess } = useClientsContext();

	// --- Delete (declared first to avoid circular dependency) ---
	const deleteAction = useDeleteClient({
		onSuccess: () => {
			onMutationSuccess();
			deleteModal.close();
		},
	});
	const deleteModal = useModalState<Client>({
		onClose: deleteAction.reset,
	});
	const deleteFocus = useDialogFocusRestore({
		triggerRef: deleteModal.triggerRef,
	});

	// --- Edit ---
	const editModal = useModalState<Client>();
	const updateAction = useUpdateClient({
		onSuccess: onMutationSuccess,
		onSettled: editModal.close,
	});
	const editForm = useClientForm({
		onSubmit: (data) => updateAction.execute({ id: client.id, ...data }),
	});
	const editFocus = useDialogFocusRestore({
		triggerRef: editModal.triggerRef,
	});

	const handleEditSubmit = (data: CreateClientInput) =>
		updateAction.execute({ id: client.id, ...data });

	const openEdit = () => {
		editForm.resetForEdit(client);
		editModal.open(client);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label={`Actions for ${client.name}`}
					>
						<MoreHorizontalIcon className="size-4" aria-hidden="true" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={openEdit}>
						<PencilIcon className="mr-2 size-4" aria-hidden="true" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => deleteModal.open(client)}
						className="text-destructive focus:text-destructive"
					>
						<TrashIcon className="mr-2 size-4" aria-hidden="true" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Edit Dialog */}
			<Dialog open={editModal.isOpen} onOpenChange={editModal.close}>
				<DialogContent onCloseAutoFocus={editFocus.onCloseAutoFocus}>
					<DialogHeader>
						<DialogTitle>Edit Client</DialogTitle>
						<DialogDescription>
							Update the client information below.
						</DialogDescription>
					</DialogHeader>
					<ClientForm
						form={editForm.form}
						onSubmit={handleEditSubmit}
						isPending={editForm.isPending || updateAction.isPending}
						submitLabel="Save Changes"
						onCancel={editModal.close}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<AlertDialog open={deleteModal.isOpen} onOpenChange={deleteModal.close}>
				<AlertDialogContent onCloseAutoFocus={deleteFocus.onCloseAutoFocus}>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Client</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete <strong>{client.name}</strong>?
							This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					{deleteAction.blockingError && (
						<div
							className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm"
							role="alert"
						>
							{deleteAction.blockingError}
						</div>
					)}
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteAction.isPending}>
							Cancel
						</AlertDialogCancel>
						<DestructiveButton
							onClick={() => deleteAction.execute(client)}
							disabled={!!deleteAction.blockingError}
							isPending={deleteAction.isPending}
							loadingText="Deleting..."
						>
							Delete
						</DestructiveButton>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
