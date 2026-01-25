'use client';

import type { RefObject } from 'react';

import {
	AlertDialog,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DestructiveButton } from '@/components/ui/destructive-button';
import { useDialogFocusRestore } from '@/hooks/useDialogFocusRestore';
import type { Client } from '@/types/client';

import { useClientDeleteWithReset } from '../_hooks/useClientDelete';

interface ClientDeleteDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	client: Client;
	triggerRef?: RefObject<HTMLElement | null>;
	onSuccess: () => void;
}

export const ClientDeleteDialog = ({
	open,
	onOpenChange,
	client,
	triggerRef,
	onSuccess,
}: ClientDeleteDialogProps) => {
	const { execute, isPending, blockingError } = useClientDeleteWithReset({
		isOpen: open,
		onSuccess,
		onNonBlockingError: () => onOpenChange(false),
	});

	const { onCloseAutoFocus } = useDialogFocusRestore({ triggerRef });

	const handleDelete = () => execute(client);

	return (
		<AlertDialog open={open} onOpenChange={onOpenChange}>
			<AlertDialogContent onCloseAutoFocus={onCloseAutoFocus}>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Client</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete <strong>{client.name}</strong>? This
						action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>

				{blockingError && (
					<div
						className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm"
						role="alert"
					>
						{blockingError}
					</div>
				)}

				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
					<DestructiveButton
						onClick={handleDelete}
						disabled={!!blockingError}
						isPending={isPending}
						loadingText="Deleting..."
					>
						Delete
					</DestructiveButton>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
};
