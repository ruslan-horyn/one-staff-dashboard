import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useModalState } from '../useModalState';

describe('useModalState', () => {
	describe('initial state', () => {
		it('starts with modal closed', () => {
			const { result } = renderHook(() => useModalState());

			expect(result.current.isOpen).toBe(false);
			expect(result.current.data).toBeNull();
		});
	});

	describe('open', () => {
		it('opens modal without data', () => {
			const { result } = renderHook(() => useModalState());

			act(() => {
				result.current.open();
			});

			expect(result.current.isOpen).toBe(true);
			expect(result.current.data).toBeNull();
		});

		it('opens modal with data', () => {
			const { result } = renderHook(() => useModalState<{ id: string }>());
			const testData = { id: '123' };

			act(() => {
				result.current.open(testData);
			});

			expect(result.current.isOpen).toBe(true);
			expect(result.current.data).toEqual(testData);
		});

		it('replaces previous data when opened with new data', () => {
			const { result } = renderHook(() => useModalState<{ id: string }>());

			act(() => {
				result.current.open({ id: 'first' });
			});

			act(() => {
				result.current.open({ id: 'second' });
			});

			expect(result.current.data).toEqual({ id: 'second' });
		});
	});

	describe('close', () => {
		it('closes the modal', () => {
			const { result } = renderHook(() => useModalState());

			act(() => {
				result.current.open();
			});

			act(() => {
				result.current.close();
			});

			expect(result.current.isOpen).toBe(false);
		});

		it('preserves data after close (for animations)', () => {
			const { result } = renderHook(() => useModalState<{ id: string }>());

			act(() => {
				result.current.open({ id: '123' });
			});

			act(() => {
				result.current.close();
			});

			expect(result.current.isOpen).toBe(false);
			expect(result.current.data).toEqual({ id: '123' });
		});
	});

	describe('callback stability', () => {
		it('maintains stable function references', () => {
			const { result, rerender } = renderHook(() => useModalState());

			const initialOpen = result.current.open;
			const initialClose = result.current.close;

			rerender();

			expect(result.current.open).toBe(initialOpen);
			expect(result.current.close).toBe(initialClose);
		});
	});
});
