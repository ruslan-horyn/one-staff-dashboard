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

// ============================================================================
// Command Models (Input Types)
// ============================================================================

/** Input for generating hours report */
export interface GenerateHoursReportInput {
  startDate: string;
  endDate: string;
  clientId?: string | null;
}

/** Input for exporting report to CSV/Excel */
export interface ExportReportInput {
  startDate: string;
  endDate: string;
  clientId?: string | null;
}
