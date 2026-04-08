import { createErrorHandler } from '@/services/shared/error-handler-factory';

export const workLocationErrors = createErrorHandler({
	messages: {
		DUPLICATE_ENTRY: 'A work location with this name already exists at this client',
		HAS_DEPENDENCIES:
			'This work location cannot be deleted because it has associated positions.',
		NOT_FOUND: 'Work location not found. It may have already been deleted.',
	},
	blockingCodes: ['HAS_DEPENDENCIES'],
	duplicateField: 'name',
});
