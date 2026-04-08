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
import type { CreateWorkLocationInput } from '@/services/work-locations/schemas';

interface LocationFormProps {
	form: UseFormReturn<CreateWorkLocationInput>;
	onSubmit: (data: CreateWorkLocationInput) => Promise<unknown>;
	isPending: boolean;
	submitLabel: string;
	onCancel: () => void;
	clientsList: { id: string; name: string }[];
}

export const LocationForm = ({
	form,
	onSubmit,
	isPending,
	submitLabel,
	onCancel,
	clientsList,
}: LocationFormProps) => {
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="clientId"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Client</FormLabel>
							<FormControl>
								<select
									{...field}
									className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
									disabled={isPending}
								>
									<option value="">Select a client</option>
									{clientsList.map((client) => (
										<option key={client.id} value={client.id}>
											{client.name}
										</option>
									))}
								</select>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter location name"
									autoComplete="off"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="address"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Address</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter address"
									autoComplete="street-address"
									{...field}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email (Optional)</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="Enter email address"
									autoComplete="email"
									{...field}
									value={field.value ?? ''}
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
							<FormLabel>Phone (Optional)</FormLabel>
							<FormControl>
								<PhoneInput
									value={field.value ?? ''}
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
