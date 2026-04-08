import { createErrorHandler } from '@/services/shared/error-handler-factory';

export const assignmentErrors = createErrorHandler({
	messages: {
		NOT_FOUND: 'Assignment not found.',
		DUPLICATE_ENTRY: 'This worker already has an overlapping assignment.',
		VALIDATION_ERROR: 'Please check the assignment details.',
	},
	blockingCodes: [],
	duplicateField: 'positionId',
});
