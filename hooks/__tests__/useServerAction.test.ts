import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ActionResult } from '@/services/shared/result';
import { failure, success } from '@/services/shared/result';
import { useServerAction } from '../useServerAction';

type TestInput = { name: string };
type TestOutput = { id: string };
type TestAction = (input: TestInput) => Promise<ActionResult<TestOutput>>;

const mockSuccessAction = vi.fn<TestAction>();
const mockFailureAction = vi.fn<TestAction>();
const mockThrowingAction = vi.fn<TestAction>();

describe('useServerAction', () => {
	beforeEach(() => {
		mockSuccessAction.mockResolvedValue(success({ id: '123' }));
		mockFailureAction.mockResolvedValue(failure('NOT_FOUND', 'Not found'));
		mockThrowingAction.mockRejectedValue(new Error('Network error'));
	});

	describe('initial state', () => {
		it('returns idle state initially', () => {
			const { result } = renderHook(() => useServerAction(mockSuccessAction));

			expect(result.current.isPending).toBe(false);
			expect(result.current.isSuccess).toBe(false);
			expect(result.current.isError).toBe(false);
			expect(result.current.data).toBeUndefined();
			expect(result.current.error).toBeUndefined();
		});
	});

	describe('execute', () => {
		it('sets pending state during execution', async () => {
			// Use a deferred action to control when it resolves
			let resolveAction: (value: ActionResult<TestOutput>) => void;
			const deferredAction: TestAction = vi.fn(
				() =>
					new Promise<ActionResult<TestOutput>>((resolve) => {
						resolveAction = resolve;
					})
			);

			const { result } = renderHook(() => useServerAction(deferredAction));

			// Start execution but don't await
			let executePromise: Promise<ActionResult<TestOutput>>;
			act(() => {
				executePromise = result.current.execute({ name: 'test' });
			});

			// Now isPending should be true
			expect(result.current.isPending).toBe(true);

			// Resolve and complete
			await act(async () => {
				resolveAction!(success({ id: '123' }));
				await executePromise;
			});

			expect(result.current.isPending).toBe(false);
		});

		it('returns ActionResult from execute', async () => {
			const { result } = renderHook(() => useServerAction(mockSuccessAction));

			let actionResult: ActionResult<TestOutput> | undefined;
			await act(async () => {
				actionResult = await result.current.execute({ name: 'test' });
			});

			expect(actionResult).toEqual(success({ id: '123' }));
		});
	});

	describe('success handling', () => {
		it('updates state on success', async () => {
			const { result } = renderHook(() => useServerAction(mockSuccessAction));

			await act(async () => {
				await result.current.execute({ name: 'test' });
			});

			expect(result.current.isPending).toBe(false);
			expect(result.current.isSuccess).toBe(true);
			expect(result.current.isError).toBe(false);
			expect(result.current.data).toEqual({ id: '123' });
			expect(result.current.error).toBeUndefined();
		});

		it('calls onSuccess callback with data and input', async () => {
			const onSuccess = vi.fn();
			const { result } = renderHook(() =>
				useServerAction(mockSuccessAction, { onSuccess })
			);

			await act(async () => {
				await result.current.execute({ name: 'test' });
			});

			expect(onSuccess).toHaveBeenCalledWith({ id: '123' }, { name: 'test' });
		});
	});

	describe('error handling', () => {
		it('updates state on ActionResult failure', async () => {
			const { result } = renderHook(() => useServerAction(mockFailureAction));

			await act(async () => {
				await result.current.execute({ name: 'test' });
			});

			expect(result.current.isPending).toBe(false);
			expect(result.current.isSuccess).toBe(false);
			expect(result.current.isError).toBe(true);
			expect(result.current.data).toBeUndefined();
			expect(result.current.error).toEqual({
				code: 'NOT_FOUND',
				message: 'Not found',
			});
		});

		it('calls onError callback with error and input', async () => {
			const onError = vi.fn();
			const { result } = renderHook(() =>
				useServerAction(mockFailureAction, { onError })
			);

			await act(async () => {
				await result.current.execute({ name: 'test' });
			});

			expect(onError).toHaveBeenCalledWith(
				{ code: 'NOT_FOUND', message: 'Not found' },
				{ name: 'test' }
			);
		});

		it('handles unexpected errors (network) as INTERNAL_ERROR', async () => {
			const { result } = renderHook(() => useServerAction(mockThrowingAction));

			await act(async () => {
				await result.current.execute({ name: 'test' });
			});

			expect(result.current.isError).toBe(true);
			expect(result.current.error?.code).toBe('INTERNAL_ERROR');
			expect(result.current.error?.message).toBe('Network error');
		});
	});

	describe('onSettled callback', () => {
		it('calls onSettled after success', async () => {
			const onSettled = vi.fn();
			const { result } = renderHook(() =>
				useServerAction(mockSuccessAction, { onSettled })
			);

			await act(async () => {
				await result.current.execute({ name: 'test' });
			});

			expect(onSettled).toHaveBeenCalledWith({ id: '123' }, undefined, {
				name: 'test',
			});
		});

		it('calls onSettled after error', async () => {
			const onSettled = vi.fn();
			const { result } = renderHook(() =>
				useServerAction(mockFailureAction, { onSettled })
			);

			await act(async () => {
				await result.current.execute({ name: 'test' });
			});

			expect(onSettled).toHaveBeenCalledWith(
				undefined,
				{ code: 'NOT_FOUND', message: 'Not found' },
				{ name: 'test' }
			);
		});
	});

	describe('execute stability', () => {
		it('maintains stable execute reference when options change', () => {
			const { result, rerender } = renderHook(
				({ onSuccess }) => useServerAction(mockSuccessAction, { onSuccess }),
				{ initialProps: { onSuccess: vi.fn() } }
			);

			const firstExecute = result.current.execute;

			rerender({ onSuccess: vi.fn() });

			expect(result.current.execute).toBe(firstExecute);
		});
	});

	describe('callback sequence', () => {
		it('calls callbacks in correct order: onSuccess then onSettled', async () => {
			const callOrder: string[] = [];
			const onSuccess = vi.fn(() => {
				callOrder.push('onSuccess');
			});
			const onSettled = vi.fn(() => {
				callOrder.push('onSettled');
			});

			const { result } = renderHook(() =>
				useServerAction(mockSuccessAction, { onSuccess, onSettled })
			);

			await act(async () => {
				await result.current.execute({ name: 'test' });
			});

			expect(callOrder).toEqual(['onSuccess', 'onSettled']);
		});

		it('calls callbacks in correct order: onError then onSettled', async () => {
			const callOrder: string[] = [];
			const onError = vi.fn(() => {
				callOrder.push('onError');
			});
			const onSettled = vi.fn(() => {
				callOrder.push('onSettled');
			});

			const { result } = renderHook(() =>
				useServerAction(mockFailureAction, { onError, onSettled })
			);

			await act(async () => {
				await result.current.execute({ name: 'test' });
			});

			expect(callOrder).toEqual(['onError', 'onSettled']);
		});
	});
});
