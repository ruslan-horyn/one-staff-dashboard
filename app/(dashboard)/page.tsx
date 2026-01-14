import { PageContainer, PageHeader } from '@/components/layout';

const DashboardPage = () => {
	return (
		<PageContainer>
			<PageHeader
				title="Board"
				description="Overview of worker assignments and schedules"
			/>
			<div className="flex items-center justify-center rounded-lg border border-dashed p-12">
				<p className="text-muted-foreground">Board view coming soon</p>
			</div>
		</PageContainer>
	);
};

export default DashboardPage;
