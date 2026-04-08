'use client';

import type { HoursReportRow } from '@/services/reports/actions';

interface ReportTableProps {
	data: HoursReportRow[];
}

export const ReportTable = ({ data }: ReportTableProps) => {
	const totalHours = data.reduce((sum, row) => sum + row.total_hours, 0);

	return (
		<div className="overflow-x-auto rounded-lg border">
			<table className="w-full text-sm">
				<thead className="border-b bg-muted/50">
					<tr>
						<th className="px-4 py-3 text-left font-medium">Worker Name</th>
						<th className="px-4 py-3 text-left font-medium">Work Location</th>
						<th className="px-4 py-3 text-left font-medium">Client</th>
						<th className="px-4 py-3 text-right font-medium">Total Hours</th>
					</tr>
				</thead>
				<tbody>
					{data.map((row, index) => (
						<tr
							key={`${row.worker_id}-${index}`}
							className="border-b hover:bg-muted/50"
						>
							<td className="px-4 py-3">{row.worker_name}</td>
							<td className="px-4 py-3">{row.work_location_name}</td>
							<td className="px-4 py-3">{row.client_name}</td>
							<td className="px-4 py-3 text-right">
								{row.total_hours.toFixed(2)}
							</td>
						</tr>
					))}
					<tr className="bg-muted/50 font-medium">
						<td colSpan={3} className="px-4 py-3 text-right">
							Total Hours:
						</td>
						<td className="px-4 py-3 text-right">{totalHours.toFixed(2)}</td>
					</tr>
				</tbody>
			</table>
		</div>
	);
};
