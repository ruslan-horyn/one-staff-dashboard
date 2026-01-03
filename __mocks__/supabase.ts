import { vi } from 'vitest';

export const mockSupabaseClient = {
	auth: {
		signInWithPassword: vi.fn(),
		signOut: vi.fn(),
		signUp: vi.fn(),
		getUser: vi.fn(),
		getSession: vi.fn(),
		onAuthStateChange: vi.fn(() => ({
			data: { subscription: { unsubscribe: vi.fn() } },
		})),
	},
	from: vi.fn(() => ({
		select: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		upsert: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		neq: vi.fn().mockReturnThis(),
		gt: vi.fn().mockReturnThis(),
		gte: vi.fn().mockReturnThis(),
		lt: vi.fn().mockReturnThis(),
		lte: vi.fn().mockReturnThis(),
		like: vi.fn().mockReturnThis(),
		ilike: vi.fn().mockReturnThis(),
		is: vi.fn().mockReturnThis(),
		in: vi.fn().mockReturnThis(),
		order: vi.fn().mockReturnThis(),
		limit: vi.fn().mockReturnThis(),
		range: vi.fn().mockReturnThis(),
		single: vi.fn(),
		maybeSingle: vi.fn(),
	})),
};

export const createMockSupabaseClient = () => mockSupabaseClient;

export const resetSupabaseMocks = () => {
	vi.clearAllMocks();
};
