import type { DefaultValues } from 'react-hook-form';
import type { WorkLocation } from '@/types/work-location';
import type { CreateWorkLocationInput } from './schemas';

export const workLocationMapper = {
	defaultValues: {
		clientId: '',
		name: '',
		address: '',
		email: undefined,
		phone: undefined,
	} satisfies DefaultValues<CreateWorkLocationInput>,

	toForm: (entity: WorkLocation): DefaultValues<CreateWorkLocationInput> => ({
		clientId: entity.client_id,
		name: entity.name,
		address: entity.address,
		email: entity.email ?? undefined,
		phone: entity.phone ?? undefined,
	}),

	toDb: (input: CreateWorkLocationInput) => ({
		client_id: input.clientId,
		name: input.name,
		address: input.address,
		email: input.email,
		phone: input.phone,
	}),
};
