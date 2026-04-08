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
import type { CreateWorkerInput } from '@/services/workers/schemas';
import type { Worker } from '@/types/worker';
import { useDeleteWorker } from '../_hooks/useDeleteWorker';
import { useUpdateWorker } from '../_hooks/useUpdateWorker';
import { useWorkerForm } from '../_hooks/useWorkerForm';
import { WorkerForm } from './WorkerForm';
import { useWorkersContext } from './WorkersProvider';

export const WorkerRowActions = ({ worker }: { worker: Worker }) => {
	const { onMutationSuccess } = useWorkersContext();
	const workerName = `${worker.first_name} ${worker.last_name}`;

	// --- Delete (declared first to avoid circular dependency) ---
	const deleteAction = useDeleteWorker({
		onSuccess: () => {
			onMutationSuccess();
			deleteModal.close();
		},
	});
	const deleteModal = useModalState<Worker>({
		onClose: deleteAction.reset,
	});
	const deleteFocus = useDialogFocusRestore({
		triggerRef: deleteModal.triggerRef,
	});

	// --- Edit ---
	const editModal = useModalState<Worker>();
	const updateAction = useUpdateWorker({
		onSuccess: onMutationSuccess,
		onSettled: editModal.close,
	});
	const editForm = useWorkerForm({
		onSubmit: (data) => updateAction.execute({ id: worker.id, ...data }),
	});
	const editFocus = useDialogFocusRestore({
		triggerRef: editModal.triggerRef,
	});

	const handleEditSubmit = (data: CreateWorkerInput) =>
		updateAction.execute({ id: worker.id, ...data });

	const openEdit = () => {
		editForm.resetForEdit(worker);
		editModal.open(worker);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						data-testid="row-actions"
						aria-label={`Actions for ${workerName}`}
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
						onClick={() => deleteModal.open(worker)}
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
						<DialogTitle>Edit Worker</DialogTitle>
						<DialogDescription>
							Update the worker information below.
						</DialogDescription>
					</DialogHeader>
					<WorkerForm
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
						<AlertDialogTitle>Delete Worker</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete <strong>{workerName}</strong>?
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
							onClick={() => deleteAction.execute(worker)}
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
