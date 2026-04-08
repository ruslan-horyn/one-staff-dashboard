import { PageContainer } from '@/components/layout/pageContainer';
import { PageHeader } from '@/components/layout/pageHeader';
import { getClientsForSelect } from '@/services/clients/actions';
import { isSuccess } from '@/services/shared/result';
import { getWorkLocations } from '@/services/work-locations/actions';
import { DEFAULT_PAGE_SIZE } from '@/types/common';

import { LocationDataTable } from './_components/LocationDataTable';
import { parseLocationParams } from './_utils/parseLocationParams';

interface LocationsPageProps {
	searchParams: Promise<{
		page?: string;
		pageSize?: string;
		search?: string;
		sortBy?: string;
		sortOrder?: string;
		clientId?: string;
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

export default async function LocationsPage({
	searchParams,
}: LocationsPageProps) {
	const params = await searchParams;
	const filter = parseLocationParams(params);

	// Fetch work locations and clients in parallel
	const [locationsResult, clientsResult] = await Promise.all([
		getWorkLocations(filter),
		getClientsForSelect(),
	]);

	const initialData = isSuccess(locationsResult)
		? locationsResult.data
		: EMPTY_DATA;
	const clientsList = isSuccess(clientsResult) ? clientsResult.data : [];

	return (
		<PageContainer>
			<PageHeader title="Work Locations" />
			<LocationDataTable initialData={initialData} clientsList={clientsList} />
		</PageContainer>
	);
}
