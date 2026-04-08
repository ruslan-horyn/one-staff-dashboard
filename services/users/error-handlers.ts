import { createErrorHandler } from '@/services/shared/error-handler-factory';

export const userErrors = createErrorHandler({
	messages: {
		DUPLICATE_ENTRY: 'A user with this email already exists',
		NOT_FOUND: 'User not found.',
		FORBIDDEN: 'You do not have permission to manage users.',
	},
	blockingCodes: [],
	duplicateField: 'email',
});
