import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';

import { deleteClient } from '@/services/clients/actions';
import type { Client } from '@/types/client';

import { ClientDeleteDialog } from './ClientDeleteDialog';

vi.mock('@/services/clients/actions', () => ({
	deleteClient: vi.fn(),
}));

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const mockClient: Client = {
	id: '1',
	name: 'Test Client',
	email: 'test@example.com',
	phone: '+48123456789',
	address: '123 Test St',
	organization_id: 'org-1',
	created_at: '2024-01-01T00:00:00Z',
	updated_at: '2024-01-01T00:00:00Z',
	deleted_at: null,
};

const getDeleteButton = () => screen.getByRole('button', { name: /delete/i });
const getCancelButton = () => screen.getByRole('button', { name: /cancel/i });

describe('ClientDeleteDialog', () => {
	describe('Rendering', () => {
		it('renders dialog with delete confirmation', () => {
			render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			expect(screen.getByText('Delete Client')).toBeInTheDocument();
			expect(screen.getByText(/test client/i)).toBeInTheDocument();
			expect(
				screen.getByText(/this action cannot be undone/i)
			).toBeInTheDocument();
		});

		it('does not render when open is false', () => {
			render(
				<ClientDeleteDialog
					open={false}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			expect(screen.queryByText('Delete Client')).not.toBeInTheDocument();
		});

		it('shows client name in confirmation message', () => {
			render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			expect(screen.getByText('Test Client')).toBeInTheDocument();
		});
	});

	describe('Delete Action', () => {
		it('calls deleteClient when delete button is clicked', async () => {
			const user = userEvent.setup();
			const mockDeleteClient = vi.mocked(deleteClient);
			mockDeleteClient.mockResolvedValue({ success: true, data: mockClient });

			render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			await user.click(getDeleteButton());

			await waitFor(() => {
				expect(mockDeleteClient).toHaveBeenCalledWith({ id: mockClient.id });
			});
		});

		it('calls onSuccess after successful deletion', async () => {
			const user = userEvent.setup();
			const mockDeleteClient = vi.mocked(deleteClient);
			const onSuccess = vi.fn();
			mockDeleteClient.mockResolvedValue({ success: true, data: mockClient });

			render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={onSuccess}
				/>
			);

			await user.click(getDeleteButton());

			await waitFor(() => {
				expect(onSuccess).toHaveBeenCalled();
			});
		});
	});

	describe('Error Handling', () => {
		it('shows blocking error for HAS_DEPENDENCIES', async () => {
			const user = userEvent.setup();
			const mockDeleteClient = vi.mocked(deleteClient);
			mockDeleteClient.mockResolvedValue({
				success: false,
				error: {
					code: 'HAS_DEPENDENCIES',
					message: 'Cannot delete client with work locations',
				},
			});

			render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			await user.click(getDeleteButton());

			await waitFor(() => {
				expect(
					screen.getByText(/cannot be deleted because it has associated/i)
				).toBeInTheDocument();
			});
		});

		it('disables delete button when HAS_DEPENDENCIES error is shown', async () => {
			const user = userEvent.setup();
			const mockDeleteClient = vi.mocked(deleteClient);
			mockDeleteClient.mockResolvedValue({
				success: false,
				error: {
					code: 'HAS_DEPENDENCIES',
					message: 'Cannot delete client with work locations',
				},
			});

			render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			await user.click(getDeleteButton());

			await waitFor(() => {
				expect(getDeleteButton()).toBeDisabled();
			});
		});

		it('shows toast and closes dialog for NOT_FOUND error', async () => {
			const user = userEvent.setup();
			const mockDeleteClient = vi.mocked(deleteClient);
			const onOpenChange = vi.fn();
			const mockToastError = vi.mocked(toast.error);
			mockDeleteClient.mockResolvedValue({
				success: false,
				error: {
					code: 'NOT_FOUND',
					message: 'Client not found',
				},
			});

			render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={onOpenChange}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			await user.click(getDeleteButton());

			await waitFor(() => {
				expect(mockToastError).toHaveBeenCalledWith(
					'Client not found. It may have already been deleted.'
				);
				expect(onOpenChange).toHaveBeenCalledWith(false);
			});
		});

		it('shows toast and closes dialog for FORBIDDEN error', async () => {
			const user = userEvent.setup();
			const mockDeleteClient = vi.mocked(deleteClient);
			const onOpenChange = vi.fn();
			const mockToastError = vi.mocked(toast.error);
			mockDeleteClient.mockResolvedValue({
				success: false,
				error: {
					code: 'FORBIDDEN',
					message: 'Permission denied',
				},
			});

			render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={onOpenChange}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			await user.click(getDeleteButton());

			await waitFor(() => {
				expect(mockToastError).toHaveBeenCalledWith(
					'You do not have permission to delete this client.'
				);
				expect(onOpenChange).toHaveBeenCalledWith(false);
			});
		});
	});

	describe('Interactions', () => {
		it('calls onOpenChange when cancel button is clicked', async () => {
			const user = userEvent.setup();
			const onOpenChange = vi.fn();

			render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={onOpenChange}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			await user.click(getCancelButton());

			expect(onOpenChange).toHaveBeenCalledWith(false);
		});

		it('disables cancel button during deletion', async () => {
			const user = userEvent.setup();
			const mockDeleteClient = vi.mocked(deleteClient);
			mockDeleteClient.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(() => resolve({ success: true, data: mockClient }), 100)
					)
			);

			render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			await user.click(getDeleteButton());

			expect(getCancelButton()).toBeDisabled();
		});

		it('shows loading state during deletion', async () => {
			const user = userEvent.setup();
			const mockDeleteClient = vi.mocked(deleteClient);
			mockDeleteClient.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(() => resolve({ success: true, data: mockClient }), 100)
					)
			);

			render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			await user.click(getDeleteButton());

			expect(
				screen.getByRole('button', { name: /deleting/i })
			).toBeInTheDocument();
		});

		it('clears blocking error when dialog is closed', async () => {
			const user = userEvent.setup();
			const mockDeleteClient = vi.mocked(deleteClient);
			mockDeleteClient.mockResolvedValue({
				success: false,
				error: {
					code: 'HAS_DEPENDENCIES',
					message: 'Cannot delete',
				},
			});

			const { rerender } = render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			await user.click(getDeleteButton());

			await waitFor(() => {
				expect(
					screen.getByText(/cannot be deleted because it has associated/i)
				).toBeInTheDocument();
			});

			// Mock successful response for next attempt
			mockDeleteClient.mockResolvedValue({ success: true, data: mockClient });

			// Close and reopen dialog
			rerender(
				<ClientDeleteDialog
					open={false}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);
			rerender(
				<ClientDeleteDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			// Error should be cleared
			expect(
				screen.queryByText(/cannot be deleted because it has associated/i)
			).not.toBeInTheDocument();
			expect(getDeleteButton()).not.toBeDisabled();
		});
	});

	describe('Accessibility', () => {
		it('has accessible dialog title', () => {
			render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			expect(
				screen.getByRole('heading', { name: 'Delete Client' })
			).toBeInTheDocument();
		});

		it('shows error in alert role', async () => {
			const user = userEvent.setup();
			const mockDeleteClient = vi.mocked(deleteClient);
			mockDeleteClient.mockResolvedValue({
				success: false,
				error: {
					code: 'HAS_DEPENDENCIES',
					message: 'Cannot delete',
				},
			});

			render(
				<ClientDeleteDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			await user.click(getDeleteButton());

			await waitFor(() => {
				expect(screen.getByRole('alert')).toBeInTheDocument();
			});
		});
	});
});
