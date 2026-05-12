'use client';

import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

import { DEFAULT_PAGE_SIZE } from '@/types/common';

interface UseTableParamsOptions {
	defaultPageSize?: number;
	defaultSortBy?: string;
	defaultSortOrder?: 'asc' | 'desc';
}

interface TableParams {
	page: number;
	pageSize: number;
	sortBy: string | null;
	sortOrder: 'asc' | 'desc';
	setPage: (page: number) => void;
	setPageSize: (size: number) => void;
	setSorting: (sortBy: string | null, order: 'asc' | 'desc') => void;
	resetParams: () => void;
}

function useTableParams(options: UseTableParamsOptions = {}): TableParams {
	const {
		defaultPageSize = DEFAULT_PAGE_SIZE,
		defaultSortBy,
		defaultSortOrder = 'asc',
	} = options;

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const pageParam = searchParams.get('page');
	const parsedPage = pageParam ? Number.parseInt(pageParam, 10) : 1;
	const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;

	const pageSizeParam = searchParams.get('pageSize');
	const parsedPageSize = pageSizeParam
		? Number.parseInt(pageSizeParam, 10)
		: defaultPageSize;
	const pageSize =
		Number.isNaN(parsedPageSize) || parsedPageSize < 1
			? defaultPageSize
			: parsedPageSize;

	const sortBy = searchParams.get('sortBy') ?? defaultSortBy ?? null;

	const sortOrderParam = searchParams.get('sortOrder');
	const sortOrder: 'asc' | 'desc' =
		sortOrderParam === 'asc' || sortOrderParam === 'desc'
			? sortOrderParam
			: defaultSortOrder;

	const updateParams = useCallback(
		(updates: Record<string, string | null>) => {
			const params = new URLSearchParams(searchParams.toString());

			for (const [key, value] of Object.entries(updates)) {
				if (value === null) {
					params.delete(key);
				} else {
					params.set(key, value);
				}
			}

			router.push(`${pathname}?${params.toString()}` as Route, {
				scroll: false,
			});
		},
		[router, pathname, searchParams]
	);

	const setPage = useCallback(
		(newPage: number) => {
			updateParams({
				page: newPage === 1 ? null : newPage.toString(),
			});
		},
		[updateParams]
	);

	const setPageSize = useCallback(
		(newPageSize: number) => {
			updateParams({
				pageSize:
					newPageSize === defaultPageSize ? null : newPageSize.toString(),
				page: null,
			});
		},
		[updateParams, defaultPageSize]
	);

	const setSorting = useCallback(
		(newSortBy: string | null, newSortOrder: 'asc' | 'desc') => {
			updateParams({
				sortBy: newSortBy,
				sortOrder: newSortBy ? newSortOrder : null,
				page: null,
			});
		},
		[updateParams]
	);

	const resetParams = useCallback(() => {
		router.push(pathname as Route, { scroll: false });
	}, [router, pathname]);

	return {
		page,
		pageSize,
		sortBy,
		sortOrder,
		setPage,
		setPageSize,
		setSorting,
		resetParams,
	};
}

export { useTableParams };
export type { TableParams, UseTableParamsOptions };
