import { describe, expect, it } from 'vitest';
import { createErrorHandler } from '../error-handler-factory';

describe('createErrorHandler', () => {
	describe('getMessage', () => {
		it('returns custom message for a configured error code', () => {
			// Arrange
			const handler = createErrorHandler({
				messages: { NOT_FOUND: 'Worker not found.' },
			});
			const error = { code: 'NOT_FOUND', message: 'raw not found' };

			// Act
			const result = handler.getMessage(error);

			// Assert
			expect(result).toBe('Worker not found.');
		});

		it('returns default message for a non-configured default code (FORBIDDEN)', () => {
			// Arrange
			const handler = createErrorHandler({ messages: {} });
			const error = { code: 'FORBIDDEN', message: 'raw forbidden' };

			// Act
			const result = handler.getMessage(error);

			// Assert
			expect(result).toBe('You do not have permission to perform this action.');
		});

		it('falls back to error.message for an unknown code', () => {
			// Arrange
			const handler = createErrorHandler({ messages: {} });
			const error = { code: 'UNKNOWN_CODE', message: 'something went wrong' };

			// Act
			const result = handler.getMessage(error);

			// Assert
			expect(result).toBe('something went wrong');
		});
	});

	describe('isBlocking', () => {
		it('returns true for a code listed in blockingCodes', () => {
			// Arrange
			const handler = createErrorHandler({
				messages: {},
				blockingCodes: ['NOT_AUTHENTICATED', 'FORBIDDEN'],
			});

			// Act & Assert
			expect(handler.isBlocking('NOT_AUTHENTICATED')).toBe(true);
			expect(handler.isBlocking('FORBIDDEN')).toBe(true);
		});

		it('returns false for a code not listed in blockingCodes', () => {
			// Arrange
			const handler = createErrorHandler({
				messages: {},
				blockingCodes: ['NOT_AUTHENTICATED'],
			});

			// Act & Assert
			expect(handler.isBlocking('VALIDATION_ERROR')).toBe(false);
		});

		it('returns false for any code when blockingCodes is not configured', () => {
			// Arrange
			const handler = createErrorHandler({ messages: {} });

			// Act & Assert
			expect(handler.isBlocking('NOT_AUTHENTICATED')).toBe(false);
			expect(handler.isBlocking('FORBIDDEN')).toBe(false);
		});
	});

	describe('getDuplicateField', () => {
		it('returns the field from error.details when present', () => {
			// Arrange
			const handler = createErrorHandler({
				messages: {},
				duplicateField: 'email',
			});
			const error = {
				code: 'DUPLICATE_ENTRY',
				message: 'duplicate',
				details: { field: 'phone' },
			};

			// Act
			const result = handler.getDuplicateField(error);

			// Assert
			expect(result).toBe('phone');
		});

		it('returns config.duplicateField when error.details has no field', () => {
			// Arrange
			const handler = createErrorHandler({
				messages: {},
				duplicateField: 'email',
			});
			const error = {
				code: 'DUPLICATE_ENTRY',
				message: 'duplicate',
				details: { someOtherKey: 'value' },
			};

			// Act
			const result = handler.getDuplicateField(error);

			// Assert
			expect(result).toBe('email');
		});

		it("returns 'name' as the ultimate fallback when no field in details and no duplicateField configured", () => {
			// Arrange
			const handler = createErrorHandler({ messages: {} });
			const error = { code: 'DUPLICATE_ENTRY', message: 'duplicate' };

			// Act
			const result = handler.getDuplicateField(error);

			// Assert
			expect(result).toBe('name');
		});
	});
});
