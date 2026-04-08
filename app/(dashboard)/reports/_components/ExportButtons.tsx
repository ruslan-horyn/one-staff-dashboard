'use client';

import { Download } from 'lucide-react';
import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import type { HoursReportRow } from '@/services/reports/actions';

interface ExportButtonsProps {
	data: HoursReportRow[];
}

export const ExportButtons = ({ data }: ExportButtonsProps) => {
	const exportToCsv = useCallback(() => {
		const headers = ['Worker Name', 'Work Location', 'Client', 'Total Hours'];
		const rows = data.map((row) => [
			row.worker_name,
			row.work_location_name,
			row.client_name,
			row.total_hours.toFixed(2),
		]);

		// Add total row
		const totalHours = data.reduce((sum, row) => sum + row.total_hours, 0);
		rows.push(['Total', '', '', totalHours.toFixed(2)]);

		// Create CSV content with proper escaping
		const csvContent = [headers, ...rows]
			.map((row) =>
				row.map((cell) => {
					const cellStr = String(cell);
					// Escape quotes and wrap in quotes if contains comma or quotes
					if (cellStr.includes(',') || cellStr.includes('"')) {
						return `"${cellStr.replace(/"/g, '""')}"`;
					}
					return cellStr;
				})
			)
			.join('\n');

		// Download as CSV file
		const blob = new Blob([csvContent], {
			type: 'text/csv;charset=utf-8;',
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `hours-report-${new Date().toISOString().split('T')[0]}.csv`;
		link.click();
		URL.revokeObjectURL(url);
	}, [data]);

	const exportToExcel = useCallback(() => {
		// For MVP, export as CSV with .xlsx extension
		// Full xlsx implementation can be added later when package is installed
		const headers = ['Worker Name', 'Work Location', 'Client', 'Total Hours'];
		const rows = data.map((row) => [
			row.worker_name,
			row.work_location_name,
			row.client_name,
			row.total_hours.toFixed(2),
		]);

		// Add total row
		const totalHours = data.reduce((sum, row) => sum + row.total_hours, 0);
		rows.push(['Total', '', '', totalHours.toFixed(2)]);

		// Create CSV content with proper escaping
		const csvContent = [headers, ...rows]
			.map((row) =>
				row.map((cell) => {
					const cellStr = String(cell);
					if (cellStr.includes(',') || cellStr.includes('"')) {
						return `"${cellStr.replace(/"/g, '""')}"`;
					}
					return cellStr;
				})
			)
			.join('\n');

		// Download as Excel-compatible file
		const blob = new Blob([csvContent], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8;',
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `hours-report-${new Date().toISOString().split('T')[0]}.xlsx`;
		link.click();
		URL.revokeObjectURL(url);
	}, [data]);

	return (
		<div className="flex flex-col gap-2 sm:flex-row">
			<Button variant="outline" onClick={exportToCsv} className="gap-2">
				<Download className="h-4 w-4" />
				Export CSV
			</Button>
			<Button variant="outline" onClick={exportToExcel} className="gap-2">
				<Download className="h-4 w-4" />
				Export Excel
			</Button>
		</div>
	);
};
