import type { PostgrestError, User } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { createAction, isNextRouterError } from '../action-wrapper';
import { AuthenticationError } from '../auth';
import { ErrorCodes } from '../errors';

// Mock next/cache
vi.mock('next/cache', () => ({
	revalidatePath: vi.fn(),
}));

// Mock Supabase client
const mockGetUser = vi.fn();
const mockSupabase = {
	auth: {
		getUser: mockGetUser,
	},
};

vi.mock('@/lib/supabase/server', () => ({
	createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

const mockUser: User = {
	id: 'user-123',
	email: 'test@example.com',
	app_metadata: {},
	user_metadata: {},
	aud: 'authenticated',
	created_at: '2024-01-01T00:00:00Z',
};

describe('createAction', () => {
	beforeEach(() => {
		mockGetUser.mockReset();
	});

	describe('with requireAuth: true (default)', () => {
		it('returns success when handler succeeds', async () => {
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

			const action = createAction(async (_, { user }) => ({
				id: '123',
				userId: user.id,
			}));

			const result = await action();

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.id).toBe('123');
				expect(result.data.userId).toBe('user-123');
			}
		});

		it('returns NOT_AUTHENTICATED error when user is not logged in', async () => {
			mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

			const action = createAction(async () => ({ id: '123' }));

			const result = await action();

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe(ErrorCodes.NOT_AUTHENTICATED);
			}
		});

		it('returns NOT_AUTHENTICATED error when getUser returns error', async () => {
			mockGetUser.mockResolvedValue({
				data: { user: null },
				error: { message: 'Session expired', code: 'session_expired' },
			});

			const action = createAction(async () => ({ id: '123' }));

			const result = await action();

			expect(result.success).toBe(false);
		});
	});

	describe('with requireAuth: false', () => {
		it('does not require authentication', async () => {
			const action = createAction(
				async (_, { user }) => {
					expect(user).toBeNull();
					return { public: true };
				},
				{ requireAuth: false }
			);

			const result = await action();

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.public).toBe(true);
			}
		});
	});

	describe('with input validation', () => {
		const schema = z.object({
			name: z.string().min(1),
			age: z.number().min(0),
		});

		it('validates input against schema', async () => {
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

			const action = createAction(
				async (input: z.infer<typeof schema>) => ({ name: input.name }),
				{ schema }
			);

			const result = await action({ name: 'John', age: 25 });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.name).toBe('John');
			}
		});

		it('returns VALIDATION_ERROR for invalid input', async () => {
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

			const action = createAction(
				async (input: z.infer<typeof schema>) => ({ name: input.name }),
				{ schema }
			);

			const result = await action({ name: '', age: -1 });

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
			}
		});
	});

	describe('with revalidatePaths', () => {
		it('calls revalidatePath for each path after success', async () => {
			const { revalidatePath } = await import('next/cache');
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

			const action = createAction(async () => ({ success: true }), {
				revalidatePaths: [
					{ path: '/dashboard' },
					{ path: '/profile', type: 'layout' },
				],
			});

			await action();

			expect(revalidatePath).toHaveBeenCalledWith('/dashboard', undefined);
			expect(revalidatePath).toHaveBeenCalledWith('/profile', 'layout');
		});

		it('does not revalidate paths on error', async () => {
			const { revalidatePath } = await import('next/cache');
			vi.mocked(revalidatePath).mockClear();
			mockGetUser.mockResolvedValue({ data: { user: null }, error: null });

			const action = createAction(async () => ({ success: true }), {
				revalidatePaths: [{ path: '/dashboard' }],
			});

			await action();

			expect(revalidatePath).not.toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('handles AuthenticationError', async () => {
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

			const action = createAction(async () => {
				throw new AuthenticationError('Custom auth error');
			});

			const result = await action();

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe(ErrorCodes.NOT_AUTHENTICATED);
				expect(result.error.message).toBe('Custom auth error');
			}
		});

		it('handles PostgrestError', async () => {
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

			const action = createAction(async () => {
				const error: PostgrestError = {
					name: 'PostgrestError',
					code: '23505',
					message: 'duplicate key value violates unique constraint',
					details: 'Key (email)=(test@example.com) already exists',
					hint: '',
				};
				throw error;
			});

			const result = await action();

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe(ErrorCodes.DUPLICATE_ENTRY);
			}
		});

		it('handles Zod validation error from handler', async () => {
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

			const action = createAction(async () => {
				const innerSchema = z.object({ field: z.string().min(1) });
				innerSchema.parse({ field: '' });
				return { success: true };
			});

			const result = await action();

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe(ErrorCodes.VALIDATION_ERROR);
			}
		});

		it('handles standard Error', async () => {
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

			const action = createAction(async () => {
				throw new Error('Something went wrong');
			});

			const result = await action();

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
				expect(result.error.message).toBe('Something went wrong');
			}
		});

		it('handles Error without message', async () => {
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

			const action = createAction(async () => {
				throw new Error();
			});

			const result = await action();

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
			}
		});

		it('handles unknown error type', async () => {
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

			const action = createAction(async () => {
				throw 'string error';
			});

			const result = await action();

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe(ErrorCodes.INTERNAL_ERROR);
			}
		});

		it('handles Supabase AuthError', async () => {
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

			const action = createAction(async () => {
				const authError = {
					name: 'AuthApiError',
					message: 'Invalid login credentials',
					status: 400,
					code: 'invalid_credentials',
					__isAuthError: true,
				};
				throw authError;
			});

			const result = await action();

			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.code).toBe(ErrorCodes.INVALID_CREDENTIALS);
			}
		});
	});

	describe('with input parameter', () => {
		it('passes input to handler', async () => {
			mockGetUser.mockResolvedValue({ data: { user: mockUser }, error: null });

			const action = createAction(async (input: { value: number }) => ({
				doubled: input.value * 2,
			}));

			const result = await action({ value: 5 });

			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.doubled).toBe(10);
			}
		});
	});
});

describe('isNextRouterError', () => {
	it('returns true for NEXT_REDIRECT error', () => {
		const error = { digest: 'NEXT_REDIRECT;replace;/login' };
		expect(isNextRouterError(error)).toBe(true);
	});

	it('returns true for NEXT_NOT_FOUND error', () => {
		const error = { digest: 'NEXT_NOT_FOUND' };
		expect(isNextRouterError(error)).toBe(true);
	});

	it('returns false for regular error', () => {
		const error = new Error('Regular error');
		expect(isNextRouterError(error)).toBe(false);
	});

	it('returns false for null', () => {
		expect(isNextRouterError(null)).toBe(false);
	});

	it('returns false for undefined', () => {
		expect(isNextRouterError(undefined)).toBe(false);
	});

	it('returns false for string', () => {
		expect(isNextRouterError('string')).toBe(false);
	});

	it('returns false for error with non-string digest', () => {
		const error = { digest: 123 };
		expect(isNextRouterError(error)).toBe(false);
	});

	it('returns false for error with different digest prefix', () => {
		const error = { digest: 'OTHER_ERROR' };
		expect(isNextRouterError(error)).toBe(false);
	});
});
