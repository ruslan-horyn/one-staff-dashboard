import { BoardDataTable } from '@/app/(dashboard)/_components/board/BoardDataTable';
import { parseWorkerParams } from '@/app/(dashboard)/workers/_utils/parseWorkerParams';
import { PageContainer } from '@/components/layout/pageContainer';
import { PageHeader } from '@/components/layout/pageHeader';
import { isSuccess } from '@/services/shared/result';
import { getWorkers } from '@/services/workers/actions';
import { DEFAULT_PAGE_SIZE } from '@/types/common';

interface BoardPageProps {
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

export default async function BoardPage({ searchParams }: BoardPageProps) {
	const params = await searchParams;
	const filter = parseWorkerParams(params);
	const result = await getWorkers(filter);
	const initialData = isSuccess(result) ? result.data : EMPTY_DATA;

	return (
		<PageContainer>
			<PageHeader
				title="Board"
				description="Overview of worker assignments and schedules"
			/>
			<BoardDataTable initialData={initialData} />
		</PageContainer>
	);
}
