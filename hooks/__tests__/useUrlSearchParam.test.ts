import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useUrlSearchParam } from '../useUrlSearchParam';

// Mock variables that can be changed per test
let mockPathname = '/test';
let mockSearchParams = new URLSearchParams();

// Mock router methods
const mockReplace = vi.fn();
const mockPush = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
	usePathname: () => mockPathname,
	useSearchParams: () => mockSearchParams,
	useRouter: () => ({
		replace: mockReplace,
		push: mockPush,
	}),
}));

describe('useUrlSearchParam', () => {
	beforeEach(() => {
		mockPathname = '/test';
		mockSearchParams = new URLSearchParams();
		mockReplace.mockClear();
		mockPush.mockClear();
	});

	describe('initial state', () => {
		it('returns empty string when param is not in URL', () => {
			const { result } = renderHook(() => useUrlSearchParam('search'));

			expect(result.current.value).toBe('');
		});

		it('returns URL value when param exists', () => {
			mockSearchParams = new URLSearchParams('search=test-query');

			const { result } = renderHook(() => useUrlSearchParam('search'));

			expect(result.current.value).toBe('test-query');
		});

		it('returns defaultValue when param is not in URL', () => {
			const { result } = renderHook(() =>
				useUrlSearchParam('filter', { defaultValue: 'all' })
			);

			expect(result.current.value).toBe('all');
		});
	});

	describe('setValue', () => {
		it('updates value state', () => {
			const { result } = renderHook(() => useUrlSearchParam('search'));

			act(() => {
				result.current.setValue('new-value');
			});

			expect(result.current.value).toBe('new-value');
		});

		it('updates URL with router.replace by default', () => {
			const { result } = renderHook(() => useUrlSearchParam('search'));

			act(() => {
				result.current.setValue('test');
			});

			expect(mockReplace).toHaveBeenCalledWith('/test?search=test');
		});

		it('uses router.push when replace is false', () => {
			const { result } = renderHook(() =>
				useUrlSearchParam('search', { replace: false })
			);

			act(() => {
				result.current.setValue('test');
			});

			expect(mockPush).toHaveBeenCalledWith('/test?search=test');
		});

		it('preserves existing URL params', () => {
			mockSearchParams = new URLSearchParams('page=2&sort=name');

			const { result } = renderHook(() => useUrlSearchParam('search'));

			act(() => {
				result.current.setValue('query');
			});

			expect(mockReplace).toHaveBeenCalledWith(
				expect.stringContaining('page=2')
			);
			expect(mockReplace).toHaveBeenCalledWith(
				expect.stringContaining('sort=name')
			);
			expect(mockReplace).toHaveBeenCalledWith(
				expect.stringContaining('search=query')
			);
		});
	});

	describe('clearValue', () => {
		it('clears value state', () => {
			mockSearchParams = new URLSearchParams('search=existing');

			const { result } = renderHook(() => useUrlSearchParam('search'));

			expect(result.current.value).toBe('existing');

			act(() => {
				result.current.clearValue();
			});

			expect(result.current.value).toBe('');
		});

		it('removes param from URL', () => {
			mockSearchParams = new URLSearchParams('search=existing&page=1');

			const { result } = renderHook(() => useUrlSearchParam('search'));

			act(() => {
				result.current.clearValue();
			});

			expect(mockReplace).toHaveBeenCalledWith('/test?page=1');
		});

		it('removes query string entirely when last param', () => {
			mockSearchParams = new URLSearchParams('search=existing');

			const { result } = renderHook(() => useUrlSearchParam('search'));

			act(() => {
				result.current.clearValue();
			});

			expect(mockReplace).toHaveBeenCalledWith('/test');
		});
	});

	describe('return type', () => {
		it('returns all expected properties', () => {
			const { result } = renderHook(() => useUrlSearchParam('search'));

			expect(result.current).toHaveProperty('value');
			expect(result.current).toHaveProperty('setValue');
			expect(result.current).toHaveProperty('clearValue');

			expect(typeof result.current.setValue).toBe('function');
			expect(typeof result.current.clearValue).toBe('function');
		});
	});
});
