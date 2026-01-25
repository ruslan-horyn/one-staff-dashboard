import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useSearchInput } from '../useSearchInput';

describe('useSearchInput', () => {
	describe('initial state', () => {
		it('returns empty value by default', () => {
			const { result } = renderHook(() => useSearchInput());

			expect(result.current.value).toBe('');
			expect(result.current.searchValue).toBe('');
			expect(result.current.isDebouncing).toBe(false);
		});

		it('uses defaultValue when provided', () => {
			const { result } = renderHook(() =>
				useSearchInput({ defaultValue: 'initial' })
			);

			expect(result.current.value).toBe('initial');
			expect(result.current.searchValue).toBe('initial');
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

		it('updates searchValue immediately when debounceMs is 0', () => {
			const { result } = renderHook(() => useSearchInput({ debounceMs: 0 }));

			act(() => {
				result.current.onChange('test');
			});

			expect(result.current.value).toBe('test');
			expect(result.current.searchValue).toBe('test');
			expect(result.current.isDebouncing).toBe(false);
		});
	});

	describe('setValue', () => {
		it('updates value immediately', () => {
			const { result } = renderHook(() => useSearchInput());

			act(() => {
				result.current.setValue('external');
			});

			expect(result.current.value).toBe('external');
		});

		it('does not trigger onSearch callback', () => {
			vi.useFakeTimers();
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInput({ debounceMs: 0, onSearch })
			);

			act(() => {
				result.current.setValue('external');
			});

			act(() => {
				vi.advanceTimersByTime(100);
			});

			// setValue updates lastProcessedRef, so onSearch should not be called
			expect(onSearch).not.toHaveBeenCalled();

			vi.useRealTimers();
		});

		it('can be used for external sync like browser back/forward', () => {
			vi.useFakeTimers();
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInput({ debounceMs: 100, onSearch })
			);

			// Simulate user typing
			act(() => {
				result.current.onChange('typed');
			});

			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(onSearch).toHaveBeenCalledWith('typed');

			// Simulate browser back/forward changing the URL
			act(() => {
				result.current.setValue('from-url');
			});

			// Value should be updated
			expect(result.current.value).toBe('from-url');
			// But onSearch should not be called again
			expect(onSearch).toHaveBeenCalledTimes(1);

			vi.useRealTimers();
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

		it('calls onSearch after debounce delay', () => {
			vi.useFakeTimers();
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInput({ debounceMs: 300, onSearch })
			);

			act(() => {
				result.current.onChange('test');
			});

			expect(onSearch).not.toHaveBeenCalled();

			act(() => {
				vi.advanceTimersByTime(300);
			});

			expect(onSearch).toHaveBeenCalledWith('test');

			vi.useRealTimers();
		});

		it('allows parent to implement minChars validation in onSearch', () => {
			vi.useFakeTimers();
			const fetchData = vi.fn();
			const { result } = renderHook(() =>
				useSearchInput({
					debounceMs: 100,
					onSearch: (query) => {
						if (query.length >= 3 || query === '') {
							fetchData(query);
						}
					},
				})
			);

			act(() => {
				result.current.onChange('ab');
			});
			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(fetchData).not.toHaveBeenCalled();

			act(() => {
				result.current.onChange('abc');
			});
			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(fetchData).toHaveBeenCalledWith('abc');

			vi.useRealTimers();
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
			expect(result.current.searchValue).toBe('');
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

	describe('derived state in parent', () => {
		it('parent can compute hasActiveSearch from searchValue', () => {
			const { result } = renderHook(() =>
				useSearchInput({ defaultValue: 'test', debounceMs: 0 })
			);

			const hasActiveSearch = result.current.searchValue !== '';
			expect(hasActiveSearch).toBe(true);

			act(() => {
				result.current.clear();
			});

			const hasActiveSearchAfterClear = result.current.searchValue !== '';
			expect(hasActiveSearchAfterClear).toBe(false);
		});

		it('parent can compute isValid from value with custom minChars', () => {
			const { result } = renderHook(() => useSearchInput({ debounceMs: 0 }));

			const minChars = 3;
			const isValid = (val: string) => val.length >= minChars || val === '';

			expect(isValid(result.current.value)).toBe(true);

			act(() => {
				result.current.onChange('ab');
			});

			expect(isValid(result.current.value)).toBe(false);

			act(() => {
				result.current.onChange('abc');
			});

			expect(isValid(result.current.value)).toBe(true);
		});
	});

	describe('minChars option', () => {
		it('does not trigger onSearch when value is below minChars', () => {
			vi.useFakeTimers();
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInput({ debounceMs: 100, onSearch, minChars: 3 })
			);

			act(() => {
				result.current.onChange('ab');
			});
			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(onSearch).not.toHaveBeenCalled();

			vi.useRealTimers();
		});

		it('triggers onSearch when value meets minChars', () => {
			vi.useFakeTimers();
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInput({ debounceMs: 100, onSearch, minChars: 3 })
			);

			act(() => {
				result.current.onChange('abc');
			});
			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(onSearch).toHaveBeenCalledWith('abc');

			vi.useRealTimers();
		});

		it('always triggers onSearch when value is empty (clear)', () => {
			vi.useFakeTimers();
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInput({
					debounceMs: 100,
					onSearch,
					minChars: 3,
					defaultValue: 'test',
				})
			);

			act(() => {
				result.current.clear();
			});

			expect(onSearch).toHaveBeenCalledWith('');

			vi.useRealTimers();
		});

		it('triggers onSearch for values longer than minChars', () => {
			vi.useFakeTimers();
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInput({ debounceMs: 100, onSearch, minChars: 3 })
			);

			act(() => {
				result.current.onChange('abcdef');
			});
			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(onSearch).toHaveBeenCalledWith('abcdef');

			vi.useRealTimers();
		});

		it('does not affect value updates, only callback triggering', () => {
			vi.useFakeTimers();
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInput({ debounceMs: 100, onSearch, minChars: 3 })
			);

			act(() => {
				result.current.onChange('ab');
			});

			// Value should update immediately
			expect(result.current.value).toBe('ab');

			act(() => {
				vi.advanceTimersByTime(100);
			});

			// searchValue should update too
			expect(result.current.searchValue).toBe('ab');
			// But onSearch should not be called
			expect(onSearch).not.toHaveBeenCalled();

			vi.useRealTimers();
		});

		it('works with minChars of 0 (default behavior)', () => {
			vi.useFakeTimers();
			const onSearch = vi.fn();
			const { result } = renderHook(() =>
				useSearchInput({ debounceMs: 100, onSearch, minChars: 0 })
			);

			act(() => {
				result.current.onChange('a');
			});
			act(() => {
				vi.advanceTimersByTime(100);
			});

			expect(onSearch).toHaveBeenCalledWith('a');

			vi.useRealTimers();
		});
	});

	describe('return value types', () => {
		it('returns all expected properties', () => {
			const { result } = renderHook(() => useSearchInput());

			expect(result.current).toHaveProperty('value');
			expect(result.current).toHaveProperty('searchValue');
			expect(result.current).toHaveProperty('onChange');
			expect(result.current).toHaveProperty('setValue');
			expect(result.current).toHaveProperty('clear');
			expect(result.current).toHaveProperty('isDebouncing');

			expect(typeof result.current.onChange).toBe('function');
			expect(typeof result.current.setValue).toBe('function');
			expect(typeof result.current.clear).toBe('function');
		});

		it('does not return removed properties (isValid, hasActiveSearch, syncWithUrlParam)', () => {
			const { result } = renderHook(() => useSearchInput());

			expect(result.current).not.toHaveProperty('isValid');
			expect(result.current).not.toHaveProperty('hasActiveSearch');
			expect(result.current).not.toHaveProperty('debouncedValue');
		});
	});
});
