# MVP Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **REQUIRED READING before any task:**
> - `docs/decomposition-patterns.md` — pattern catalog + decision tree
> - `docs/frontend-anti-patterns.md` — AP-01 through AP-13, code review blockers

**Goal:** Complete all remaining 10 user stories (US-004 through US-014) to deliver the One Staff Dashboard MVP.

**Architecture:**
- **Service layer:** Explicit code per module with consistent pattern. Error Handler Factory for error config. Mapper object per entity. CQRS sections (queries + mutations).
- **UI hooks:** #8 Action Hook (`use<Verb><Entity>`) + #9 Interaction Hook (`use<Feature>Form`) with DI — each module's form hook directly uses `useForm`, no generic wrapper.
- **Components:** #10 Screen as Coordinator (page = zero logic) + #27 Context + Provider (no prop drilling) + row-level dialogs
- **Data flow:** Server component owns data → client uses `initialData` directly → after mutation `router.refresh()` → no `useState` for server data (AP-01, AP-10)
- **Callbacks:** No wrapper callbacks (AP-13) — pass function references directly
- **Error handling:** No `as` casts — type guards for unknown types. `useServerAction` exposes `error` + `reset` — action hooks derive blocking state, no extra `useState`.
- **Testing:** E2E with real data per module. Each phase = backend + frontend + E2E together.

**Tech Stack:** Next.js 16, React 19, TypeScript 5, Supabase (PostgreSQL + RLS + RPC), Zod, react-hook-form, TanStack Table, Tailwind CSS 4, Playwright, Vitest

**Spec:** `docs/superpowers/specs/2026-04-06-mvp-completion-design.md`

---

## Phase 0: Shared Infrastructure

### Task 1: Error Handler Factory

**Files:**
- Create: `services/shared/error-handler-factory.ts`

- [ ] **Step 1: Create type guard helper + factory**

```typescript
// services/shared/error-handler-factory.ts
import type { ActionError } from '@/services/shared/result';

const DEFAULT_MESSAGES: Record<string, string> = {
	FORBIDDEN: 'You do not have permission to perform this action.',
	VALIDATION_ERROR: 'Please check the form for errors.',
	DATABASE_ERROR: 'A database error occurred. Please try again.',
	INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
};

/** Type-safe extraction of field name from error details (no `as` cast) */
function getErrorDetailField(details: unknown): string | undefined {
	if (details && typeof details === 'object' && 'field' in details) {
		const field = (details as Record<string, unknown>).field;
		return typeof field === 'string' ? field : undefined;
	}
	return undefined;
}

export interface ErrorHandlerConfig {
	messages: Record<string, string>;
	blockingCodes?: string[];
	duplicateField?: string;
}

export interface ErrorHandler {
	getMessage(error: ActionError): string;
	isBlocking(code: string): boolean;
	getDuplicateField(error: ActionError): string;
}

export function createErrorHandler(config: ErrorHandlerConfig): ErrorHandler {
	const allMessages = { ...DEFAULT_MESSAGES, ...config.messages };
	const blockingSet = new Set(config.blockingCodes ?? []);

	return {
		getMessage: (error) => allMessages[error.code] ?? error.message,
		isBlocking: (code) => blockingSet.has(code),
		getDuplicateField: (error) =>
			getErrorDetailField(error.details) ?? config.duplicateField ?? 'name',
	};
}
```

- [ ] **Step 2: Commit**

```bash
git add services/shared/error-handler-factory.ts
git commit -m "feat(config): add error handler factory pattern"
```

---

### Task 2: Add reset to useServerAction

**Files:**
- Modify: `hooks/useServerAction.ts`

Action hooks derive blocking error from `useServerAction.error` — no extra `useState`. Need `reset` to clear error state (e.g., on dialog close).

- [ ] **Step 1: Add RESET event + reset function**

Add to reducer:
```typescript
type ActionEvent<TData> =
	| { type: 'EXECUTE' }
	| { type: 'SUCCESS'; data: TData }
	| { type: 'ERROR'; error: ActionError }
	| { type: 'RESET' };

// In reducer function, add case:
case 'RESET':
	return initialState as ActionState<TData>;
```

