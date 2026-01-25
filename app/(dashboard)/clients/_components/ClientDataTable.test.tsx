import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { getClients } from '@/services/clients/actions';
import type { PaginatedResult } from '@/services/shared/pagination';
import type { Client } from '@/types/client';

import { ClientDataTable } from './ClientDataTable';

vi.mock('@/services/clients/actions', () => ({
	getClients: vi.fn(),
	createClient: vi.fn(),
	updateClient: vi.fn(),
	deleteClient: vi.fn(),
}));

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
		refresh: mockRefresh,
	}),
	usePathname: () => '/clients',
	useSearchParams: () => new URLSearchParams(),
}));

const mockClients: Client[] = [
	{
		id: '1',
		name: 'Client A',
		email: 'clienta@example.com',
		phone: '+48111222333',
		address: '123 Main St',
		organization_id: 'org-1',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		deleted_at: null,
	},
	{
		id: '2',
		name: 'Client B',
		email: 'clientb@example.com',
		phone: '+48444555666',
		address: '456 Oak Ave',
		organization_id: 'org-1',
		created_at: '2024-01-02T00:00:00Z',
		updated_at: '2024-01-02T00:00:00Z',
		deleted_at: null,
	},
];

const mockInitialData: PaginatedResult<Client> = {
	data: mockClients,
	pagination: {
		page: 1,
		pageSize: 20,
		totalItems: 2,
		totalPages: 1,
		hasNextPage: false,
		hasPreviousPage: false,
	},
};

const emptyData: PaginatedResult<Client> = {
	data: [],
	pagination: {
		page: 1,
		pageSize: 20,
		totalItems: 0,
		totalPages: 0,
		hasNextPage: false,
		hasPreviousPage: false,
	},
};

describe('ClientDataTable', () => {
	describe('Rendering', () => {
		it('renders table with client data', () => {
			render(<ClientDataTable initialData={mockInitialData} />);

			expect(screen.getByText('Client A')).toBeInTheDocument();
			expect(screen.getByText('clienta@example.com')).toBeInTheDocument();
			expect(screen.getByText('Client B')).toBeInTheDocument();
			expect(screen.getByText('clientb@example.com')).toBeInTheDocument();
		});

		it('renders search input', () => {
			render(<ClientDataTable initialData={mockInitialData} />);

			expect(
				screen.getByPlaceholderText('Search clients...')
			).toBeInTheDocument();
		});

		it('renders Add Client button', () => {
			render(<ClientDataTable initialData={mockInitialData} />);

			expect(
				screen.getByRole('button', { name: /add client/i })
			).toBeInTheDocument();
		});

		it('renders column headers', () => {
			render(<ClientDataTable initialData={mockInitialData} />);

			expect(screen.getByText('Name')).toBeInTheDocument();
			expect(screen.getByText('Email')).toBeInTheDocument();
			expect(screen.getByText('Phone')).toBeInTheDocument();
			expect(screen.getByText('Address')).toBeInTheDocument();
		});
	});

	describe('Empty State', () => {
		it('renders empty state when no clients', () => {
			render(<ClientDataTable initialData={emptyData} />);

			expect(screen.getByText('No clients found')).toBeInTheDocument();
			expect(
				screen.getByText('Get started by adding your first client.')
			).toBeInTheDocument();
		});

		it('renders Add Client button in empty state', () => {
			render(<ClientDataTable initialData={emptyData} />);

			const addButtons = screen.getAllByRole('button', { name: /add client/i });
			expect(addButtons.length).toBeGreaterThan(0);
		});
	});

	describe('Create Flow', () => {
		it('opens create dialog when Add Client button is clicked', async () => {
			const user = userEvent.setup();
			render(<ClientDataTable initialData={mockInitialData} />);

			// Click the first Add Client button (in header)
			const addButton = screen.getAllByRole('button', {
				name: /add client/i,
			})[0];
			await user.click(addButton);

			expect(
				screen.getByRole('heading', { name: 'Add Client' })
			).toBeInTheDocument();
		});
	});

	describe('Edit Flow', () => {
		it('opens edit dialog when edit action is clicked', async () => {
			const user = userEvent.setup();
			render(<ClientDataTable initialData={mockInitialData} />);

			// Click the first actions menu
			const actionButtons = screen.getAllByRole('button', {
				name: /actions for/i,
			});
			await user.click(actionButtons[0]);

			// Click Edit
			const editButton = await screen.findByRole('menuitem', { name: /edit/i });
			await user.click(editButton);

			// Dialog should open in edit mode
			expect(
				screen.getByRole('heading', { name: 'Edit Client' })
			).toBeInTheDocument();
		});
	});

	describe('Delete Flow', () => {
		it('opens delete dialog when delete action is clicked', async () => {
			const user = userEvent.setup();
			render(<ClientDataTable initialData={mockInitialData} />);

			// Click the first actions menu
			const actionButtons = screen.getAllByRole('button', {
				name: /actions for/i,
			});
			await user.click(actionButtons[0]);

			// Click Delete
			const deleteButton = await screen.findByRole('menuitem', {
				name: /delete/i,
			});
			await user.click(deleteButton);

			// Delete confirmation dialog should open
			expect(screen.getByText('Delete Client')).toBeInTheDocument();
		});
	});

	describe('Data Refresh', () => {
		it('refreshes data after successful create', async () => {
			const user = userEvent.setup();
			const mockGetClients = vi.mocked(getClients);
			mockGetClients.mockResolvedValue({
				success: true,
				data: mockInitialData,
			});

			// We need to mock createClient for this test
			const { createClient } = await import('@/services/clients/actions');
			const mockCreateClient = vi.mocked(createClient);
			mockCreateClient.mockResolvedValue({
				success: true,
				data: mockClients[0],
			});

			render(<ClientDataTable initialData={mockInitialData} />);

			// Open create dialog
			const addButton = screen.getAllByRole('button', {
				name: /add client/i,
			})[0];
			await user.click(addButton);

			// Fill form
			await user.type(screen.getByLabelText('Name'), 'New Client');
			await user.type(screen.getByLabelText('Email'), 'new@example.com');
			await user.type(screen.getByLabelText('Phone'), '123456789');
			await user.type(screen.getByLabelText('Address'), 'New Address');

			// Submit
			await user.click(screen.getByRole('button', { name: /add client/i }));

			// Wait for refresh to be called
			await waitFor(() => {
				expect(mockGetClients).toHaveBeenCalled();
			});
		});
	});

	describe('Row Actions', () => {
		it('renders action buttons for each row', async () => {
			const user = userEvent.setup();
			render(<ClientDataTable initialData={mockInitialData} />);

			// Open the first action menu to verify it exists
			const actionButtons = screen.getAllByRole('button', {
				name: /actions for/i,
			});
			expect(actionButtons).toHaveLength(2); // One for each client

			await user.click(actionButtons[0]);

			expect(
				await screen.findByRole('menuitem', { name: /edit/i })
			).toBeInTheDocument();
			expect(
				await screen.findByRole('menuitem', { name: /delete/i })
			).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has accessible action buttons with client name', () => {
			render(<ClientDataTable initialData={mockInitialData} />);

			expect(
				screen.getByRole('button', { name: /actions for client a/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /actions for client b/i })
			).toBeInTheDocument();
		});
	});
});
