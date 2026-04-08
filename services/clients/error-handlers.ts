import { createErrorHandler } from '@/services/shared/error-handler-factory';

export const clientErrors = createErrorHandler({
	messages: {
		DUPLICATE_ENTRY: 'A client with this email already exists',
		HAS_DEPENDENCIES:
			'This client cannot be deleted because it has associated work locations.',
		NOT_FOUND: 'Client not found. It may have already been deleted.',
	},
	blockingCodes: ['HAS_DEPENDENCIES'],
	duplicateField: 'email',
});