Add to hook return:
```typescript
const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

return { execute, isPending, isSuccess, isError, data, error, reset };
```

Update `UseServerActionReturn` type:
```typescript
export interface UseServerActionReturn<TInput, TData> {
	execute: (input: TInput) => Promise<ActionResult<TData>>;
	isPending: boolean;
	isSuccess: boolean;
	isError: boolean;
	data: TData | undefined;
	error: ActionError | undefined;
	reset: () => void;
}
```

- [ ] **Step 2: Verify tests** — `pnpm test`
- [ ] **Step 3: Commit**

```bash
git add hooks/useServerAction.ts
git commit -m "feat(ui): add reset function to useServerAction"
```

---

### Task 3: Extend useModalState with onOpen/onClose

**Files:**
- Modify: `hooks/useModalState.ts`

- [ ] **Step 1: Add callback options**

```typescript
// hooks/useModalState.ts
'use client';

import { useCallback, useRef, useState } from 'react';

export interface UseModalStateOptions<T> {
	onOpen?: (data?: T) => void;
	onClose?: () => void;
}

export interface UseModalStateReturn<T> {
	isOpen: boolean;
	data: T | null;
	triggerRef: React.RefObject<HTMLElement | null>;
	open: (data?: T) => void;
	close: () => void;
}

export const useModalState = <T = undefined>(
	options: UseModalStateOptions<T> = {},
): UseModalStateReturn<T> => {
	const [isOpen, setIsOpen] = useState(false);
	const [data, setData] = useState<T | null>(null);
	const triggerRef = useRef<HTMLElement | null>(null);
	const optionsRef = useRef(options);
	optionsRef.current = options;

	const open = useCallback((item?: T) => {
		triggerRef.current = document.activeElement as HTMLElement | null;
		setData(item ?? null);
		setIsOpen(true);
		optionsRef.current.onOpen?.(item);
	}, []);

	const close = useCallback(() => {
		setIsOpen(false);
		optionsRef.current.onClose?.();
	}, []);

	return { isOpen, data, triggerRef, open, close };
};
```

- [ ] **Step 2: Verify tests** — `pnpm test`
- [ ] **Step 3: Commit**

```bash
git add hooks/useModalState.ts
git commit -m "feat(ui): extend useModalState with onOpen/onClose callbacks"
```

---

### Task 4: Create useDataTableState hook

**Files:**
- Create: `hooks/useDataTableState.ts`

- [ ] **Step 1: Create hook**

```typescript
// hooks/useDataTableState.ts
'use client';

import type { SortingState } from '@tanstack/react-table';
import { useRouter } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { useTableParams, type UseTableParamsOptions } from './useTableParams';

export interface UseDataTableStateReturn {
	page: number;
	pageSize: number;
	sorting: SortingState;
	sortBy: string | null;
	sortOrder: 'asc' | 'desc';
	onSortingChange: (updater: SortingState | ((old: SortingState) => SortingState)) => void;
	onPaginationChange: (page: number, pageSize: number) => void;
}

export function useDataTableState(options: UseTableParamsOptions = {}): UseDataTableStateReturn {
	const router = useRouter();
	const { page, pageSize, sortBy, sortOrder, setPage, setPageSize, setSorting } =
		useTableParams(options);

	const sorting: SortingState = useMemo(
		() => (sortBy ? [{ id: sortBy, desc: sortOrder === 'desc' }] : []),
		[sortBy, sortOrder],
	);

	const onSortingChange = useCallback(
		(updater: SortingState | ((old: SortingState) => SortingState)) => {
			const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
			if (newSorting.length > 0) {
				setSorting(newSorting[0].id, newSorting[0].desc ? 'desc' : 'asc');
			} else {
				setSorting(null, 'asc');
			}
		},
		[sorting, setSorting],
	);

	const onPaginationChange = useCallback(
		(newPage: number, newPageSize: number) => {
			if (newPageSize !== pageSize) {
				setPageSize(newPageSize);
			} else {
				setPage(newPage);
			}
			router.refresh();
		},
		[setPage, setPageSize, pageSize, router],
	);

	return { page, pageSize, sorting, sortBy, sortOrder, onSortingChange, onPaginationChange };
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/useDataTableState.ts
git commit -m "feat(ui): add useDataTableState hook"
```

