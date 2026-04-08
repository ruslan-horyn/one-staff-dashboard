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
import type { CreateWorkLocationInput } from '@/services/work-locations/schemas';
import type { WorkLocation } from '@/types/work-location';
import { useDeleteLocation } from '../_hooks/useDeleteLocation';
import { useLocationForm } from '../_hooks/useLocationForm';
import { useUpdateLocation } from '../_hooks/useUpdateLocation';
import { LocationForm } from './LocationForm';
import { useLocationsContext } from './LocationsProvider';

interface LocationRowActionsProps {
	location: WorkLocation;
}

export const LocationRowActions = ({ location }: LocationRowActionsProps) => {
	const { onMutationSuccess, clientsList } = useLocationsContext();

	// --- Delete (declared first to avoid circular dependency) ---
	const deleteAction = useDeleteLocation({
		onSuccess: () => {
			onMutationSuccess();
			deleteModal.close();
		},
	});
	const deleteModal = useModalState<WorkLocation>({
		onClose: deleteAction.reset,
	});
	const deleteFocus = useDialogFocusRestore({
		triggerRef: deleteModal.triggerRef,
	});

	// --- Edit ---
	const editModal = useModalState<WorkLocation>();
	const updateAction = useUpdateLocation({
		onSuccess: onMutationSuccess,
		onSettled: editModal.close,
	});
	const editForm = useLocationForm({
		onSubmit: (data) => updateAction.execute({ id: location.id, ...data }),
	});
	const editFocus = useDialogFocusRestore({
		triggerRef: editModal.triggerRef,
	});

	const handleEditSubmit = (data: CreateWorkLocationInput) =>
		updateAction.execute({ id: location.id, ...data });

	const openEdit = () => {
		editForm.resetForEdit(location);
		editModal.open(location);
	};

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon-sm"
						aria-label={`Actions for ${location.name}`}
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
						onClick={() => deleteModal.open(location)}
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
						<DialogTitle>Edit Work Location</DialogTitle>
						<DialogDescription>
							Update the location information below.
						</DialogDescription>
					</DialogHeader>
					<LocationForm
						form={editForm.form}
						onSubmit={handleEditSubmit}
						isPending={editForm.isPending || updateAction.isPending}
						submitLabel="Save Changes"
						onCancel={editModal.close}
						clientsList={clientsList}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<AlertDialog open={deleteModal.isOpen} onOpenChange={deleteModal.close}>
				<AlertDialogContent onCloseAutoFocus={deleteFocus.onCloseAutoFocus}>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Work Location</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete <strong>{location.name}</strong>?
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
							onClick={() => deleteAction.execute(location)}
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
