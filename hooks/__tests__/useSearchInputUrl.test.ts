import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSearchInputUrl } from '../useSearchInputUrl';

// Mock variables that can be changed per test
let mockPathname = '/test';
let mockSearchParams = new URLSearchParams();

// Mock next/navigation
vi.mock('next/navigation', () => ({
	usePathname: () => mockPathname,
	useSearchParams: () => mockSearchParams,
	useRouter: () => ({
		replace: vi.fn((url: string) => {
			window.history.replaceState(null, '', url);
		}),
		push: vi.fn((url: string) => {
			window.history.pushState(null, '', url);
		}),
	}),
}));

describe('useSearchInputUrl', () => {
	beforeEach(() => {
		mockPathname = '/test';
		mockSearchParams = new URLSearchParams();

		// Mock history methods
		vi.spyOn(window.history, 'replaceState').mockImplementation(() => {});
		vi.spyOn(window.history, 'pushState').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('initial state', () => {
		it('returns empty value when URL param is not set', () => {
			const { result } = renderHook(() =>
				useSearchInputUrl({ urlParam: 'search' })
			);

			expect(result.current.value).toBe('');
			expect(result.current.searchValue).toBe('');
			expect(result.current.isDebouncing).toBe(false);
		});

		it('uses initial value from URL parameter', () => {
			mockSearchParams = new URLSearchParams('search=initial-query');

			const { result } = renderHook(() =>
				useSearchInputUrl({ urlParam: 'search' })
			);

			expect(result.current.value).toBe('initial-query');
			expect(result.current.searchValue).toBe('initial-query');
		});
	});

	describe('URL sync on value change', () => {
		it('updates URL when value changes', () => {
			vi.useFakeTimers();
			const { result } = renderHook(() =>
				useSearchInputUrl({ urlParam: 'search', debounceMs: 100 })
			);

			act(() => {
				result.current.onChange('test-query');
			});

			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(window.history.replaceState).toHaveBeenCalledWith(
				null,
				'',
				'/test?search=test-query'
			);

			vi.useRealTimers();
		});

		it('calls onSearch callback after debounce', () => {
			vi.useFakeTimers();
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInputUrl({ urlParam: 'search', debounceMs: 100, onSearch })
			);

			act(() => {
				result.current.onChange('query');
			});

			expect(onSearch).not.toHaveBeenCalled();

			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(onSearch).toHaveBeenCalledWith('query');

			vi.useRealTimers();
		});
	});

	describe('browser back/forward navigation sync', () => {
		it('syncs input value when URL changes externally', () => {
			mockSearchParams = new URLSearchParams('search=initial');

			const onSearch = vi.fn();
			const { result, rerender } = renderHook(() =>
				useSearchInputUrl({ urlParam: 'search', debounceMs: 0, onSearch })
			);

			expect(result.current.value).toBe('initial');

			// Simulate browser back/forward changing URL
			mockSearchParams = new URLSearchParams('search=from-navigation');

			act(() => {
				rerender();
			});

			expect(result.current.value).toBe('from-navigation');
			expect(onSearch).toHaveBeenCalledWith('from-navigation');
		});

		it('syncs to empty when URL param is removed', () => {
			mockSearchParams = new URLSearchParams('search=initial');

			const onSearch = vi.fn();
			const { result, rerender } = renderHook(() =>
				useSearchInputUrl({ urlParam: 'search', debounceMs: 0, onSearch })
			);

			expect(result.current.value).toBe('initial');

			// Simulate browser navigation removing the param
			mockSearchParams = new URLSearchParams('');

			act(() => {
				rerender();
			});

			expect(result.current.value).toBe('');
			expect(onSearch).toHaveBeenCalledWith('');
		});
	});

	describe('clear', () => {
		it('clears both input value and URL parameter', () => {
			vi.useFakeTimers();
			mockSearchParams = new URLSearchParams('search=existing');

			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInputUrl({ urlParam: 'search', debounceMs: 0, onSearch })
			);

			expect(result.current.value).toBe('existing');

			act(() => {
				result.current.clear();
			});

			expect(result.current.value).toBe('');
			expect(onSearch).toHaveBeenCalledWith('');
			expect(window.history.replaceState).toHaveBeenCalledWith(
				null,
				'',
				'/test'
			);

			vi.useRealTimers();
		});

		it('preserves other URL params when clearing', () => {
			mockSearchParams = new URLSearchParams('search=existing&page=2');

			const { result } = renderHook(() =>
				useSearchInputUrl({ urlParam: 'search', debounceMs: 0 })
			);

			act(() => {
				result.current.clear();
			});

			expect(window.history.replaceState).toHaveBeenCalledWith(
				null,
				'',
				'/test?page=2'
			);
		});
	});

	describe('minChars validation with URL', () => {
		it('does not update URL when value is below minChars', () => {
			vi.useFakeTimers();
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInputUrl({
					urlParam: 'search',
					debounceMs: 100,
					onSearch,
					minChars: 3,
				})
			);

			act(() => {
				result.current.onChange('ab');
			});

			act(() => {
				vi.advanceTimersByTime(100);
			});

			// onSearch should not be called
			expect(onSearch).not.toHaveBeenCalled();
			// URL should be cleared (not set to 'ab')
			expect(window.history.replaceState).toHaveBeenCalledWith(
				null,
				'',
				'/test'
			);

			vi.useRealTimers();
		});

		it('updates URL when value meets minChars', () => {
			vi.useFakeTimers();
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInputUrl({
					urlParam: 'search',
					debounceMs: 100,
					onSearch,
					minChars: 3,
				})
			);

			act(() => {
				result.current.onChange('abc');
			});

			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(onSearch).toHaveBeenCalledWith('abc');
			expect(window.history.replaceState).toHaveBeenCalledWith(
				null,
				'',
				'/test?search=abc'
			);

			vi.useRealTimers();
		});

		it('clears URL when value drops below minChars', () => {
			vi.useFakeTimers();
			mockSearchParams = new URLSearchParams('search=existing');

			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInputUrl({
					urlParam: 'search',
					debounceMs: 100,
					onSearch,
					minChars: 3,
				})
			);

			act(() => {
				result.current.onChange('ab');
			});

			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(window.history.replaceState).toHaveBeenCalledWith(
				null,
				'',
				'/test'
			);

			vi.useRealTimers();
		});
	});

	describe('return value types', () => {
		it('returns all expected properties matching UseSearchInputReturn', () => {
			const { result } = renderHook(() =>
				useSearchInputUrl({ urlParam: 'search' })
			);

			expect(result.current).toHaveProperty('value');
			expect(result.current).toHaveProperty('searchValue');
			expect(result.current).toHaveProperty('onChange');
			expect(result.current).toHaveProperty('setValue');
			expect(result.current).toHaveProperty('clear');
			expect(result.current).toHaveProperty('isDebouncing');

			expect(typeof result.current.value).toBe('string');
			expect(typeof result.current.searchValue).toBe('string');
			expect(typeof result.current.onChange).toBe('function');
			expect(typeof result.current.setValue).toBe('function');
			expect(typeof result.current.clear).toBe('function');
			expect(typeof result.current.isDebouncing).toBe('boolean');
		});
	});

	describe('debouncing', () => {
		it('shows isDebouncing true during debounce', () => {
			vi.useFakeTimers();
			const { result } = renderHook(() =>
				useSearchInputUrl({ urlParam: 'search', debounceMs: 100 })
			);

			act(() => {
				result.current.onChange('test');
			});

			expect(result.current.isDebouncing).toBe(true);

			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(result.current.isDebouncing).toBe(false);

			vi.useRealTimers();
		});

		it('works immediately with debounceMs 0', () => {
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInputUrl({ urlParam: 'search', debounceMs: 0, onSearch })
			);

			act(() => {
				result.current.onChange('test');
			});

			expect(result.current.value).toBe('test');
			expect(result.current.searchValue).toBe('test');
			expect(result.current.isDebouncing).toBe(false);
			expect(onSearch).toHaveBeenCalledWith('test');
		});
	});
});