---

### Task 5: Pagination auto-hide inside component

**Files:**
- Modify: `components/ui/data-table/data-table-pagination.tsx`

Pagination component self-decides whether to render. No external logic needed.

- [ ] **Step 1: Add early return**

At the top of `DataTablePagination` component:

```typescript
function DataTablePagination({
	page, pageSize, totalItems, totalPages, ...
}: DataTablePaginationProps) {
	if (totalItems < pageSize) return null;

	// ... rest of existing render code
}
```

No changes in `data-table.tsx` — pagination condition stays as-is.

- [ ] **Step 2: Commit**

```bash
git add components/ui/data-table/data-table-pagination.tsx
git commit -m "fix(ui): auto-hide pagination when total items below page size"
```

---

## Phase 1: Refactor Clients (reference pattern)

### Task 6: Clients service refactor

**Files:**
- Create: `services/clients/mapper.ts`
- Rewrite: `services/clients/error-handlers.ts`
- Modify: `services/clients/actions.ts` (add CQRS sections + getClientsForSelect)
- Update: `services/clients/index.ts`

- [ ] **Step 1: Create mapper**

```typescript
// services/clients/mapper.ts
import type { DefaultValues } from 'react-hook-form';
import type { Client } from '@/types/client';
import type { CreateClientInput } from './schemas';

export const clientMapper = {
	defaultValues: {
		name: '',
		email: '',
		phone: '',
		address: '',
	} satisfies DefaultValues<CreateClientInput>,

	toForm: (entity: Client): DefaultValues<CreateClientInput> => ({
		name: entity.name,
		email: entity.email,
		phone: entity.phone,
		address: entity.address,
	}),

	toDb: (input: CreateClientInput) => ({
		name: input.name,
		email: input.email,
		phone: input.phone,
		address: input.address,
	}),
};
```

- [ ] **Step 2: Rewrite error handlers using factory**

```typescript
// services/clients/error-handlers.ts
import { createErrorHandler } from '@/services/shared/error-handler-factory';

export const clientErrors = createErrorHandler({
	messages: {
		DUPLICATE_ENTRY: 'A client with this email already exists',
		HAS_DEPENDENCIES: 'This client cannot be deleted because it has associated work locations.',
		NOT_FOUND: 'Client not found. It may have already been deleted.',
	},
	blockingCodes: ['HAS_DEPENDENCIES'],
	duplicateField: 'email',
});
```

- [ ] **Step 3: Add CQRS sections + getClientsForSelect**

Keep existing action code. Add section comments and new action:

```typescript
// Add to services/clients/actions.ts

// ============================================================================
// Queries
// ============================================================================

// ... existing getClient, getClients ...

/** Lightweight client list for ComboBox selectors (no pagination) */
export const getClientsForSelect = createAction<void, { id: string; name: string }[]>(
	async (_input, { supabase }) => {
		const { data, error } = await supabase
			.from('clients')
			.select('id, name')
			.is('deleted_at', null)
			.order('name');

		if (error) throw error;
		return data ?? [];
	}
);

// ============================================================================
// Mutations
// ============================================================================

// ... existing createClient, updateClient, deleteClient ...
```

- [ ] **Step 4: Update barrel**

```typescript
// services/clients/index.ts
export * from './actions';
export { clientErrors } from './error-handlers';
export { clientMapper } from './mapper';
export * from './schemas';
```

- [ ] **Step 5: Verify** — `pnpm build && pnpm test`
- [ ] **Step 6: Commit**

```bash
git add services/clients/
git commit -m "refactor(clients): add mapper, error handler factory, CQRS sections"
```

---

### Task 7: Clients UI refactor

