'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { clientMapper } from '@/services/clients/mapper';
import {
	type CreateClientInput,
	createClientSchema,
} from '@/services/clients/schemas';
import type { Client } from '@/types/client';

export function useClientForm({
	onSubmit: _onSubmit,
}: {
	onSubmit: (data: CreateClientInput) => Promise<unknown>;
}) {
	const form = useForm<CreateClientInput>({
		resolver: zodResolver(createClientSchema),
		defaultValues: clientMapper.defaultValues,
	});

	return {
		form,
		isPending: form.formState.isSubmitting,
		resetForCreate: () => form.reset(clientMapper.defaultValues),
		resetForEdit: (entity: Client) => form.reset(clientMapper.toForm(entity)),
	};
}
