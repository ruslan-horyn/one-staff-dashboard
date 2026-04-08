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
import { useCreateWorker } from '../_hooks/useCreateWorker';
import { useWorkerForm } from '../_hooks/useWorkerForm';
import { WorkerForm } from './WorkerForm';
import { useWorkersContext } from './WorkersProvider';

export const AddWorkerButton = () => {
	const { onMutationSuccess } = useWorkersContext();
	const modal = useModalState();

	const createAction = useCreateWorker({
		onSuccess: onMutationSuccess,
		onSettled: modal.close,
	});

	const { form, isPending, resetForCreate } = useWorkerForm({
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
			<Button data-testid="add-worker" onClick={openDialog}>
				<PlusIcon className="mr-2 size-4" aria-hidden="true" />
				Add Worker
			</Button>

			<Dialog open={modal.isOpen} onOpenChange={modal.close}>
				<DialogContent onCloseAutoFocus={onCloseAutoFocus}>
					<DialogHeader>
						<DialogTitle>Add Worker</DialogTitle>
						<DialogDescription>
							Fill in the details to add a new worker.
						</DialogDescription>
					</DialogHeader>
					<WorkerForm
						form={form}
						onSubmit={createAction.execute}
						isPending={isPending || createAction.isPending}
						submitLabel="Add Worker"
						onCancel={modal.close}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};
