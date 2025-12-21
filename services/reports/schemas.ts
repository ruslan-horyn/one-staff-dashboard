import { z } from 'zod';

import { uuidSchema } from '@/services/shared/schemas';

// ============================================================================
// Report Schemas
// ============================================================================

/**
 * Base schema for report date range
 * Validates start and end dates with refinement
 */
const reportDateRangeSchema = z
  .object({
    startDate: z.iso.date({ message: 'Invalid start date format (expected YYYY-MM-DD)' }),
    endDate: z.iso.date({ message: 'Invalid end date format (expected YYYY-MM-DD)' }),
    clientId: uuidSchema.optional().nullable(),
  })
  .refine(
    (data) => {
      return new Date(data.startDate) <= new Date(data.endDate);
    },
    {
      message: 'Start date must be before or equal to end date',
      path: ['endDate'],
    }
  );

/**
 * Schema for generating hours report
 * Used by generateHoursReport server action and getHoursReport query
 */
export const hoursReportFilterSchema = reportDateRangeSchema;

/**
 * Schema for exporting report to CSV/Excel
 * Used by exportReportToCsv server action
 */
export const exportReportSchema = reportDateRangeSchema;

// ============================================================================
// Type Exports
// ============================================================================

export type HoursReportFilter = z.infer<typeof hoursReportFilterSchema>;
export type ExportReportInput = z.infer<typeof exportReportSchema>;
