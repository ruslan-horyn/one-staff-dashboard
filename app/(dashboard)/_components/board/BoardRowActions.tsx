'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModalState } from '@/hooks/useModalState';
import type { Worker } from '@/types/worker';
import { AssignWorkerDialog } from './AssignWorkerDialog';

interface BoardRowActionsProps {
	worker: Worker;
}

export const BoardRowActions = ({ worker }: BoardRowActionsProps) => {
	const modal = useModalState<Worker>();

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				data-testid="assign-worker"
				onClick={() => modal.open(worker)}
				aria-label={`Assign ${worker.first_name} ${worker.last_name}`}
			>
				<PlusIcon className="mr-1.5 size-4" aria-hidden="true" />
				Assign
			</Button>

			<AssignWorkerDialog modal={modal} />
		</>
	);
};
