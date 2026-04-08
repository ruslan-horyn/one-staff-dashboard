'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Badge } from '@/components/ui/badge';
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
	type UpdateProfileInput,
	updateProfileSchema,
} from '@/services/users/schemas';
import type { UserRole } from '@/types/common';

interface ProfileFormProps {
	defaultValues: {
		firstName: string;
		lastName: string;
	};
	email: string;
	role: UserRole;
	onSubmit: (data: UpdateProfileInput) => Promise<unknown>;
	isPending: boolean;
	onCancel: () => void;
}

export const ProfileForm = ({
	defaultValues,
	email,
	role,
	onSubmit,
	isPending,
	onCancel,
}: ProfileFormProps) => {
	const form = useForm<UpdateProfileInput>({
		resolver: zodResolver(updateProfileSchema),
		defaultValues,
	});

	const roleLabel = role === 'admin' ? 'Administrator' : 'Coordinator';

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

				<FormItem>
					<FormLabel>Email</FormLabel>
					<Input value={email} disabled readOnly aria-readonly="true" />
				</FormItem>

				<FormItem>
					<FormLabel>Role</FormLabel>
					<div>
						<Badge variant="secondary">{roleLabel}</Badge>
					</div>
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
					<SubmitButton isPending={isPending} loadingText="Saving...">
						Save Changes
					</SubmitButton>
				</DialogFooter>
			</form>
		</Form>
	);
};
