import { createErrorHandler } from '@/services/shared/error-handler-factory';

export const workerErrors = createErrorHandler({
	messages: {
		DUPLICATE_ENTRY: 'A worker with this phone number already exists',
		HAS_DEPENDENCIES:
			'This worker cannot be deleted because they have active assignments.',
		NOT_FOUND: 'Worker not found. They may have already been removed.',
	},
	blockingCodes: ['HAS_DEPENDENCIES'],
	duplicateField: 'phone',
});
