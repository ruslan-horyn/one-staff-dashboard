'use client';

import type { UseFormReturn } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { SubmitButton } from '@/components/ui/submit-button';
import type { CreateWorkerInput } from '@/services/workers/schemas';

interface WorkerFormProps {
	form: UseFormReturn<CreateWorkerInput>;
	onSubmit: (data: CreateWorkerInput) => Promise<unknown>;
	isPending: boolean;
	submitLabel: string;
	onCancel: () => void;
}

export const WorkerForm = ({
	form,
	onSubmit,
	isPending,
	submitLabel,
	onCancel,
}: WorkerFormProps) => {
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>First Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter first name"
									autoComplete="given-name"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Last Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter last name"
									autoComplete="family-name"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="phone"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Phone</FormLabel>
							<FormControl>
								<PhoneInput
									value={field.value}
									onChange={field.onChange}
									placeholder="Enter phone number"
									autoComplete="tel"
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						data-testid="cancel-button"
						onClick={onCancel}
						disabled={isPending}
					>
						Cancel
					</Button>
					<SubmitButton isPending={isPending} loadingText="Saving...">
						{submitLabel}
					</SubmitButton>
				</DialogFooter>
			</form>
		</Form>
	);
};
