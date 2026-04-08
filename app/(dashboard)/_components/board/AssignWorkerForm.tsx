'use client';

import { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { DateTimePicker } from '@/components/ui/datetime-picker';
import { DialogFooter } from '@/components/ui/dialog';
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
import { SubmitButton } from '@/components/ui/submit-button';
import { useServerAction } from '@/hooks/useServerAction';
import type { CreateAssignmentInput } from '@/services/assignments/schemas';
import { getPositionsForSelect } from '@/services/positions/actions';
import { getWorkLocationsForSelect } from '@/services/work-locations/actions';

interface AssignWorkerFormProps {
	workerId: string;
	onSubmit: (data: CreateAssignmentInput) => Promise<unknown>;
	isPending: boolean;
	onCancel: () => void;
}

type FormValues = {
	workLocationId: string;
	positionId: string;
	startAt: string;
	endAt?: string | null;
};

export const AssignWorkerForm = ({
	workerId,
	onSubmit,
	isPending,
	onCancel,
}: AssignWorkerFormProps) => {
	const form = useForm<FormValues>({
		defaultValues: {
			workLocationId: '',
			positionId: '',
			startAt: '',
			endAt: null,
		},
	});

	const selectedLocationId = useWatch({
		control: form.control,
		name: 'workLocationId',
	});

	// Fetch work locations
	const {
		execute: fetchLocations,
		data: locationsData,
		isPending: isLoadingLocations,
	} = useServerAction(getWorkLocationsForSelect);

	// Fetch positions for selected location
	const {
		execute: fetchPositions,
		data: positionsData,
		isPending: isLoadingPositions,
	} = useServerAction(getPositionsForSelect);

	useEffect(() => {
		fetchLocations(undefined);
	}, [fetchLocations]);

	useEffect(() => {
		if (selectedLocationId) {
			form.setValue('positionId', '');
			fetchPositions({ workLocationId: selectedLocationId });
		}
	}, [selectedLocationId, fetchPositions, form]);

	const locations = locationsData ?? [];
	const positions = positionsData ?? [];

	const handleSubmit = async (values: FormValues) => {
		if (!values.startAt || !values.positionId) return;

		await onSubmit({
			workerId,
			positionId: values.positionId,
			startAt: values.startAt,
			endAt: values.endAt ?? null,
		});
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				className="space-y-4"
				noValidate
			>
				{/* Work Location */}
				<FormField
					control={form.control}
					name="workLocationId"
					rules={{ required: 'Work location is required' }}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Work Location</FormLabel>
							<FormControl>
								<Select
									value={field.value}
									onValueChange={field.onChange}
									disabled={isLoadingLocations}
								>
									<SelectTrigger>
										<SelectValue
											placeholder={
												isLoadingLocations
													? 'Loading...'
													: 'Select work location'
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{locations.map((loc) => (
											<SelectItem key={loc.id} value={loc.id}>
												{loc.name}
												{loc.clientName ? ` (${loc.clientName})` : ''}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Position */}
				<FormField
					control={form.control}
					name="positionId"
					rules={{ required: 'Position is required' }}
					render={({ field }) => (
						<FormItem>
							<FormLabel>Position</FormLabel>
							<FormControl>
								<Select
									value={field.value}
									onValueChange={field.onChange}
									disabled={!selectedLocationId || isLoadingPositions}
								>
									<SelectTrigger>
										<SelectValue
											placeholder={
												!selectedLocationId
													? 'Select a work location first'
													: isLoadingPositions
														? 'Loading...'
														: 'Select position'
											}
										/>
									</SelectTrigger>
									<SelectContent>
										{positions.map((pos) => (
											<SelectItem key={pos.id} value={pos.id}>
												{pos.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				{/* Start Date/Time */}
				<FormItem>
					<FormLabel>Start Date &amp; Time</FormLabel>
					<Controller
						control={form.control}
						name="startAt"
						rules={{ required: 'Start date and time is required' }}
						render={({ field, fieldState }) => (
							<>
								<DateTimePicker
									value={field.value ? new Date(field.value) : undefined}
									onChange={(date) =>
										field.onChange(date?.toISOString() ?? null)
									}
									clearable={false}
									placeholder="Select start date and time..."
									error={fieldState.error?.message}
								/>
							</>
						)}
					/>
				</FormItem>

				{/* End Date/Time (optional) */}
				<FormItem>
					<FormLabel>
						End Date &amp; Time{' '}
						<span className="font-normal text-muted-foreground">
							(optional)
						</span>
					</FormLabel>
					<Controller
						control={form.control}
						name="endAt"
						render={({ field, fieldState }) => (
							<>
								<DateTimePicker
									value={field.value ? new Date(field.value) : undefined}
									onChange={(date) =>
										field.onChange(date?.toISOString() ?? null)
									}
									placeholder="Select end date and time..."
									error={fieldState.error?.message}
								/>
							</>
						)}
					/>
				</FormItem>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isPending}
					>
						Cancel
					</Button>
					<SubmitButton isPending={isPending} loadingText="Assigning...">
						Assign Worker
					</SubmitButton>
				</DialogFooter>
			</form>
		</Form>
	);
};
