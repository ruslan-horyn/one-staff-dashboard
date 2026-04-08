'use client';

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useDialogFocusRestore } from '@/hooks/useDialogFocusRestore';
import type { UseModalStateReturn } from '@/hooks/useModalState';
import type { CreateAssignmentInput } from '@/services/assignments/schemas';
import type { Worker } from '@/types/worker';
import { useAssignWorker } from '../../_hooks/useAssignWorker';
import { AssignWorkerForm } from './AssignWorkerForm';
import { useBoardContext } from './BoardProvider';

interface AssignWorkerDialogProps {
	modal: UseModalStateReturn<Worker>;
}

export const AssignWorkerDialog = ({ modal }: AssignWorkerDialogProps) => {
	const { onMutationSuccess } = useBoardContext();
	const focus = useDialogFocusRestore({ triggerRef: modal.triggerRef });

	const assignAction = useAssignWorker({
		onSuccess: () => {
			onMutationSuccess();
			modal.close();
		},
		onSettled: modal.close,
	});

	const handleSubmit = async (data: CreateAssignmentInput) => {
		await assignAction.execute(data);
	};

	if (!modal.data) return null;

	const workerName = `${modal.data.first_name} ${modal.data.last_name}`;

	return (
		<Dialog open={modal.isOpen} onOpenChange={modal.close}>
			<DialogContent onCloseAutoFocus={focus.onCloseAutoFocus}>
				<DialogHeader>
					<DialogTitle>Assign Worker</DialogTitle>
					<DialogDescription>
						Create a new assignment for <strong>{workerName}</strong>.
					</DialogDescription>
				</DialogHeader>

				<AssignWorkerForm
					workerId={modal.data.id}
					onSubmit={handleSubmit}
					isPending={assignAction.isPending}
					onCancel={modal.close}
				/>
			</DialogContent>
		</Dialog>
	);
};
