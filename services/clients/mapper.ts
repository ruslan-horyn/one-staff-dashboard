import type { DefaultValues } from 'react-hook-form';
import type { Client } from '@/types/client';
import type { CreateClientInput } from './schemas';

export const clientMapper = {
	defaultValues: {
		name: '',
		email: '',
		phone: '',
		address: '',
	} satisfies DefaultValues<CreateClientInput>,

	toForm: (entity: Client): DefaultValues<CreateClientInput> => ({
		name: entity.name,
		email: entity.email,
		phone: entity.phone,
		address: entity.address,
	}),

	toDb: (input: CreateClientInput) => ({
		name: input.name,
		email: input.email,
		phone: input.phone,
		address: input.address,
	}),
};
