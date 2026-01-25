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
import type { CreateClientInput } from '@/services/clients/schemas';

interface ClientFormProps {
	form: UseFormReturn<CreateClientInput>;
	onSubmit: (data: CreateClientInput) => Promise<void>;
	isPending: boolean;
	isEdit: boolean;
	onCancel: () => void;
}

export const ClientForm = ({
	form,
	onSubmit,
	isPending,
	isEdit,
	onCancel,
}: ClientFormProps) => {
	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Name</FormLabel>
							<FormControl>
								<Input
									placeholder="Enter client name"
									autoComplete="organization"
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
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input
									type="email"
									placeholder="Enter email address"
									autoComplete="email"
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
						{isEdit ? 'Save Changes' : 'Add Client'}
					</SubmitButton>
				</DialogFooter>
			</form>
		</Form>
	);
};