Apply: #8 Action Hooks, #9 Interaction Hook, #10 Screen as Coordinator, #27 Context, row-level dialogs.

**Files to create:**
- `app/(dashboard)/clients/_hooks/useCreateClient.ts`
- `app/(dashboard)/clients/_hooks/useUpdateClient.ts`
- `app/(dashboard)/clients/_hooks/useDeleteClient.ts`
- `app/(dashboard)/clients/_components/ClientsProvider.tsx`
- `app/(dashboard)/clients/_components/AddClientButton.tsx`
- `app/(dashboard)/clients/_components/ClientRowActions.tsx`

**Files to rewrite:**
- `app/(dashboard)/clients/_hooks/useClientForm.ts` — #9 pure form, uses `useForm` directly
- `app/(dashboard)/clients/_hooks/index.ts`
- `app/(dashboard)/clients/_components/ClientDataTable.tsx` — pure UI
- `app/(dashboard)/clients/_components/ClientForm.tsx` — `submitLabel` prop
- `app/(dashboard)/clients/_components/columns.tsx` — static, uses ClientRowActions

**Files to delete:**
- `app/(dashboard)/clients/_hooks/useClientDialogs.ts`
- `app/(dashboard)/clients/_components/ClientFormDialog.tsx`
- `app/(dashboard)/clients/_components/ClientDeleteDialog.tsx`

- [ ] **Step 1: Create Action Hooks**

```typescript
// _hooks/useCreateClient.ts — #8 Action Hook
'use client';

import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import { createClient } from '@/services/clients/actions';
import { clientErrors } from '@/services/clients/error-handlers';
import type { ActionError } from '@/services/shared/result';

interface UseCreateClientOptions {
	onSuccess?: () => void;
	onError?: (error: ActionError) => void;
	onSettled?: () => void;
}

export function useCreateClient({ onSuccess, onError, onSettled }: UseCreateClientOptions = {}) {
	return useServerAction(createClient, {
		onSuccess: () => { toast.success('Client created'); onSuccess?.(); },
		onError: (error) => { toast.error(clientErrors.getMessage(error)); onError?.(error); },
		onSettled: () => onSettled?.(),
	});
}
```

```typescript
// _hooks/useUpdateClient.ts — #8 Action Hook
'use client';

import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import { updateClient } from '@/services/clients/actions';
import { clientErrors } from '@/services/clients/error-handlers';
import type { ActionError } from '@/services/shared/result';

interface UseUpdateClientOptions {
	onSuccess?: () => void;
	onError?: (error: ActionError) => void;
	onSettled?: () => void;
}

export function useUpdateClient({ onSuccess, onError, onSettled }: UseUpdateClientOptions = {}) {
	return useServerAction(updateClient, {
		onSuccess: () => { toast.success('Client updated'); onSuccess?.(); },
		onError: (error) => { toast.error(clientErrors.getMessage(error)); onError?.(error); },
		onSettled: () => onSettled?.(),
	});
}
```

```typescript
// _hooks/useDeleteClient.ts — #8 Action Hook
// Uses useServerAction.error for blocking state — no extra useState
'use client';

import { useCallback } from 'react';
import { toast } from 'sonner';
import { useServerAction } from '@/hooks/useServerAction';
import { deleteClient } from '@/services/clients/actions';
import { clientErrors } from '@/services/clients/error-handlers';
import type { Client } from '@/types/client';

interface UseDeleteClientOptions {
	onSuccess?: () => void;
	onSettled?: () => void;
}

export function useDeleteClient({ onSuccess, onSettled }: UseDeleteClientOptions = {}) {
	const { execute: executeAction, isPending, error, reset } = useServerAction(deleteClient, {
		onError: (error) => {
			if (!clientErrors.isBlocking(error.code)) {
				toast.error(clientErrors.getMessage(error));
				onSettled?.();
			}
		},
	});

	// Derived from useServerAction.error — zero extra useState
	const blockingError = error && clientErrors.isBlocking(error.code)
		? clientErrors.getMessage(error)
		: null;

	const execute = useCallback(async (client: Client) => {
		const result = await executeAction({ id: client.id });
		if (result.success) {
			toast.success('Client deleted');
			onSuccess?.();
		}
	}, [executeAction, onSuccess]);

	return { execute, isPending, blockingError, reset };
}
```

