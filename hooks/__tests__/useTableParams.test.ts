import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_PAGE_SIZE } from '@/types/common';
import { useTableParams } from '../useTableParams';

// Mock next/navigation
const mockPush = vi.fn();
const mockGet = vi.fn();

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
	}),
	usePathname: () => '/workers',
	useSearchParams: () => ({
		get: mockGet,
		toString: () => '',
	}),
}));

describe('useTableParams', () => {
	beforeEach(() => {
		mockPush.mockClear();
		mockGet.mockClear();
		mockGet.mockReturnValue(null);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('initial state', () => {
		it('returns default values when no URL params', () => {
			const { result } = renderHook(() => useTableParams());

			expect(result.current.page).toBe(1);
			expect(result.current.pageSize).toBe(DEFAULT_PAGE_SIZE);
			expect(result.current.sortBy).toBeNull();
			expect(result.current.sortOrder).toBe('asc');
		});

		it('uses custom default values', () => {
			const { result } = renderHook(() =>
				useTableParams({
					defaultPageSize: 50,
					defaultSortBy: 'name',
					defaultSortOrder: 'desc',
				})
			);

			expect(result.current.page).toBe(1);
			expect(result.current.pageSize).toBe(50);
			expect(result.current.sortBy).toBe('name');
			expect(result.current.sortOrder).toBe('desc');
		});
	});

	describe('URL param parsing', () => {
		it('parses page from URL', () => {
			mockGet.mockImplementation((key: string) => {
				if (key === 'page') return '3';
				return null;
			});

			const { result } = renderHook(() => useTableParams());

			expect(result.current.page).toBe(3);
		});

		it('parses pageSize from URL', () => {
			mockGet.mockImplementation((key: string) => {
				if (key === 'pageSize') return '50';
				return null;
			});

			const { result } = renderHook(() => useTableParams());

			expect(result.current.pageSize).toBe(50);
		});

		it('parses sortBy from URL', () => {
			mockGet.mockImplementation((key: string) => {
				if (key === 'sortBy') return 'name';
				return null;
			});

			const { result } = renderHook(() => useTableParams());

			expect(result.current.sortBy).toBe('name');
		});

		it('parses sortOrder from URL', () => {
			mockGet.mockImplementation((key: string) => {
				if (key === 'sortOrder') return 'desc';
				return null;
			});

			const { result } = renderHook(() => useTableParams());

			expect(result.current.sortOrder).toBe('desc');
		});

		it('falls back to default for invalid page', () => {
			mockGet.mockImplementation((key: string) => {
				if (key === 'page') return 'invalid';
				return null;
			});

			const { result } = renderHook(() => useTableParams());

			expect(result.current.page).toBe(1);
		});

		it('falls back to default for page < 1', () => {
			mockGet.mockImplementation((key: string) => {
				if (key === 'page') return '0';
				return null;
			});

			const { result } = renderHook(() => useTableParams());

			expect(result.current.page).toBe(1);
		});

		it('falls back to default for invalid sortOrder', () => {
			mockGet.mockImplementation((key: string) => {
				if (key === 'sortOrder') return 'invalid';
				return null;
			});

			const { result } = renderHook(() => useTableParams());

			expect(result.current.sortOrder).toBe('asc');
		});
	});

	describe('setPage', () => {
		it('updates URL with new page', () => {
			const { result } = renderHook(() => useTableParams());

			act(() => {
				result.current.setPage(3);
			});

			expect(mockPush).toHaveBeenCalledWith('/workers?page=3', {
				scroll: false,
			});
		});

		it('removes page param when setting to 1', () => {
			const { result } = renderHook(() => useTableParams());

			act(() => {
				result.current.setPage(1);
			});

			expect(mockPush).toHaveBeenCalledWith('/workers?', { scroll: false });
		});
	});

	describe('setPageSize', () => {
		it('updates URL with new pageSize', () => {
			const { result } = renderHook(() => useTableParams());

			act(() => {
				result.current.setPageSize(50);
			});

			expect(mockPush).toHaveBeenCalledWith('/workers?pageSize=50', {
				scroll: false,
			});
		});

		it('removes pageSize param when setting to default', () => {
			const { result } = renderHook(() => useTableParams());

			act(() => {
				result.current.setPageSize(DEFAULT_PAGE_SIZE);
			});

			expect(mockPush).toHaveBeenCalledWith('/workers?', { scroll: false });
		});

		it('resets page to 1 when changing pageSize', () => {
			mockGet.mockImplementation((key: string) => {
				if (key === 'page') return '5';
				return null;
			});

			const { result } = renderHook(() => useTableParams());

			act(() => {
				result.current.setPageSize(50);
			});

			// Page param should not be included (reset to default)
			expect(mockPush).toHaveBeenCalledWith('/workers?pageSize=50', {
				scroll: false,
			});
		});
	});

	describe('setSorting', () => {
		it('updates URL with sort params', () => {
			const { result } = renderHook(() => useTableParams());

			act(() => {
				result.current.setSorting('name', 'desc');
			});

			expect(mockPush).toHaveBeenCalledWith(
				'/workers?sortBy=name&sortOrder=desc',
				{ scroll: false }
			);
		});

		it('removes sort params when sortBy is null', () => {
			mockGet.mockImplementation((key: string) => {
				if (key === 'sortBy') return 'name';
				if (key === 'sortOrder') return 'desc';
				return null;
			});

			const { result } = renderHook(() => useTableParams());

			act(() => {
				result.current.setSorting(null, 'asc');
			});

			expect(mockPush).toHaveBeenCalledWith('/workers?', { scroll: false });
		});

		it('resets page when changing sort', () => {
			mockGet.mockImplementation((key: string) => {
				if (key === 'page') return '5';
				return null;
			});

			const { result } = renderHook(() => useTableParams());

			act(() => {
				result.current.setSorting('name', 'asc');
			});

			// Page param should not be included (reset to default)
			expect(mockPush).toHaveBeenCalledWith(
				'/workers?sortBy=name&sortOrder=asc',
				{ scroll: false }
			);
		});
	});

	describe('resetParams', () => {
		it('navigates to pathname without params', () => {
			const { result } = renderHook(() => useTableParams());

			act(() => {
				result.current.resetParams();
			});

			expect(mockPush).toHaveBeenCalledWith('/workers', { scroll: false });
		});
	});
});
