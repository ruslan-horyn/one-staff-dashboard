import { PageContainer } from '@/components/layout/pageContainer';
import { PageHeader } from '@/components/layout/pageHeader';
import { isSuccess } from '@/services/shared/result';
import { getUsers } from '@/services/users/actions';
import { DEFAULT_PAGE_SIZE } from '@/types/common';

import { UserDataTable } from './_components/UserDataTable';
import { parseUserParams } from './_utils/parseUserParams';

interface UsersPageProps {
	searchParams: Promise<{
		page?: string;
		pageSize?: string;
		search?: string;
		sortBy?: string;
		sortOrder?: string;
	}>;
}

const EMPTY_DATA = {
	data: [],
	pagination: {
		page: 1,
		pageSize: DEFAULT_PAGE_SIZE,
		totalItems: 0,
		totalPages: 0,
		hasNextPage: false,
		hasPreviousPage: false,
	},
};

export default async function UsersPage({ searchParams }: UsersPageProps) {
	const params = await searchParams;
	const filter = parseUserParams(params);
	const result = await getUsers(filter);
	const initialData = isSuccess(result) ? result.data : EMPTY_DATA;

	return (
		<PageContainer>
			<PageHeader title="Users" />
			<UserDataTable initialData={initialData} />
		</PageContainer>
	);
}
