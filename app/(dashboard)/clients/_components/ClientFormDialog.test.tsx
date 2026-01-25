import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { createClient, updateClient } from '@/services/clients/actions';
import type { Client } from '@/types/client';

import { ClientFormDialog } from './ClientFormDialog';

vi.mock('@/services/clients/actions', () => ({
	createClient: vi.fn(),
	updateClient: vi.fn(),
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

const getNameInput = () => screen.getByLabelText('Name');
const getEmailInput = () => screen.getByLabelText('Email');
const getPhoneInput = () => screen.getByLabelText('Phone');
const getAddressInput = () => screen.getByLabelText('Address');
const getSubmitButton = () =>
	screen.getByRole('button', { name: /add client|save changes/i });
const getCancelButton = () => screen.getByRole('button', { name: /cancel/i });

describe('ClientFormDialog', () => {
	describe('Rendering', () => {
		it('renders dialog with create mode title when client is null', () => {
			render(
				<ClientFormDialog
					open={true}
					onOpenChange={vi.fn()}
					client={null}
					onSuccess={vi.fn()}
				/>
			);

			expect(
				screen.getByRole('heading', { name: 'Add Client' })
			).toBeInTheDocument();
			expect(getNameInput()).toBeInTheDocument();
			expect(getEmailInput()).toBeInTheDocument();
			expect(getPhoneInput()).toBeInTheDocument();
			expect(getAddressInput()).toBeInTheDocument();
		});

		it('renders dialog with edit mode title when client is provided', () => {
			render(
				<ClientFormDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			expect(
				screen.getByRole('heading', { name: 'Edit Client' })
			).toBeInTheDocument();
		});

		it('does not render when open is false', () => {
			render(
				<ClientFormDialog
					open={false}
					onOpenChange={vi.fn()}
					client={null}
					onSuccess={vi.fn()}
				/>
			);

			expect(
				screen.queryByRole('heading', { name: 'Add Client' })
			).not.toBeInTheDocument();
		});

		it('populates form fields with client data in edit mode', () => {
			render(
				<ClientFormDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={vi.fn()}
				/>
			);

			expect(getNameInput()).toHaveValue('Test Client');
			expect(getEmailInput()).toHaveValue('test@example.com');
			expect(getAddressInput()).toHaveValue('123 Test St');
		});
	});

	describe('Validation', () => {
		it('does not submit form with empty required fields', async () => {
			const user = userEvent.setup();
			const mockCreateClient = vi.mocked(createClient);

			render(
				<ClientFormDialog
					open={true}
					onOpenChange={vi.fn()}
					client={null}
					onSuccess={vi.fn()}
				/>
			);

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockCreateClient).not.toHaveBeenCalled();
			});
		});

		it('does not submit form with invalid email', async () => {
			const user = userEvent.setup();
			const mockCreateClient = vi.mocked(createClient);

			render(
				<ClientFormDialog
					open={true}
					onOpenChange={vi.fn()}
					client={null}
					onSuccess={vi.fn()}
				/>
			);

			await user.type(getNameInput(), 'Test Client');
			await user.type(getEmailInput(), 'invalid-email');
			await user.type(getPhoneInput(), '123456789');
			await user.type(getAddressInput(), '123 Test St');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockCreateClient).not.toHaveBeenCalled();
			});
		});
	});

	describe('Create Mode', () => {
		it('calls createClient with form data on valid submission', async () => {
			const user = userEvent.setup();
			const mockCreateClient = vi.mocked(createClient);
			const onSuccess = vi.fn();
			mockCreateClient.mockResolvedValue({ success: true, data: mockClient });

			render(
				<ClientFormDialog
					open={true}
					onOpenChange={vi.fn()}
					client={null}
					onSuccess={onSuccess}
				/>
			);

			await user.type(getNameInput(), 'New Client');
			await user.type(getEmailInput(), 'new@example.com');
			await user.type(getPhoneInput(), '123456789');
			await user.type(getAddressInput(), '456 New St');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockCreateClient).toHaveBeenCalledWith({
					name: 'New Client',
					email: 'new@example.com',
					phone: '123456789',
					address: '456 New St',
				});
			});
		});

		it('calls onSuccess with false for create mode after successful creation', async () => {
			const user = userEvent.setup();
			const mockCreateClient = vi.mocked(createClient);
			const onSuccess = vi.fn();
			mockCreateClient.mockResolvedValue({ success: true, data: mockClient });

			render(
				<ClientFormDialog
					open={true}
					onOpenChange={vi.fn()}
					client={null}
					onSuccess={onSuccess}
				/>
			);

			await user.type(getNameInput(), 'New Client');
			await user.type(getEmailInput(), 'new@example.com');
			await user.type(getPhoneInput(), '123456789');
			await user.type(getAddressInput(), '456 New St');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(onSuccess).toHaveBeenCalledWith(false);
			});
		});
	});

	describe('Edit Mode', () => {
		it('calls updateClient with form data on valid submission', async () => {
			const user = userEvent.setup();
			const mockUpdateClient = vi.mocked(updateClient);
			const onSuccess = vi.fn();
			mockUpdateClient.mockResolvedValue({
				success: true,
				data: { ...mockClient, name: 'Updated Client' },
			});

			render(
				<ClientFormDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={onSuccess}
				/>
			);

			await user.clear(getNameInput());
			await user.type(getNameInput(), 'Updated Client');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockUpdateClient).toHaveBeenCalledWith({
					id: mockClient.id,
					name: 'Updated Client',
					email: mockClient.email,
					phone: mockClient.phone,
					address: mockClient.address,
				});
			});
		});

		it('calls onSuccess with true for edit mode after successful update', async () => {
			const user = userEvent.setup();
			const mockUpdateClient = vi.mocked(updateClient);
			const onSuccess = vi.fn();
			mockUpdateClient.mockResolvedValue({
				success: true,
				data: { ...mockClient, name: 'Updated Client' },
			});

			render(
				<ClientFormDialog
					open={true}
					onOpenChange={vi.fn()}
					client={mockClient}
					onSuccess={onSuccess}
				/>
			);

			await user.clear(getNameInput());
			await user.type(getNameInput(), 'Updated Client');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(onSuccess).toHaveBeenCalledWith(true);
			});
		});
	});

	describe('Error Handling', () => {
		it('shows field error for duplicate entry', async () => {
			const user = userEvent.setup();
			const mockCreateClient = vi.mocked(createClient);
			mockCreateClient.mockResolvedValue({
				success: false,
				error: {
					code: 'DUPLICATE_ENTRY',
					message: 'Email already exists',
					details: { field: 'email' },
				},
			});

			render(
				<ClientFormDialog
					open={true}
					onOpenChange={vi.fn()}
					client={null}
					onSuccess={vi.fn()}
				/>
			);

			await user.type(getNameInput(), 'New Client');
			await user.type(getEmailInput(), 'existing@example.com');
			await user.type(getPhoneInput(), '123456789');
			await user.type(getAddressInput(), '456 New St');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(
					screen.getByText(/this email is already in use/i)
				).toBeInTheDocument();
			});
		});
	});

	describe('Interactions', () => {
		it('calls onOpenChange when cancel button is clicked', async () => {
			const user = userEvent.setup();
			const onOpenChange = vi.fn();

			render(
				<ClientFormDialog
					open={true}
					onOpenChange={onOpenChange}
					client={null}
					onSuccess={vi.fn()}
				/>
			);

			await user.click(getCancelButton());

			expect(onOpenChange).toHaveBeenCalledWith(false);
		});

		it('disables buttons during submission', async () => {
			const user = userEvent.setup();
			const mockCreateClient = vi.mocked(createClient);
			mockCreateClient.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(() => resolve({ success: true, data: mockClient }), 100)
					)
			);

			render(
				<ClientFormDialog
					open={true}
					onOpenChange={vi.fn()}
					client={null}
					onSuccess={vi.fn()}
				/>
			);

			await user.type(getNameInput(), 'New Client');
			await user.type(getEmailInput(), 'new@example.com');
			await user.type(getPhoneInput(), '123456789');
			await user.type(getAddressInput(), '456 New St');
			await user.click(getSubmitButton());

			expect(getCancelButton()).toBeDisabled();
			expect(
				screen.getByRole('button', { name: /saving/i })
			).toBeInTheDocument();
		});

		it('resets form when dialog closes and reopens', async () => {
			const user = userEvent.setup();
			const { rerender } = render(
				<ClientFormDialog
					open={true}
					onOpenChange={vi.fn()}
					client={null}
					onSuccess={vi.fn()}
				/>
			);

			await user.type(getNameInput(), 'Partial data');

			// Close dialog
			rerender(
				<ClientFormDialog
					open={false}
					onOpenChange={vi.fn()}
					client={null}
					onSuccess={vi.fn()}
				/>
			);

			// Reopen dialog
			rerender(
				<ClientFormDialog
					open={true}
					onOpenChange={vi.fn()}
					client={null}
					onSuccess={vi.fn()}
				/>
			);

			expect(getNameInput()).toHaveValue('');
		});
	});
});
