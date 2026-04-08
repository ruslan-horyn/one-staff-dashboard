'use server';

import { createAction } from '@/services/shared/action-wrapper';
import { type HoursReportFilter, hoursReportFilterSchema } from './schemas';

// ============================================================================
// Types
// ============================================================================

export interface HoursReportRow {
	worker_id: string;
	worker_name: string;
	work_location_name: string;
	client_name: string;
	total_hours: number;
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Generates an hours report for the specified date range and optional client filter.
 * Calls the RPC function `get_hours_report` which returns aggregated hours per worker.
 *
 * @param input - Filter options (startDate, endDate, optional clientId)
 * @returns Array of report rows with worker, location, client, and total hours
 *
 * @example
 * const result = await generateHoursReport({
 *   startDate: '2026-04-01',
 *   endDate: '2026-04-30',
 *   clientId: 'abc123',
 * });
 */
export const generateHoursReport = createAction<
	HoursReportFilter,
	HoursReportRow[]
>(
	async (input, { supabase }) => {
		const { data, error } = await supabase.rpc('get_hours_report', {
			p_start_date: input.startDate,
			p_end_date: input.endDate,
			...(input.clientId ? { p_client_id: input.clientId } : {}),
		});

		if (error) throw error;
		return (data ?? []) as HoursReportRow[];
	},
	{ schema: hoursReportFilterSchema }
);
