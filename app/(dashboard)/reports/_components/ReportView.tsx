'use client';

import { useState } from 'react';

import type { HoursReportRow } from '@/services/reports/actions';
import { ExportButtons } from './ExportButtons';
import { ReportFilters } from './ReportFilters';
import { ReportTable } from './ReportTable';

interface ReportViewProps {
	clientsList: Array<{ id: string; name: string }>;
}

export const ReportView = ({ clientsList }: ReportViewProps) => {
	const [reportData, setReportData] = useState<HoursReportRow[] | null>(null);
	const [isLoading, setIsLoading] = useState(false);

	return (
		<div className="space-y-6">
			<ReportFilters
				clientsList={clientsList}
				onReportGenerated={setReportData}
				isLoading={isLoading}
				setIsLoading={setIsLoading}
			/>

			{reportData && reportData.length > 0 && (
				<>
					<ReportTable data={reportData} />
					<ExportButtons data={reportData} />
				</>
			)}

			{reportData && reportData.length === 0 && (
				<div className="rounded-lg border border-dashed p-8 text-center">
					<p className="text-muted-foreground text-sm">
						No data found for the selected date range and filters.
					</p>
				</div>
			)}
		</div>
	);
};
