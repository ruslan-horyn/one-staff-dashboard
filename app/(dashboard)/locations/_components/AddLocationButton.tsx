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
import { useCreateLocation } from '../_hooks/useCreateLocation';
import { useLocationForm } from '../_hooks/useLocationForm';
import { LocationForm } from './LocationForm';
import { useLocationsContext } from './LocationsProvider';

export const AddLocationButton = ({
	clientsList,
}: {
	clientsList: { id: string; name: string }[];
}) => {
	const { onMutationSuccess } = useLocationsContext();
	const modal = useModalState();

	const createAction = useCreateLocation({
		onSuccess: onMutationSuccess,
		onSettled: modal.close,
	});

	const { form, isPending, resetForCreate } = useLocationForm({
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
			<Button data-testid="add-location" onClick={openDialog}>
				<PlusIcon className="mr-2 size-4" aria-hidden="true" />
				Add Location
			</Button>

			<Dialog open={modal.isOpen} onOpenChange={modal.close}>
				<DialogContent onCloseAutoFocus={onCloseAutoFocus}>
					<DialogHeader>
						<DialogTitle>Add Work Location</DialogTitle>
						<DialogDescription>
							Fill in the details to add a new work location.
						</DialogDescription>
					</DialogHeader>
					<LocationForm
						form={form}
						onSubmit={createAction.execute}
						isPending={isPending || createAction.isPending}
						submitLabel="Add Location"
						onCancel={modal.close}
						clientsList={clientsList}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};
