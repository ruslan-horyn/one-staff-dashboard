'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
import { SubmitButton } from '@/components/ui/submit-button';
import {
	type InviteCoordinatorInput,
	inviteCoordinatorSchema,
} from '@/services/users/schemas';

interface InviteUserFormProps {
	onSubmit: (data: InviteCoordinatorInput) => Promise<unknown>;
	isPending: boolean;
	onCancel: () => void;
}

export const InviteUserForm = ({
	onSubmit,
	isPending,
	onCancel,
}: InviteUserFormProps) => {
	const form = useForm<InviteCoordinatorInput>({
		resolver: zodResolver(inviteCoordinatorSchema),
		defaultValues: {
			email: '',
			firstName: '',
			lastName: '',
		},
	});

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

				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={onCancel}
						disabled={isPending}
					>
						Cancel
					</Button>
					<SubmitButton isPending={isPending} loadingText="Sending...">
						Send Invitation
					</SubmitButton>
				</DialogFooter>
			</form>
		</Form>
	);
};
