import { PageContainer } from '@/components/layout/pageContainer';
import { PageHeader } from '@/components/layout/pageHeader';
import { isSuccess } from '@/services/shared/result';
import { getWorkers } from '@/services/workers/actions';
import { DEFAULT_PAGE_SIZE } from '@/types/common';

import { WorkerDataTable } from './_components/WorkerDataTable';
import { parseWorkerParams } from './_utils/parseWorkerParams';

interface WorkersPageProps {
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

export default async function WorkersPage({ searchParams }: WorkersPageProps) {
	const params = await searchParams;
	const filter = parseWorkerParams(params);
	const result = await getWorkers(filter);
	const initialData = isSuccess(result) ? result.data : EMPTY_DATA;

	return (
		<PageContainer>
			<PageHeader title="Workers" />
			<WorkerDataTable initialData={initialData} />
		</PageContainer>
	);
}
