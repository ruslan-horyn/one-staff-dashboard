import { createErrorHandler } from '@/services/shared/error-handler-factory';

export const positionErrors = createErrorHandler({
	messages: {
		DUPLICATE_ENTRY:
			'A position with this name already exists at this location',
		HAS_DEPENDENCIES:
			'This position cannot be deleted because it has active assignments.',
		NOT_FOUND: 'Position not found. It may have already been deleted.',
	},
	blockingCodes: ['HAS_DEPENDENCIES'],
	duplicateField: 'name',
});
