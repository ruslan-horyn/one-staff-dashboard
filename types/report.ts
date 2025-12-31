// ============================================================================
// Report DTOs
// ============================================================================

/** Hours report data row (from get_hours_report RPC) */
export interface HoursReportData {
	worker_id: string;
	worker_name: string;
	work_location_name: string;
	client_name: string;
	total_hours: number;
}
