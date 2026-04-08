'use client';

import {
	CheckIcon,
	PencilIcon,
	PlusIcon,
	TrashIcon,
	XIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Position } from '@/types/position';
import { PositionDeleteDialog } from './PositionDeleteDialog';
import { PositionFormInline } from './PositionFormInline';
import { usePositionActions } from '../_hooks/usePositionActions';

interface PositionListProps {
	workLocationId: string;
}

type EditingPosition = { id: string; type: 'edit' } | { type: 'add' } | null;

export const PositionList = ({ workLocationId }: PositionListProps) => {
	const {
		positions,
		isLoading,
		isCreating,
		isUpdating,
		isDeleting,
		loadPositions,
		addPosition,
		editPosition,
		toggleActive,
		removePosition,
	} = usePositionActions(workLocationId);

	const [editing, setEditing] = useState<EditingPosition>(null);
	const [deleteTarget, setDeleteTarget] = useState<Position | null>(null);

	useEffect(() => {
		loadPositions();
	}, [loadPositions]);

	const handleAddPosition = async (name: string) => {
		await addPosition(name);
		setEditing(null);
	};

	const handleEditPosition = async (name: string) => {
		const id = editing && editing.type === 'edit' ? editing.id : null;
		if (!id) return;
		await editPosition(id, name);
		setEditing(null);
	};

	const handleToggleActive = async (position: Position) => {
		await toggleActive(position);
	};

	const handleDeletePosition = async (id: string) => {
		await removePosition(id);
	};

	const isPending = isCreating || isUpdating || isDeleting || isLoading;

	if (isLoading) {
		return (
			<div className="space-y-2">
				<div className="h-10 animate-pulse rounded bg-muted" />
				<div className="h-10 animate-pulse rounded bg-muted" />
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{positions.length === 0 ? (
				<p className="text-sm text-muted-foreground">
					No positions yet. Add one to get started.
				</p>
			) : (
				<div className="space-y-2">
					{positions.map((position) => (
						<div
							key={position.id}
							className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
						>
							{editing?.type === 'edit' && editing.id === position.id ? (
								<PositionFormInline
									initialValue={position.name}
									onSave={handleEditPosition}
									onCancel={() => setEditing(null)}
									isPending={isUpdating}
								/>
							) : (
								<>
									<span className="flex-1 text-sm font-medium">
										{position.name}
									</span>

									<Badge
										variant={position.is_active ? 'default' : 'secondary'}
										className="shrink-0"
									>
										{position.is_active ? 'Active' : 'Inactive'}
									</Badge>

									<div className="flex gap-1">
										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											onClick={() =>
												setEditing({ id: position.id, type: 'edit' })
											}
											disabled={isPending}
											aria-label={`Edit ${position.name}`}
										>
											<PencilIcon className="size-4" aria-hidden="true" />
										</Button>

										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											onClick={() => handleToggleActive(position)}
											disabled={isPending}
											aria-label={
												position.is_active
													? `Deactivate ${position.name}`
													: `Activate ${position.name}`
											}
										>
											{position.is_active ? (
												<CheckIcon className="size-4" aria-hidden="true" />
											) : (
												<XIcon className="size-4" aria-hidden="true" />
											)}
										</Button>

										<Button
											type="button"
											variant="ghost"
											size="icon-sm"
											onClick={() => setDeleteTarget(position)}
											disabled={isPending}
											aria-label={`Delete ${position.name}`}
										>
											<TrashIcon className="size-4" aria-hidden="true" />
										</Button>
									</div>
								</>
							)}
						</div>
					))}
				</div>
			)}

			{editing?.type === 'add' ? (
				<div className="rounded-md border border-border bg-background px-3 py-2">
					<PositionFormInline
						onSave={handleAddPosition}
						onCancel={() => setEditing(null)}
						isPending={isCreating}
						placeholder="Enter position name"
					/>
				</div>
			) : (
				<Button
					type="button"
					variant="outline"
					size="sm"
					onClick={() => setEditing({ type: 'add' })}
					disabled={isPending}
					className="w-full"
				>
					<PlusIcon className="mr-2 size-4" aria-hidden="true" />
					Add Position
				</Button>
			)}

			<PositionDeleteDialog
				position={deleteTarget}
				onConfirm={handleDeletePosition}
				onClose={() => setDeleteTarget(null)}
				isPending={isDeleting}
				blockingError={
					deleteTarget?.id
						? positions.find((p) => p.id === deleteTarget.id)?.id
							? undefined
							: undefined
						: undefined
				}
			/>
		</div>
	);
};
