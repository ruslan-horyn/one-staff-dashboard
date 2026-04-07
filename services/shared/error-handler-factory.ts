// services/shared/error-handler-factory.ts
import type { ActionError } from '@/services/shared/result';

const DEFAULT_MESSAGES: Record<string, string> = {
	FORBIDDEN: 'You do not have permission to perform this action.',
	VALIDATION_ERROR: 'Please check the form for errors.',
	DATABASE_ERROR: 'A database error occurred. Please try again.',
	INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
};

/** Type-safe extraction of field name from error details (no `as` cast) */
function getErrorDetailField(details: unknown): string | undefined {
	if (details && typeof details === 'object' && 'field' in details) {
		const field = (details as Record<string, unknown>).field;
		return typeof field === 'string' ? field : undefined;
	}
	return undefined;
}

export interface ErrorHandlerConfig {
	messages: Record<string, string>;
	blockingCodes?: string[];
	duplicateField?: string;
}

export interface ErrorHandler {
	getMessage(error: ActionError): string;
	isBlocking(code: string): boolean;
	getDuplicateField(error: ActionError): string;
}

export function createErrorHandler(config: ErrorHandlerConfig): ErrorHandler {
	const allMessages = { ...DEFAULT_MESSAGES, ...config.messages };
	const blockingSet = new Set(config.blockingCodes ?? []);

	return {
		getMessage: (error) => allMessages[error.code] ?? error.message,
		isBlocking: (code) => blockingSet.has(code),
		getDuplicateField: (error) =>
			getErrorDetailField(error.details) ?? config.duplicateField ?? 'name',
	};
}
