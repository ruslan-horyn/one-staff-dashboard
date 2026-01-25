import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useDebounce } from '../useDebounce';

describe('useDebounce', () => {
	describe('initial state', () => {
		it('returns initial value immediately', () => {
			const { result } = renderHook(() =>
				useDebounce('initial', { delay: 300 })
			);

			expect(result.current.debouncedValue).toBe('initial');
			expect(result.current.isPending).toBe(false);
		});

		it('works with different value types', () => {
			const { result: numberResult } = renderHook(() =>
				useDebounce(42, { delay: 300 })
			);
			expect(numberResult.current.debouncedValue).toBe(42);

			const { result: objectResult } = renderHook(() =>
				useDebounce({ foo: 'bar' }, { delay: 300 })
			);
			expect(objectResult.current.debouncedValue).toEqual({ foo: 'bar' });

			const { result: arrayResult } = renderHook(() =>
				useDebounce([1, 2, 3], { delay: 300 })
			);
			expect(arrayResult.current.debouncedValue).toEqual([1, 2, 3]);
		});
	});

	describe('debounce behavior', () => {
		it('sets isPending to true when value changes', () => {
			const { result, rerender } = renderHook(
				({ value }) => useDebounce(value, { delay: 300 }),
				{ initialProps: { value: 'initial' } }
			);

			rerender({ value: 'updated' });

			expect(result.current.isPending).toBe(true);
			expect(result.current.debouncedValue).toBe('initial');
		});

		it('updates debouncedValue after delay', () => {
			vi.useFakeTimers();

			const { result, rerender } = renderHook(
				({ value }) => useDebounce(value, { delay: 300 }),
				{ initialProps: { value: 'initial' } }
			);

			rerender({ value: 'updated' });
			expect(result.current.debouncedValue).toBe('initial');

			act(() => {
				vi.advanceTimersByTime(300);
			});

			expect(result.current.debouncedValue).toBe('updated');
			expect(result.current.isPending).toBe(false);

			vi.useRealTimers();
		});

		it('only applies last value when rapidly changing', () => {
			vi.useFakeTimers();

			const { result, rerender } = renderHook(
				({ value }) => useDebounce(value, { delay: 300 }),
				{ initialProps: { value: 'a' } }
			);

			rerender({ value: 'ab' });
			act(() => {
				vi.advanceTimersByTime(100);
			});

			rerender({ value: 'abc' });
			act(() => {
				vi.advanceTimersByTime(100);
			});

			rerender({ value: 'abcd' });
			act(() => {
				vi.advanceTimersByTime(300);
			});

			expect(result.current.debouncedValue).toBe('abcd');

			vi.useRealTimers();
		});

		it('updates immediately when delay is 0', () => {
			const { result, rerender } = renderHook(
				({ value }) => useDebounce(value, { delay: 0 }),
				{ initialProps: { value: 'initial' } }
			);

			rerender({ value: 'updated' });

			expect(result.current.debouncedValue).toBe('updated');
			expect(result.current.isPending).toBe(false);
		});
	});

	describe('flush', () => {
		it('immediately applies pending value', () => {
			vi.useFakeTimers();

			const { result, rerender } = renderHook(
				({ value }) => useDebounce(value, { delay: 300 }),
				{ initialProps: { value: 'initial' } }
			);

			rerender({ value: 'updated' });
			expect(result.current.debouncedValue).toBe('initial');
			expect(result.current.isPending).toBe(true);

			act(() => {
				result.current.flush();
			});

			expect(result.current.debouncedValue).toBe('updated');
			expect(result.current.isPending).toBe(false);

			vi.useRealTimers();
		});

		it('cancels pending timeout after flush', () => {
			vi.useFakeTimers();

			const { result, rerender } = renderHook(
				({ value }) => useDebounce(value, { delay: 300 }),
				{ initialProps: { value: 'initial' } }
			);

			rerender({ value: 'updated' });

			act(() => {
				result.current.flush();
			});

			// Advancing time shouldn't trigger another update
			rerender({ value: 'another' });
			act(() => {
				result.current.flush();
			});

			expect(result.current.debouncedValue).toBe('another');

			vi.useRealTimers();
		});
	});

	describe('cancel', () => {
		it('cancels pending update and keeps current debounced value', () => {
			vi.useFakeTimers();

			const { result, rerender } = renderHook(
				({ value }) => useDebounce(value, { delay: 300 }),
				{ initialProps: { value: 'initial' } }
			);

			rerender({ value: 'updated' });
			expect(result.current.isPending).toBe(true);

			act(() => {
				result.current.cancel();
			});

			expect(result.current.debouncedValue).toBe('initial');
			expect(result.current.isPending).toBe(false);

			// Even after delay, value should not update
			act(() => {
				vi.advanceTimersByTime(500);
			});

			expect(result.current.debouncedValue).toBe('initial');

			vi.useRealTimers();
		});
	});

	describe('leading edge', () => {
		it('fires immediately on every change when leading is true', () => {
			const { result, rerender } = renderHook(
				({ value }) => useDebounce(value, { delay: 300, leading: true }),
				{ initialProps: { value: 'initial' } }
			);

			expect(result.current.debouncedValue).toBe('initial');

			rerender({ value: 'updated' });

			// With leading edge, value updates immediately on change
			expect(result.current.debouncedValue).toBe('updated');
			expect(result.current.isPending).toBe(false);
		});
	});

	describe('cleanup', () => {
		it('cleans up timeout on unmount', () => {
			vi.useFakeTimers();
			const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

			const { result, rerender, unmount } = renderHook(
				({ value }) => useDebounce(value, { delay: 300 }),
				{ initialProps: { value: 'initial' } }
			);

			rerender({ value: 'updated' });
			expect(result.current.isPending).toBe(true);

			unmount();

			expect(clearTimeoutSpy).toHaveBeenCalled();

			clearTimeoutSpy.mockRestore();
			vi.useRealTimers();
		});
	});

	describe('return type', () => {
		it('returns all expected properties', () => {
			const { result } = renderHook(() => useDebounce('test', { delay: 300 }));

			expect(result.current).toHaveProperty('debouncedValue');
			expect(result.current).toHaveProperty('isPending');
			expect(result.current).toHaveProperty('flush');
			expect(result.current).toHaveProperty('cancel');

			expect(typeof result.current.flush).toBe('function');
			expect(typeof result.current.cancel).toBe('function');
		});
	});
});
