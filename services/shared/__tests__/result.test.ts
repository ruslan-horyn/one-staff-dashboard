import { describe, expect, it } from 'vitest';
import { failure, isFailure, isSuccess, success } from '../result';

describe('ActionResult helpers', () => {
	describe('success', () => {
		it('creates a success result with data', () => {
			const result = success({ id: '123', name: 'Test' });

			expect(result.success).toBe(true);
			expect(result.data).toEqual({ id: '123', name: 'Test' });
		});
	});

	describe('failure', () => {
		it('creates a failure result with error', () => {
			const result = failure('NOT_FOUND', 'Resource not found');

			expect(result.success).toBe(false);

			expect(result.error.code).toBe('NOT_FOUND');
			expect(result.error.message).toBe('Resource not found');
		});

		it('creates a failure result with details', () => {
			const result = failure('VALIDATION_ERROR', 'Invalid input', {
				fieldErrors: { name: ['Required'] },
			});

			expect(result.success).toBe(false);

			expect(result.error.code).toBe('VALIDATION_ERROR');
			expect(result.error.details).toEqual({
				fieldErrors: { name: ['Required'] },
			});
		});
	});

	describe('isSuccess', () => {
		it('returns true for success result', () => {
			const result = success({ value: 42 });
			expect(isSuccess(result)).toBe(true);
		});

		it('returns false for failure result', () => {
			const result = failure('ERROR', 'Error');
			expect(isSuccess(result)).toBe(false);
		});
	});

	describe('isFailure', () => {
		it('returns true for failure result', () => {
			const result = failure('ERROR', 'Error');
			expect(isFailure(result)).toBe(true);
		});

		it('returns false for success result', () => {
			const result = success({ value: 42 });
			expect(isFailure(result)).toBe(false);
		});
	});
});
