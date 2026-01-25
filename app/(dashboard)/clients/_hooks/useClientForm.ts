'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useServerAction } from '@/hooks/useServerAction';
import { createClient, updateClient } from '@/services/clients/actions';
import {
	getClientErrorMessage,
	getDuplicateField,
} from '@/services/clients/error-handlers';
import {
	type CreateClientInput,
	createClientSchema,
} from '@/services/clients/schemas';
import type { ActionError } from '@/services/shared/result';
import type { Client } from '@/types/client';

const DEFAULT_VALUES: CreateClientInput = {
	name: '',
	email: '',
	phone: '',
	address: '',
};

export interface UseClientFormOptions {
	/** Client to edit, or null for create mode */
	client: Client | null;
	/** Whether the dialog is open */
	isOpen: boolean;
	/** Callback on successful create/update */
	onSuccess: () => void;
}

export interface UseClientFormReturn {
	/** react-hook-form instance */
	form: UseFormReturn<CreateClientInput>;
	/** Whether a create/update operation is in progress */
	isPending: boolean;
	/** Whether in edit mode (client provided) or create mode */
	isEdit: boolean;
	/** Submit handler to pass to form */
	onSubmit: (data: CreateClientInput) => Promise<void>;
}

/**
 * Hook that encapsulates client form logic.
 * Handles form state, validation, and server action execution.
 *
 * @param options - Configuration for the form hook
 * @returns Form state and handlers
 *
 * @example
 * const { form, isPending, isEdit, onSubmit } = useClientForm({
 *   client,
 *   isOpen: open,
 *   onSuccess: () => onOpenChange(false),
 * });
 */
export function useClientForm({
	client,
	isOpen,
	onSuccess,
}: UseClientFormOptions): UseClientFormReturn {
	const isEdit = !!client;

	const form = useForm<CreateClientInput>({
		resolver: zodResolver(createClientSchema),
		defaultValues: DEFAULT_VALUES,
	});

	const { reset } = form;

	// Reset form when dialog opens
	useEffect(() => {
		if (isOpen) {
			reset(client ?? DEFAULT_VALUES);
		}
	}, [isOpen, client, reset]);

	// Error handler for both create and update
	const handleError = (error: ActionError) => {
		if (error.code === 'DUPLICATE_ENTRY') {
			const field = getDuplicateField(error) as keyof CreateClientInput;
			form.setError(field, {
				message: `This ${field} is already in use`,
			});
			toast.error(getClientErrorMessage(error));
			return;
		}

		if (error.code === 'NOT_FOUND') {
			toast.error(getClientErrorMessage(error));
			onSuccess(); // Close dialog as client no longer exists
			return;
		}

		toast.error(getClientErrorMessage(error));
	};

	const { execute: executeCreate, isPending: isCreating } = useServerAction(
		createClient,
		{ onError: handleError }
	);

	const { execute: executeUpdate, isPending: isUpdating } = useServerAction(
		updateClient,
		{ onError: handleError }
	);

	const isPending = isCreating || isUpdating || form.formState.isSubmitting;

	const onSubmit = async (data: CreateClientInput) => {
		const result = isEdit
			? await executeUpdate({ id: client.id, ...data })
			: await executeCreate(data);

		if (result.success) {
			onSuccess();
		}
	};

	return {
		form,
		isPending,
		isEdit,
		onSubmit,
	};
}
