'use client';

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
import type { Position } from '@/types/position';

interface PositionDeleteDialogProps {
	position: Position | null;
	onConfirm: (id: string) => Promise<void>;
	onClose: () => void;
	isPending?: boolean;
	blockingError?: string;
}

export const PositionDeleteDialog = ({
	position,
	onConfirm,
	onClose,
	isPending = false,
	blockingError,
}: PositionDeleteDialogProps) => {
	const handleConfirm = async () => {
		if (!position) return;
		await onConfirm(position.id);
		onClose();
	};

	return (
		<AlertDialog open={!!position} onOpenChange={onClose}>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Delete Position</AlertDialogTitle>
					<AlertDialogDescription>
						Are you sure you want to delete{' '}
						<strong>{position?.name}</strong>? This action cannot be undone.
					</AlertDialogDescription>
				</AlertDialogHeader>
				{blockingError && (
					<div
						className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive"
						role="alert"
					>
						{blockingError}
					</div>
				)}
				<AlertDialogFooter>
					<AlertDialogCancel disabled={isPending}>
						Cancel
					</AlertDialogCancel>
					<DestructiveButton
						onClick={handleConfirm}
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