- [ ] **Step 2: Rewrite useClientForm — #9 Interaction Hook (direct useForm)**

```typescript
// _hooks/useClientForm.ts
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { clientMapper } from '@/services/clients/mapper';
import { createClientSchema, type CreateClientInput } from '@/services/clients/schemas';
import type { Client } from '@/types/client';

export function useClientForm({ onSubmit }: { onSubmit: (data: CreateClientInput) => Promise<void> }) {
	const form = useForm<CreateClientInput>({
		resolver: zodResolver(createClientSchema),
		defaultValues: clientMapper.defaultValues,
	});

	return {
		form,
		isPending: form.formState.isSubmitting,
		submit: form.handleSubmit(onSubmit),
		resetForCreate: () => form.reset(clientMapper.defaultValues),
		resetForEdit: (entity: Client) => form.reset(clientMapper.toForm(entity)),
	};
}
```

- [ ] **Step 3: Update hooks barrel**

```typescript
// _hooks/index.ts
export { useCreateClient } from './useCreateClient';
export { useUpdateClient } from './useUpdateClient';
export { useDeleteClient } from './useDeleteClient';
export { useClientForm } from './useClientForm';
```

- [ ] **Step 4: Create ClientsProvider**

```typescript
// _components/ClientsProvider.tsx
'use client';

import { createContext, useContext } from 'react';

interface ClientsContextValue {
	onMutationSuccess: () => void;
}

const ClientsContext = createContext<ClientsContextValue | null>(null);

export const useClientsContext = () => {
	const ctx = useContext(ClientsContext);
	if (!ctx) throw new Error('useClientsContext must be used within ClientsProvider');
	return ctx;
};

export const ClientsProvider = ({
	onMutationSuccess,
	children,
}: ClientsContextValue & { children: React.ReactNode }) => (
	<ClientsContext value={{ onMutationSuccess }}>
		{children}
	</ClientsContext>
);
```

- [ ] **Step 5: Create AddClientButton**

```typescript
// _components/AddClientButton.tsx
'use client';

import { PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useDialogFocusRestore } from '@/hooks/useDialogFocusRestore';
import { useModalState } from '@/hooks/useModalState';

import { useClientsContext } from './ClientsProvider';
import { useCreateClient } from '../_hooks/useCreateClient';
import { useClientForm } from '../_hooks/useClientForm';
import { ClientForm } from './ClientForm';

export const AddClientButton = () => {
	const { onMutationSuccess } = useClientsContext();
	const modal = useModalState();

	const createAction = useCreateClient({
		onSuccess: onMutationSuccess,
		onSettled: modal.close,
	});

	const { form, submit, isPending, resetForCreate } = useClientForm({
		onSubmit: createAction.execute,
	});

	const { onCloseAutoFocus } = useDialogFocusRestore({ triggerRef: modal.triggerRef });

	const openDialog = () => {
		resetForCreate();
		modal.open();
	};

	return (
		<>
			<Button onClick={openDialog}>
				<PlusIcon className="mr-2 size-4" aria-hidden="true" />
				Add Client
			</Button>

			<Dialog open={modal.isOpen} onOpenChange={modal.close}>
				<DialogContent onCloseAutoFocus={onCloseAutoFocus}>
					<DialogHeader>
						<DialogTitle>Add Client</DialogTitle>
						<DialogDescription>Fill in the details to add a new client.</DialogDescription>
					</DialogHeader>
					<ClientForm
						form={form}
						onSubmit={submit}
						isPending={isPending || createAction.isPending}
						submitLabel="Add Client"
						onCancel={modal.close}
					/>
				</DialogContent>
			</Dialog>
		</>
	);
};
```

- [ ] **Step 6: Create ClientRowActions (row-level edit + delete)**

