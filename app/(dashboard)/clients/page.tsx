import { PageContainer } from '@/components/layout/pageContainer';
import { PageHeader } from '@/components/layout/pageHeader';
import { getClients } from '@/services/clients/actions';
import { isSuccess } from '@/services/shared/result';
import { DEFAULT_PAGE_SIZE } from '@/types/common';

import { ClientDataTable } from './_components/ClientDataTable';
import { parseClientParams } from './_utils/parseClientParams';

interface ClientsPageProps {
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

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
	const params = await searchParams;
	const filter = parseClientParams(params);
	console.log('filter:', filter);
	const result = await getClients(filter);
	const initialData = isSuccess(result) ? result.data : EMPTY_DATA;

	return (
		<PageContainer>
			<PageHeader title="Clients" />
			<ClientDataTable initialData={initialData} />
		</PageContainer>
	);
}
