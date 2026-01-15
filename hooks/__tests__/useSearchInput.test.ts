import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSearchInput } from '../useSearchInput';

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		replace: vi.fn(),
	}),
	usePathname: () => '/test',
	useSearchParams: () => new URLSearchParams(),
}));

describe('useSearchInput', () => {
	describe('initial state', () => {
		it('returns empty value by default', () => {
			const { result } = renderHook(() => useSearchInput());

			expect(result.current.value).toBe('');
			expect(result.current.debouncedValue).toBe('');
			expect(result.current.isDebouncing).toBe(false);
		});

		it('uses defaultValue when provided', () => {
			const { result } = renderHook(() =>
				useSearchInput({ defaultValue: 'initial' })
			);

			expect(result.current.value).toBe('initial');
			expect(result.current.debouncedValue).toBe('initial');
		});
	});

	describe('onChange', () => {
		it('updates value immediately', () => {
			const { result } = renderHook(() => useSearchInput());

			act(() => {
				result.current.onChange('test');
			});

			expect(result.current.value).toBe('test');
		});

		it('sets isDebouncing to true during debounce', () => {
			const { result } = renderHook(() => useSearchInput({ debounceMs: 100 }));

			act(() => {
				result.current.onChange('test');
			});

			expect(result.current.isDebouncing).toBe(true);
		});

		it('updates debouncedValue immediately when debounceMs is 0', () => {
			const { result } = renderHook(() => useSearchInput({ debounceMs: 0 }));

			act(() => {
				result.current.onChange('test');
			});

			expect(result.current.value).toBe('test');
			expect(result.current.debouncedValue).toBe('test');
			expect(result.current.isDebouncing).toBe(false);
		});
	});

	describe('onSearch callback', () => {
		it('calls onSearch immediately when debounceMs is 0', () => {
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInput({ debounceMs: 0, onSearch })
			);

			act(() => {
				result.current.onChange('test');
			});

			expect(onSearch).toHaveBeenCalledWith('test');
		});
	});

	describe('clear', () => {
		it('clears value immediately', () => {
			const { result } = renderHook(() =>
				useSearchInput({ defaultValue: 'test', debounceMs: 0 })
			);

			act(() => {
				result.current.clear();
			});

			expect(result.current.value).toBe('');
			expect(result.current.debouncedValue).toBe('');
		});

		it('sets isDebouncing to false', () => {
			const { result } = renderHook(() => useSearchInput({ debounceMs: 100 }));

			act(() => {
				result.current.onChange('test');
			});

			expect(result.current.isDebouncing).toBe(true);

			act(() => {
				result.current.clear();
			});

			expect(result.current.isDebouncing).toBe(false);
		});

		it('calls onSearch with empty string', () => {
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInput({ defaultValue: 'test', onSearch, debounceMs: 0 })
			);

			act(() => {
				result.current.clear();
			});

			expect(onSearch).toHaveBeenCalledWith('');
		});
	});

	describe('return value types', () => {
		it('returns all expected properties', () => {
			const { result } = renderHook(() => useSearchInput());

			expect(result.current).toHaveProperty('value');
			expect(result.current).toHaveProperty('debouncedValue');
			expect(result.current).toHaveProperty('onChange');
			expect(result.current).toHaveProperty('clear');
			expect(result.current).toHaveProperty('isDebouncing');

			expect(typeof result.current.onChange).toBe('function');
			expect(typeof result.current.clear).toBe('function');
		});
	});
});
