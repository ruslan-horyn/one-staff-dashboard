import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useRowSelection } from '../useRowSelection';

interface TestData {
	id: string;
	name: string;
}

const testData: TestData[] = [
	{ id: '1', name: 'Item 1' },
	{ id: '2', name: 'Item 2' },
	{ id: '3', name: 'Item 3' },
];

describe('useRowSelection', () => {
	describe('initial state', () => {
		it('returns empty selection initially', () => {
			const { result } = renderHook(() => useRowSelection({ data: testData }));

			expect(result.current.rowSelection).toEqual({});
		});
	});

	describe('onRowSelectionChange', () => {
		it('updates selection state with object', () => {
			const { result } = renderHook(() => useRowSelection({ data: testData }));

			act(() => {
				result.current.onRowSelectionChange({ 0: true, 1: true });
			});

			expect(result.current.rowSelection).toEqual({ 0: true, 1: true });
		});

		it('updates selection state with updater function', () => {
			const { result } = renderHook(() => useRowSelection({ data: testData }));

			act(() => {
				result.current.onRowSelectionChange({ 0: true });
			});

			act(() => {
				result.current.onRowSelectionChange((prev) => ({
					...prev,
					1: true,
				}));
			});

			expect(result.current.rowSelection).toEqual({ 0: true, 1: true });
		});

		it('calls onSelectionChange callback with selected rows', () => {
			const onSelectionChange = vi.fn();
			const { result } = renderHook(() =>
				useRowSelection({
					data: testData,
					onSelectionChange,
				})
			);

			act(() => {
				result.current.onRowSelectionChange({ 0: true, 2: true });
			});

			expect(onSelectionChange).toHaveBeenCalledWith([
				testData[0],
				testData[2],
			]);
		});

		it('filters out deselected rows when calling callback', () => {
			const onSelectionChange = vi.fn();
			const { result } = renderHook(() =>
				useRowSelection({
					data: testData,
					onSelectionChange,
				})
			);

			act(() => {
				result.current.onRowSelectionChange({ 0: true, 1: false, 2: true });
			});

			expect(onSelectionChange).toHaveBeenCalledWith([
				testData[0],
				testData[2],
			]);
		});
	});

	describe('clearSelection', () => {
		it('clears all selected rows', () => {
			const { result } = renderHook(() => useRowSelection({ data: testData }));

			act(() => {
				result.current.onRowSelectionChange({ 0: true, 1: true });
			});

			act(() => {
				result.current.clearSelection();
			});

			expect(result.current.rowSelection).toEqual({});
		});

		it('calls onSelectionChange with empty array', () => {
			const onSelectionChange = vi.fn();
			const { result } = renderHook(() =>
				useRowSelection({
					data: testData,
					onSelectionChange,
				})
			);

			act(() => {
				result.current.onRowSelectionChange({ 0: true });
			});

			act(() => {
				result.current.clearSelection();
			});

			expect(onSelectionChange).toHaveBeenLastCalledWith([]);
		});
	});

	describe('selectAll', () => {
		it('selects all rows', () => {
			const { result } = renderHook(() => useRowSelection({ data: testData }));

			act(() => {
				result.current.selectAll();
			});

			expect(result.current.rowSelection).toEqual({
				0: true,
				1: true,
				2: true,
			});
		});

		it('calls onSelectionChange with all data', () => {
			const onSelectionChange = vi.fn();
			const { result } = renderHook(() =>
				useRowSelection({
					data: testData,
					onSelectionChange,
				})
			);

			act(() => {
				result.current.selectAll();
			});

			expect(onSelectionChange).toHaveBeenCalledWith(testData);
		});
	});

	describe('data changes', () => {
		it('uses updated data when calculating selected rows', () => {
			const onSelectionChange = vi.fn();
			const { result, rerender } = renderHook(
				({ data }) =>
					useRowSelection({
						data,
						onSelectionChange,
					}),
				{ initialProps: { data: testData } }
			);

			const newData = [
				{ id: '4', name: 'New Item 1' },
				{ id: '5', name: 'New Item 2' },
			];

			rerender({ data: newData });

			act(() => {
				result.current.onRowSelectionChange({ 0: true });
			});

			expect(onSelectionChange).toHaveBeenCalledWith([newData[0]]);
		});
	});
});
