'use client';

import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
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
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { DestructiveButton } from '@/components/ui/destructive-button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { useDialogFocusRestore } from '@/hooks/useDialogFocusRestore';
import { useModalState } from '@/hooks/useModalState';
import { useServerAction } from '@/hooks/useServerAction';
import { getWorkerAssignments } from '@/services/assignments/actions';
import type { AssignmentWithPosition } from '@/types/assignment';
import { useCancelAssignment } from '../../_hooks/useCancelAssignment';
import { useEndAssignment } from '../../_hooks/useEndAssignment';
import { AssignmentStatusBadge } from './AssignmentStatusBadge';
import { useBoardContext } from './BoardProvider';

interface AssignmentExpandedRowProps {
	workerId: string;
}

function formatTime(startAt: string, endAt: string | null): string {
	const start = format(new Date(startAt), 'd MMM yyyy, HH:mm');
	if (!endAt) return `${start} — Ongoing`;
	const end = format(new Date(endAt), 'd MMM yyyy, HH:mm');
	return `${start} — ${end}`;
}

export const AssignmentExpandedRow = ({
	workerId,
}: AssignmentExpandedRowProps) => {
	const { onMutationSuccess } = useBoardContext();
	const [assignments, setAssignments] = useState<AssignmentWithPosition[]>([]);

	const { execute: fetchAssignments, isPending: isLoading } =
		useServerAction(getWorkerAssignments);

	const loadAssignments = useCallback(async () => {
		const result = await fetchAssignments({ workerId });
		if (result.success) {
			setAssignments(result.data);
		}
	}, [fetchAssignments, workerId]);

	useEffect(() => {
		loadAssignments();
	}, [loadAssignments]);

	// --- End Work dialog ---
	const [endAt, setEndAt] = useState<Date | undefined>(new Date());
	const endModal = useModalState<AssignmentWithPosition>();
	const endFocus = useDialogFocusRestore({ triggerRef: endModal.triggerRef });

	const endAction = useEndAssignment({
		onSuccess: () => {
			endModal.close();
			onMutationSuccess();
			loadAssignments();
		},
		onSettled: () => endModal.close(),
	});

	const handleEndWork = (assignment: AssignmentWithPosition) => {
		setEndAt(new Date());
		endModal.open(assignment);
	};

	const handleEndConfirm = async () => {
		if (!endModal.data) return;
		await endAction.execute({
			assignmentId: endModal.data.id,
			endAt: endAt?.toISOString(),
		});
	};

	// --- Cancel dialog ---
	const cancelModal = useModalState<AssignmentWithPosition>();
	const cancelFocus = useDialogFocusRestore({
		triggerRef: cancelModal.triggerRef,
	});

	const cancelAction = useCancelAssignment({
		onSuccess: () => {
			cancelModal.close();
			onMutationSuccess();
			loadAssignments();
		},
		onSettled: () => cancelModal.close(),
	});

	const handleCancelConfirm = async () => {
		if (!cancelModal.data) return;
		await cancelAction.execute(cancelModal.data.id);
	};

	if (isLoading) {
		return (
			<div className="space-y-2 py-2">
				<div className="h-10 animate-pulse rounded bg-muted" />
				<div className="h-10 animate-pulse rounded bg-muted" />
			</div>
		);
	}

	if (assignments.length === 0) {
		return (
			<p className="py-2 text-muted-foreground text-sm">
				No assignments for this worker.
			</p>
		);
	}

	return (
		<>
			<div className="space-y-2">
				{assignments.map((assignment) => (
					<div
						key={assignment.id}
						className="flex flex-col gap-2 rounded-md border border-border bg-background px-3 py-2 sm:flex-row sm:items-center sm:gap-4"
					>
						<div className="flex-1 space-y-0.5">
							<div className="flex items-center gap-2">
								<span className="font-medium text-sm">
									{assignment.position?.work_location.name ?? '—'}
								</span>
								<span className="text-muted-foreground text-sm">·</span>
								<span className="text-sm">
									{assignment.position?.name ?? '—'}
								</span>
							</div>
							<p className="text-muted-foreground text-xs">
								{formatTime(assignment.start_at, assignment.end_at)}
							</p>
						</div>

						<AssignmentStatusBadge status={assignment.status} />

						<div className="flex gap-2">
							{(assignment.status === 'scheduled' ||
								assignment.status === 'active') && (
								<Button
									variant="outline"
									size="sm"
									onClick={() => handleEndWork(assignment)}
								>
									End Work
								</Button>
							)}

							{assignment.status === 'scheduled' && (
								<Button
									variant="ghost"
									size="sm"
									className="text-destructive hover:text-destructive"
									onClick={() => cancelModal.open(assignment)}
								>
									Cancel
								</Button>
							)}
						</div>
					</div>
				))}
			</div>

			{/* End Work Dialog */}
			<Dialog open={endModal.isOpen} onOpenChange={endModal.close}>
				<DialogContent onCloseAutoFocus={endFocus.onCloseAutoFocus}>
					<DialogHeader>
						<DialogTitle>End Assignment</DialogTitle>
						<DialogDescription>
							Set the end date and time for this assignment.
						</DialogDescription>
					</DialogHeader>

					<div className="py-2">
						<DateTimePicker
							value={endAt}
							onChange={setEndAt}
							placeholder="Select end date and time..."
						/>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={endModal.close}
							disabled={endAction.isPending}
						>
							Cancel
						</Button>
						<Button
							type="button"
							onClick={handleEndConfirm}
							disabled={endAction.isPending || !endAt}
							aria-busy={endAction.isPending}
						>
							{endAction.isPending ? (
								<>
									<Loader2
										className="mr-2 h-4 w-4 animate-spin"
										aria-hidden="true"
									/>
									Ending...
								</>
							) : (
								'End Assignment'
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Cancel Confirmation Dialog */}
			<AlertDialog open={cancelModal.isOpen} onOpenChange={cancelModal.close}>
				<AlertDialogContent onCloseAutoFocus={cancelFocus.onCloseAutoFocus}>
					<AlertDialogHeader>
						<AlertDialogTitle>Cancel Assignment</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to cancel this assignment? This action
							cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={cancelAction.isPending}>
							Keep
						</AlertDialogCancel>
						<DestructiveButton
							onClick={handleCancelConfirm}
							isPending={cancelAction.isPending}
							loadingText="Cancelling..."
						>
							Cancel Assignment
						</DestructiveButton>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