```typescript
// _components/ClientRowActions.tsx
'use client';

import { MoreHorizontalIcon, PencilIcon, TrashIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
	AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
	Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
	DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DestructiveButton } from '@/components/ui/destructive-button';
import { useDialogFocusRestore } from '@/hooks/useDialogFocusRestore';
import { useModalState } from '@/hooks/useModalState';
import type { Client } from '@/types/client';

import { useClientsContext } from './ClientsProvider';
import { useUpdateClient } from '../_hooks/useUpdateClient';
import { useDeleteClient } from '../_hooks/useDeleteClient';
import { useClientForm } from '../_hooks/useClientForm';
import { ClientForm } from './ClientForm';

export const ClientRowActions = ({ client }: { client: Client }) => {
	const { onMutationSuccess } = useClientsContext();

	// --- Edit ---
	const editModal = useModalState<Client>();
	const updateAction = useUpdateClient({
		onSuccess: onMutationSuccess,
		onSettled: editModal.close,
	});
	const editForm = useClientForm({
		onSubmit: (data) => updateAction.execute({ id: client.id, ...data }),
	});
	const editFocus = useDialogFocusRestore({ triggerRef: editModal.triggerRef });

	const openEdit = () => {
		editForm.resetForEdit(client);
		editModal.open(client);
	};

	// --- Delete ---
	const deleteAction = useDeleteClient({
		onSuccess: onMutationSuccess,
		onSettled: deleteModal.close,
	});
	const deleteModal = useModalState<Client>({
		onClose: deleteAction.reset,  // clears blocking error via useServerAction.reset
	});
	const deleteFocus = useDialogFocusRestore({ triggerRef: deleteModal.triggerRef });

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" size="icon-sm" aria-label={`Actions for ${client.name}`}>
						<MoreHorizontalIcon className="size-4" aria-hidden="true" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuItem onClick={openEdit}>
						<PencilIcon className="mr-2 size-4" aria-hidden="true" />
						Edit
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => deleteModal.open(client)}
						className="text-destructive focus:text-destructive"
					>
						<TrashIcon className="mr-2 size-4" aria-hidden="true" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			{/* Edit Dialog */}
			<Dialog open={editModal.isOpen} onOpenChange={editModal.close}>
				<DialogContent onCloseAutoFocus={editFocus.onCloseAutoFocus}>
					<DialogHeader>
						<DialogTitle>Edit Client</DialogTitle>
						<DialogDescription>Update the client information below.</DialogDescription>
					</DialogHeader>
					<ClientForm
						form={editForm.form}
						onSubmit={editForm.submit}
						isPending={editForm.isPending || updateAction.isPending}
						submitLabel="Save Changes"
						onCancel={editModal.close}
					/>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<AlertDialog open={deleteModal.isOpen} onOpenChange={deleteModal.close}>
				<AlertDialogContent onCloseAutoFocus={deleteFocus.onCloseAutoFocus}>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Client</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete <strong>{client.name}</strong>? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					{deleteAction.blockingError && (
						<div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-destructive text-sm" role="alert">
							{deleteAction.blockingError}
						</div>
					)}
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteAction.isPending}>Cancel</AlertDialogCancel>
						<DestructiveButton
							onClick={() => deleteAction.execute(client)}
							disabled={!!deleteAction.blockingError}
							isPending={deleteAction.isPending}
							loadingText="Deleting..."
						>
							Delete
						</DestructiveButton>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};
```

- [ ] **Step 7: Simplify columns.tsx — static array, no factory**

