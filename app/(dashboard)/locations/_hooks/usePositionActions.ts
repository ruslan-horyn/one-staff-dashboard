'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import {
	createPosition,
	deletePosition,
	getPositions,
	updatePosition,
} from '@/services/positions/actions';
import { positionErrors } from '@/services/positions/error-handlers';
import type { Position } from '@/types/position';

export function usePositionActions(workLocationId: string) {
	const [positions, setPositions] = useState<Position[]>([]);

	const { execute: fetchPositions, isPending: isLoading } =
		useServerAction(getPositions);
	const { execute: executeCreate, isPending: isCreating } = useServerAction(
		createPosition,
		{
			onSuccess: () => {
				toast.success('Position created');
			},
			onError: (error) => {
				toast.error(positionErrors.getMessage(error));
			},
		}
	);
	const { execute: executeUpdate, isPending: isUpdating } = useServerAction(
		updatePosition,
		{
			onSuccess: () => {
				toast.success('Position updated');
			},
			onError: (error) => {
				toast.error(positionErrors.getMessage(error));
			},
		}
	);
	const { execute: executeDelete, isPending: isDeleting } = useServerAction(
		deletePosition,
		{
			onError: (error) => {
				toast.error(positionErrors.getMessage(error));
			},
		}
	);

	const loadPositions = useCallback(async () => {
		const result = await fetchPositions({ workLocationId });
		if (result.success) {
			setPositions(result.data);
		}
	}, [fetchPositions, workLocationId]);

	const addPosition = useCallback(
		async (name: string) => {
			const result = await executeCreate({ workLocationId, name });
			if (result.success) {
				await loadPositions();
			}
		},
		[executeCreate, workLocationId, loadPositions]
	);

	const editPosition = useCallback(
		async (id: string, name: string) => {
			const result = await executeUpdate({ id, name });
			if (result.success) {
				await loadPositions();
			}
		},
		[executeUpdate, loadPositions]
	);

	const toggleActive = useCallback(
		async (position: Position) => {
			const result = await executeUpdate({
				id: position.id,
				isActive: !position.is_active,
			});
			if (result.success) {
				toast.success(
					position.is_active ? 'Position deactivated' : 'Position activated'
				);
				await loadPositions();
			}
		},
		[executeUpdate, loadPositions]
	);

	const removePosition = useCallback(
		async (id: string) => {
			const result = await executeDelete({ id });
			if (result.success) {
				toast.success('Position deleted');
				await loadPositions();
			}
		},
		[executeDelete, loadPositions]
	);

	return {
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
	};
}
