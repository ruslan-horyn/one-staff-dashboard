'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { workLocationMapper } from '@/services/work-locations/mapper';
import {
	type CreateWorkLocationInput,
	createWorkLocationSchema,
} from '@/services/work-locations/schemas';
import type { WorkLocation } from '@/types/work-location';

export function useLocationForm({
	onSubmit: _onSubmit,
}: {
	onSubmit: (data: CreateWorkLocationInput) => Promise<unknown>;
}) {
	const form = useForm<CreateWorkLocationInput>({
		resolver: zodResolver(createWorkLocationSchema),
		defaultValues: workLocationMapper.defaultValues,
	});

	return {
		form,
		isPending: form.formState.isSubmitting,
		resetForCreate: () => form.reset(workLocationMapper.defaultValues),
		resetForEdit: (entity: WorkLocation) =>
			form.reset(workLocationMapper.toForm(entity)),
	};
}