```typescript
// _components/columns.tsx
'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/ui/data-table/data-table-column-header';
import type { Client } from '@/types/client';
import { ClientRowActions } from './ClientRowActions';

export const columns: ColumnDef<Client>[] = [
	{
		accessorKey: 'name',
		header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
		cell: ({ row }) => (
			<span className="block max-w-[200px] truncate" title={row.getValue('name')}>
				{row.getValue('name')}
			</span>
		),
		enableSorting: true,
	},
	{
		accessorKey: 'email',
		header: 'Email',
		cell: ({ row }) => (
			<span className="block max-w-[200px] truncate" title={row.getValue('email')}>
				{row.getValue('email')}
			</span>
		),
		enableSorting: false,
	},
	{
		accessorKey: 'phone',
		header: 'Phone',
		cell: ({ row }) => <span className="tabular-nums">{row.getValue('phone')}</span>,
		enableSorting: false,
	},
	{
		accessorKey: 'address',
		header: 'Address',
		cell: ({ row }) => (
			<span className="line-clamp-2 max-w-[200px]" title={row.getValue('address')}>
				{row.getValue('address')}
			</span>
		),
		enableSorting: false,
	},
	{
		id: 'actions',
		header: () => <span className="sr-only">Actions</span>,
		cell: ({ row }) => <ClientRowActions client={row.original} />,
		enableSorting: false,
	},
];
```

- [ ] **Step 8: Rewrite ClientDataTable — pure UI**

```typescript
// _components/ClientDataTable.tsx
'use client';

import { useRouter } from 'next/navigation';

import { DataTable } from '@/components/ui/data-table/data-table';
import { SearchInput } from '@/components/ui/search-input';
import { useDataTableState } from '@/hooks/useDataTableState';
import type { PaginatedResult } from '@/services/shared/pagination';
import type { Client } from '@/types/client';

import { AddClientButton } from './AddClientButton';
import { ClientsProvider } from './ClientsProvider';
import { columns } from './columns';

export const ClientDataTable = ({ initialData }: { initialData: PaginatedResult<Client> }) => {
	const router = useRouter();
	const tableState = useDataTableState({ defaultSortBy: 'created_at', defaultSortOrder: 'desc' });

	return (
		<ClientsProvider onMutationSuccess={router.refresh}>
			<div className="space-y-4">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<SearchInput
						placeholder="Search clients..."
						syncWithUrlParam="search"
						minChars={3}
						className="w-full sm:max-w-xs"
					/>
					<AddClientButton />
				</div>

				<DataTable
					columns={columns}
					data={initialData.data}
					pagination={initialData.pagination}
					onPaginationChange={tableState.onPaginationChange}
					sorting={tableState.sorting}
					onSortingChange={tableState.onSortingChange}
					emptyState={{
						title: 'No clients found',
						description: 'Get started by adding your first client.',
						action: <AddClientButton />,
					}}
				/>
			</div>
		</ClientsProvider>
	);
};
```

- [ ] **Step 9: Update ClientForm — submitLabel prop instead of isEdit**

Change interface: remove `isEdit: boolean`, add `submitLabel: string`. Button renders `{submitLabel}`.

- [ ] **Step 10: Delete old files** — `useClientDialogs.ts`, `ClientFormDialog.tsx`, `ClientDeleteDialog.tsx`
- [ ] **Step 11: Verify** — `pnpm build && pnpm test`
- [ ] **Step 12: Commit**

```bash
git add app/(dashboard)/clients/
git commit -m "refactor(clients): apply decomposition patterns - action hooks, context, row-level dialogs"
```

---

### Task 8: Verify clients E2E

- [ ] **Step 1: Run E2E** — `pnpm exec playwright test e2e/tests/clients/ --project=chromium`
- [ ] **Step 2: Fix broken selectors if any**
- [ ] **Step 3: Commit fixes**

---

## Phase 2: Work Locations (US-004)

### Task 9: Work Locations — full module (service + page + E2E)

Follow clients reference pattern from Phase 1.

**Service layer:** `types/work-location.ts`, `services/work-locations/{mapper,error-handlers,actions,index}.ts`
- Join: `select('*, clients(name)')`
- Extra filter: `clientId`
- Mapper: `clientId ↔ client_id`, nullable email/phone
- Error: `HAS_DEPENDENCIES` blocking
- `getWorkLocationsForSelect()` → `{ id, name, clientName }[]`

**UI:** Same architecture as clients.
- `LocationsProvider`, `AddLocationButton`, `LocationRowActions`
- `useCreateWorkLocation`, `useUpdateWorkLocation`, `useDeleteWorkLocation`
- `useLocationForm` — has `clientId` ComboBoxSelect field
- Page fetches locations + clients list in parallel

