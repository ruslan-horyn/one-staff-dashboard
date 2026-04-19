import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/server', () => ({
	createClient: vi.fn(),
}));

import { createClient } from '@/lib/supabase/server';
import { subscribeToWaitlist } from '@/services/waitlist/actions';

const mockInsert = vi.fn();
const mockFrom = vi.fn(() => ({ insert: mockInsert }));
const mockSupabase = { from: mockFrom };

beforeEach(() => {
	mockInsert.mockClear();
	mockInsert.mockResolvedValue({ error: null });
	mockFrom.mockReturnValue({ insert: mockInsert });
	vi.mocked(createClient).mockResolvedValue(
		mockSupabase as unknown as ReturnType<typeof createClient> extends Promise<
			infer T
		>
			? T
			: never
	);
});

describe('subscribeToWaitlist', () => {
	it('inserts email and returns success', async () => {
		mockInsert.mockResolvedValue({ error: null });
		const result = await subscribeToWaitlist({
			email: 'test@example.com',
			source: 'hero',
		});
		expect(mockFrom).toHaveBeenCalledWith('waitlist_subscribers');
		expect(mockInsert).toHaveBeenCalledWith({
			email: 'test@example.com',
			source: 'hero',
		});
		expect(result).toEqual({
			success: true,
			data: { email: 'test@example.com' },
		});
	});

	it('returns success silently for duplicate email', async () => {
		mockInsert.mockResolvedValue({
			error: { code: '23505', message: 'duplicate key' },
		});
		const result = await subscribeToWaitlist({ email: 'dupe@example.com' });
		expect(result).toEqual({
			success: true,
			data: { email: 'dupe@example.com' },
		});
	});

	it('returns validation error for invalid email', async () => {
		const result = await subscribeToWaitlist({ email: 'not-an-email' });
		expect(result).toMatchObject({
			success: false,
			error: { code: 'VALIDATION_ERROR' },
		});
		expect(mockInsert).not.toHaveBeenCalled();
	});

	it('returns database error for unexpected failures', async () => {
		mockInsert.mockResolvedValue({
			error: { code: '500', message: 'unexpected error' },
		});
		const result = await subscribeToWaitlist({ email: 'test@example.com' });
		expect(result).toMatchObject({
			success: false,
			error: { code: 'DATABASE_ERROR' },
		});
	});
});
