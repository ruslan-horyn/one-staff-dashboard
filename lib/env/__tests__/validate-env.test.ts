import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { validateEnv } from '../types';

const testSchema = z.object({
	NAME: z.string().min(1),
	COUNT: z.coerce.number().min(0),
	URL: z.url(),
});

describe('validateEnv', () => {
	describe('with valid values', () => {
		it('returns success with parsed data', () => {
			const values = {
				NAME: 'test',
				COUNT: 42,
				URL: 'https://example.com',
			};

			const result = validateEnv(testSchema, values, { throwOnError: false });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data).toEqual(values);
			}
		});

		it('coerces values according to schema', () => {
			const values = {
				NAME: 'test',
				COUNT: '10',
				URL: 'https://example.com',
			};

			const result = validateEnv(testSchema, values, { throwOnError: false });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.COUNT).toBe(10);
			}
		});
	});

	describe('with invalid values', () => {
		it('returns errors when throwOnError is false', () => {
			const values = {
				NAME: '',
				COUNT: -1,
				URL: 'not-a-url',
			};

			const result = validateEnv(testSchema, values, { throwOnError: false });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.length).toBeGreaterThan(0);
			}
		});

		it('throws error when throwOnError is true (default)', () => {
			const values = {
				NAME: '',
				COUNT: 42,
				URL: 'https://example.com',
			};

			expect(() => validateEnv(testSchema, values)).toThrow();
		});

		it('includes field path in error message', () => {
			const values = {
				NAME: '',
				COUNT: 42,
				URL: 'https://example.com',
			};

			const result = validateEnv(testSchema, values, { throwOnError: false });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.some((e) => e.includes('NAME'))).toBe(true);
			}
		});
	});

	describe('error prefix option', () => {
		it('uses custom error prefix in thrown error', () => {
			const values = { NAME: '', COUNT: 0, URL: 'invalid' };

			expect(() =>
				validateEnv(testSchema, values, {
					errorPrefix: 'Custom prefix',
					throwOnError: true,
				})
			).toThrow('Custom prefix');
		});

		it('uses default error prefix when not specified', () => {
			const values = { NAME: '', COUNT: 0, URL: 'invalid' };

			expect(() => validateEnv(testSchema, values)).toThrow(
				'Environment validation failed'
			);
		});
	});

	describe('with missing values', () => {
		it('returns errors for undefined required fields', () => {
			const values = {
				NAME: undefined,
				COUNT: 42,
				URL: 'https://example.com',
			};

			const result = validateEnv(testSchema, values, { throwOnError: false });

			expect(result.success).toBe(false);
		});

		it('returns errors for missing fields', () => {
			const values = {
				COUNT: 42,
			};

			const result = validateEnv(testSchema, values, { throwOnError: false });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.errors.some((e) => e.includes('NAME'))).toBe(true);
				expect(result.errors.some((e) => e.includes('URL'))).toBe(true);
			}
		});
	});
});
