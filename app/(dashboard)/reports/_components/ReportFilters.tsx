'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import type { HoursReportRow } from '@/services/reports/actions';
import { generateHoursReport } from '@/services/reports/actions';
import {
	type HoursReportFilter,
	hoursReportFilterSchema,
} from '@/services/reports/schemas';
import { isFailure, isSuccess } from '@/services/shared/result';

interface ReportFiltersProps {
	clientsList: Array<{ id: string; name: string }>;
	onReportGenerated: (data: HoursReportRow[]) => void;
	isLoading: boolean;
	setIsLoading: (loading: boolean) => void;
}

export const ReportFilters = ({
	clientsList,
	onReportGenerated,
	isLoading,
	setIsLoading,
}: ReportFiltersProps) => {
	const form = useForm<HoursReportFilter>({
		resolver: zodResolver(hoursReportFilterSchema),
		defaultValues: {
			startDate: '',
			endDate: '',
			clientId: undefined,
		},
	});

	const onSubmit = useCallback(
		async (input: HoursReportFilter) => {
			setIsLoading(true);
			const result = await generateHoursReport(input);

			if (isSuccess(result)) {
				onReportGenerated(result.data);
				toast.success('Report generated successfully');
			} else if (isFailure(result)) {
				toast.error(result.error.message || 'Failed to generate report');
			}

			setIsLoading(false);
		},
		[onReportGenerated, setIsLoading]
	);

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<div className="grid gap-4 sm:grid-cols-3">
					<FormField
						control={form.control}
						name="startDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Start Date</FormLabel>
								<FormControl>
									<input
										{...field}
										type="date"
										className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="endDate"
						render={({ field }) => (
							<FormItem>
								<FormLabel>End Date</FormLabel>
								<FormControl>
									<input
										{...field}
										type="date"
										className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="clientId"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Client (Optional)</FormLabel>
								<Select
									value={field.value || ''}
									onValueChange={(value) => field.onChange(value || undefined)}
								>
									<FormControl>
										<SelectTrigger>
											<SelectValue placeholder="Select a client..." />
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										{clientsList.map((client) => (
											<SelectItem key={client.id} value={client.id}>
												{client.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<Button type="submit" disabled={isLoading}>
					{isLoading ? 'Generating...' : 'Generate Report'}
				</Button>
			</form>
		</Form>
	);
};