**E2E:** `e2e/page-objects/locations.page.ts`, `e2e/tests/locations/locations.spec.ts`

- [ ] **Step 1: Create service layer**
- [ ] **Step 2: Create UI components + hooks**
- [ ] **Step 3: Verify build** — `pnpm build`
- [ ] **Step 4: Create E2E page object + tests**
- [ ] **Step 5: Run E2E** — `pnpm exec playwright test e2e/tests/locations/ --project=chromium`
- [ ] **Step 6: Commit**

```bash
git add types/work-location.ts services/work-locations/ app/(dashboard)/locations/ e2e/
git commit -m "feat(locations): add work locations module with CRUD, UI, and E2E tests"
```

---

## Phase 3: Workers (US-005)

### Task 10: Workers — full module (service + page + E2E)

Follow clients pattern. Key differences:
- 3 fields: `firstName ↔ first_name`, `lastName ↔ last_name`, `phone`
- `organization_id` via profile query in action
- Duplicate field: `phone`
- Table columns: Full Name (computed), Phone, Actions

- [ ] **Step 1-6: Service + UI + E2E + commit**

```bash
git add types/worker.ts services/workers/ app/(dashboard)/workers/ e2e/
git commit -m "feat(workers): add workers module with CRUD, UI, and E2E tests"
```

---

## Phase 4: Positions + Assignments + Board (US-007–US-010)

### Task 11: Positions service layer

Standard service, no standalone page.

- [ ] **Step 1-2: Service files + commit** — `feat(positions): add position service layer`

### Task 12: Assignments service layer

Custom actions with RPC: `createAssignment`, `endAssignment` (RPC), `cancelAssignment` (RPC), `getWorkerAssignments`.

- [ ] **Step 1-2: Service files + commit** — `feat(assignments): add assignment service with RPC actions`

### Task 13: Positions inline UI in Locations

Expandable rows in locations table. `PositionList` + `PositionFormInline`.

- [ ] **Step 1-4: Components + commit** — `feat(positions): add inline position management in locations`

### Task 14: Board page

Dashboard `/`. Worker table with expandable assignments, assign/end/cancel dialogs, search + availability filter.

- [ ] **Step 1-4: Full board + commit** — `feat(assignments): add board page with worker assignments`

### Task 15: Board + Assignments + Positions E2E

Full workflow E2E: create position → assign worker → view → end → cancel.

- [ ] **Step 1-3: E2E + commit** — `test(assignments): add E2E tests for board, positions, and assignments`

---

## Phase 5: Reports (US-011)

### Task 16: Reports — full module (service + page + E2E)

RPC `get_hours_report`. Date range + client filter → table → CSV/Excel export.

- [ ] **Step 1: Install xlsx** — `pnpm add xlsx`
- [ ] **Step 2-6: Service + page + E2E + commit** — `feat(reports): add hours report with CSV/Excel export`

---

## Phase 6: Admin — Users + Profile (US-013, US-014)

### Task 17: DB migration + admin client

Update `handle_new_user()` for invite flow. Create `lib/supabase/admin.ts`.

- [ ] **Step 1-4: Migration + commit** — `feat(auth): update handle_new_user for invite flow`

### Task 18: User management — full module (service + page + E2E)

`getUsers`, `inviteCoordinator`, `deactivateUser`, `reactivateUser`.

- [ ] **Step 1-5: Full module + commit** — `feat(auth): add user management with invite and deactivation`

### Task 19: User profile — UI + E2E

`updateProfile` action. Dialog from UserMenu.

- [ ] **Step 1-6: UI + E2E + commit** — `feat(auth): add user profile editing`

---

## Final Verification

### Task 20: Full verification

- [ ] **Step 1:** `pnpm build` — no type errors
- [ ] **Step 2:** `pnpm test` — all unit tests pass
- [ ] **Step 3:** `pnpm exec playwright test --project=chromium` — all E2E pass
- [ ] **Step 4:** `pnpm lint` — no linting errors
