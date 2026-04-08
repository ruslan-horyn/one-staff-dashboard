import { PageContainer } from '@/components/layout/pageContainer';
import { PageHeader } from '@/components/layout/pageHeader';
import { getClientsForSelect } from '@/services/clients/actions';
import { isSuccess } from '@/services/shared/result';

import { ReportView } from './_components/ReportView';

export default async function ReportsPage() {
	const clientsResult = await getClientsForSelect();
	const clientsList = isSuccess(clientsResult) ? clientsResult.data : [];

	return (
		<PageContainer>
			<PageHeader title="Reports" />
			<ReportView clientsList={clientsList} />
		</PageContainer>
	);
}
