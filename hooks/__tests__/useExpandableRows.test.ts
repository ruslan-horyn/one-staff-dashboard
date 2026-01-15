import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { useExpandableRows } from '../useExpandableRows';

describe('useExpandableRows', () => {
	describe('initial state', () => {
		it('returns empty expanded rows initially', () => {
			const { result } = renderHook(() => useExpandableRows());

			expect(result.current.expandedRows).toEqual({});
		});

		it('isExpanded returns false for any row', () => {
			const { result } = renderHook(() => useExpandableRows());

			expect(result.current.isExpanded('row-1')).toBe(false);
			expect(result.current.isExpanded('row-2')).toBe(false);
		});
	});

	describe('toggleRow (single expansion mode)', () => {
		it('expands a row when toggled', () => {
			const { result } = renderHook(() => useExpandableRows());

			act(() => {
				result.current.toggleRow('row-1');
			});

			expect(result.current.isExpanded('row-1')).toBe(true);
			expect(result.current.expandedRows).toEqual({ 'row-1': true });
		});

		it('collapses a row when toggled again', () => {
			const { result } = renderHook(() => useExpandableRows());

			act(() => {
				result.current.toggleRow('row-1');
			});

			act(() => {
				result.current.toggleRow('row-1');
			});

			expect(result.current.isExpanded('row-1')).toBe(false);
		});

		it('collapses previous row when expanding another (single mode)', () => {
			const { result } = renderHook(() => useExpandableRows());

			act(() => {
				result.current.toggleRow('row-1');
			});

			act(() => {
				result.current.toggleRow('row-2');
			});

			expect(result.current.isExpanded('row-1')).toBe(false);
			expect(result.current.isExpanded('row-2')).toBe(true);
		});
	});

	describe('toggleRow (multiple expansion mode)', () => {
		it('allows multiple rows to be expanded', () => {
			const { result } = renderHook(() =>
				useExpandableRows({ allowMultiple: true })
			);

			act(() => {
				result.current.toggleRow('row-1');
			});

			act(() => {
				result.current.toggleRow('row-2');
			});

			expect(result.current.isExpanded('row-1')).toBe(true);
			expect(result.current.isExpanded('row-2')).toBe(true);
		});

		it('toggles individual rows independently', () => {
			const { result } = renderHook(() =>
				useExpandableRows({ allowMultiple: true })
			);

			act(() => {
				result.current.toggleRow('row-1');
				result.current.toggleRow('row-2');
			});

			act(() => {
				result.current.toggleRow('row-1');
			});

			expect(result.current.isExpanded('row-1')).toBe(false);
			expect(result.current.isExpanded('row-2')).toBe(true);
		});
	});

	describe('expandRow', () => {
		it('expands a specific row', () => {
			const { result } = renderHook(() => useExpandableRows());

			act(() => {
				result.current.expandRow('row-1');
			});

			expect(result.current.isExpanded('row-1')).toBe(true);
		});

		it('keeps row expanded if already expanded', () => {
			const { result } = renderHook(() => useExpandableRows());

			act(() => {
				result.current.expandRow('row-1');
			});

			act(() => {
				result.current.expandRow('row-1');
			});

			expect(result.current.isExpanded('row-1')).toBe(true);
		});

		it('collapses other rows in single mode', () => {
			const { result } = renderHook(() => useExpandableRows());

			act(() => {
				result.current.expandRow('row-1');
			});

			act(() => {
				result.current.expandRow('row-2');
			});

			expect(result.current.isExpanded('row-1')).toBe(false);
			expect(result.current.isExpanded('row-2')).toBe(true);
		});
	});

	describe('collapseRow', () => {
		it('collapses a specific row', () => {
			const { result } = renderHook(() => useExpandableRows());

			act(() => {
				result.current.expandRow('row-1');
			});

			act(() => {
				result.current.collapseRow('row-1');
			});

			expect(result.current.isExpanded('row-1')).toBe(false);
		});

		it('does nothing if row is not expanded', () => {
			const { result } = renderHook(() => useExpandableRows());

			act(() => {
				result.current.collapseRow('row-1');
			});

			expect(result.current.expandedRows).toEqual({});
		});

		it('keeps other rows expanded in multiple mode', () => {
			const { result } = renderHook(() =>
				useExpandableRows({ allowMultiple: true })
			);

			act(() => {
				result.current.expandRow('row-1');
				result.current.expandRow('row-2');
			});

			act(() => {
				result.current.collapseRow('row-1');
			});

			expect(result.current.isExpanded('row-1')).toBe(false);
			expect(result.current.isExpanded('row-2')).toBe(true);
		});
	});

	describe('collapseAll', () => {
		it('collapses all expanded rows', () => {
			const { result } = renderHook(() =>
				useExpandableRows({ allowMultiple: true })
			);

			act(() => {
				result.current.expandRow('row-1');
				result.current.expandRow('row-2');
				result.current.expandRow('row-3');
			});

			act(() => {
				result.current.collapseAll();
			});

			expect(result.current.expandedRows).toEqual({});
			expect(result.current.isExpanded('row-1')).toBe(false);
			expect(result.current.isExpanded('row-2')).toBe(false);
			expect(result.current.isExpanded('row-3')).toBe(false);
		});
	});
});
