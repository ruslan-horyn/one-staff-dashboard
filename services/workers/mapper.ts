import type { DefaultValues } from 'react-hook-form';
import type { Worker } from '@/types/worker';
import type { CreateWorkerInput } from './schemas';

export const workerMapper = {
	defaultValues: {
		firstName: '',
		lastName: '',
		phone: '',
	} satisfies DefaultValues<CreateWorkerInput>,

	toForm: (entity: Worker): DefaultValues<CreateWorkerInput> => ({
		firstName: entity.first_name,
		lastName: entity.last_name,
		phone: entity.phone,
	}),

	toDb: (input: CreateWorkerInput) => ({
		first_name: input.firstName,
		last_name: input.lastName,
		phone: input.phone,
	}),
};
