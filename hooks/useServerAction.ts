'use client';

import { useCallback, useReducer, useRef } from 'react';
import type { ActionError, ActionResult } from '@/services/shared/result';
import { failure, isFailure, isSuccess } from '@/services/shared/result';
import { tryCatch } from '@/utils';

export interface UseServerActionOptions<TInput, TData> {
	onSuccess?: (data: TData, variables: TInput) => void | Promise<void>;
	onError?: (error: ActionError, variables: TInput) => void | Promise<void>;
	onSettled?: (
		data: TData | undefined,
		error: ActionError | undefined,
		variables: TInput
	) => void | Promise<void>;
}

export interface UseServerActionReturn<TInput, TData> {
	execute: (input: TInput) => Promise<ActionResult<TData>>;
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	data: TData | undefined;
	error: ActionError | undefined;
}

type ActionState<TData> =
	| { status: 'idle'; data: undefined; error: undefined }
	| { status: 'pending'; data: undefined; error: undefined }
	| { status: 'success'; data: TData; error: undefined }
	| { status: 'error'; data: undefined; error: ActionError };

type ActionEvent<TData> =
	| { type: 'EXECUTE' }
	| { type: 'SUCCESS'; data: TData }
	| { type: 'ERROR'; error: ActionError };

function reducer<TData>(
	_state: ActionState<TData>,
	event: ActionEvent<TData>
): ActionState<TData> {
	switch (event.type) {
		case 'EXECUTE':
			return { status: 'pending', data: undefined, error: undefined };
		case 'SUCCESS':
			return { status: 'success', data: event.data, error: undefined };
		case 'ERROR':
			return { status: 'error', data: undefined, error: event.error };
	}
}

const initialState: ActionState<never> = {
	status: 'idle',
	data: undefined,
	error: undefined,
};

/**
 * React hook for executing Server Actions with state management.
 * Inspired by React Query's useMutation API.
 *
 * @param action - Server Action to execute
 * @param options - Callbacks for success, error, and settled states
 * @returns Object with execute function and state properties
 *
 * @example
 * const { execute, isPending, data, error } = useServerAction(createWorker, {
 *   onSuccess: (worker) => {
 *     notifications.success('Worker created');
 *     router.push(`/workers/${worker.id}`);
 *   },
 *   onError: (error) => {
 *     notifications.error(getErrorMessage(error.code));
 *   },
 * });
 *
 * // In render:
 * <Button onClick={() => execute(formData)} disabled={isPending}>
 *   {isPending ? 'Saving...' : 'Save'}
 * </Button>
 */
export function useServerAction<TInput, TData>(
	action: (input: TInput) => Promise<ActionResult<TData>>,
	options: UseServerActionOptions<TInput, TData> = {}
): UseServerActionReturn<TInput, TData> {
	const [state, dispatch] = useReducer(
		reducer<TData>,
		initialState as ActionState<TData>
	);

	// Stable reference for options - prevents re-creating execute on options change
	const optionsRef = useRef(options);
	optionsRef.current = options;

	const execute = useCallback(
		async (input: TInput): Promise<ActionResult<TData>> => {
			dispatch({ type: 'EXECUTE' });

			const [result, unexpectedError] = await tryCatch(action(input));

			// Network error or unexpected throw
			if (unexpectedError) {
				const error: ActionError = {
					code: 'INTERNAL_ERROR',
					message:
						unexpectedError instanceof Error
							? unexpectedError.message
							: 'Unexpected error',
				};

				dispatch({ type: 'ERROR', error });
				await optionsRef.current.onError?.(error, input);
				await optionsRef.current.onSettled?.(undefined, error, input);

				return failure(error.code, error.message);
			}

			// ActionResult handling
			if (isSuccess(result)) {
				dispatch({ type: 'SUCCESS', data: result.data });
				await optionsRef.current.onSuccess?.(result.data, input);
				await optionsRef.current.onSettled?.(result.data, undefined, input);
			} else if (isFailure(result)) {
				dispatch({ type: 'ERROR', error: result.error });
				await optionsRef.current.onError?.(result.error, input);
				await optionsRef.current.onSettled?.(undefined, result.error, input);
			}

			return result;
		},
		[action]
	);

	return {
		execute,
		isPending: state.status === 'pending',
		isSuccess: state.status === 'success',
		isError: state.status === 'error',
		data: state.data,
		error: state.error,
	};
}
