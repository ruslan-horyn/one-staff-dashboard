import type { UserFilter } from '@/services/users/schemas';
import { DEFAULT_PAGE_SIZE } from '@/types/common';

interface RawSearchParams {
	page?: string;
	pageSize?: string;
	search?: string;
	sortBy?: string;
	sortOrder?: string;
}

/**
 * Parses URL search params into a validated UserFilter object.
 * Provides safe defaults for invalid or missing values.
 */
export const parseUserParams = (params: RawSearchParams): UserFilter => {
	const page = params.page ? Number.parseInt(params.page, 10) : 1;
	const pageSize = params.pageSize
		? Number.parseInt(params.pageSize, 10)
		: DEFAULT_PAGE_SIZE;

	const validSortBy = ['name', 'created_at'].includes(params.sortBy ?? '')
		? (params.sortBy as 'name' | 'created_at')
		: 'name';

	const validSortOrder = ['asc', 'desc'].includes(params.sortOrder ?? '')
		? (params.sortOrder as 'asc' | 'desc')
		: 'asc';

	return {
		page: Number.isNaN(page) || page < 1 ? 1 : page,
		pageSize:
			Number.isNaN(pageSize) || pageSize < 1 ? DEFAULT_PAGE_SIZE : pageSize,
		search: params.search || undefined,
		sortBy: validSortBy,
		sortOrder: validSortOrder,
	};
};
