'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { workerMapper } from '@/services/workers/mapper';
import {
	type CreateWorkerInput,
	createWorkerSchema,
} from '@/services/workers/schemas';
import type { Worker } from '@/types/worker';

export function useWorkerForm({
	onSubmit: _onSubmit,
}: {
	onSubmit: (data: CreateWorkerInput) => Promise<unknown>;
}) {
	const form = useForm<CreateWorkerInput>({
		resolver: zodResolver(createWorkerSchema),
		defaultValues: workerMapper.defaultValues,
	});

	return {
		form,
		isPending: form.formState.isSubmitting,
		resetForCreate: () => form.reset(workerMapper.defaultValues),
		resetForEdit: (entity: Worker) => form.reset(workerMapper.toForm(entity)),
	};
}
