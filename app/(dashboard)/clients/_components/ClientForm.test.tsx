import { zodResolver } from '@hookform/resolvers/zod';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';

import {
	type CreateClientInput,
	createClientSchema,
} from '@/services/clients/schemas';

import { ClientForm } from './ClientForm';

// Wrapper component to provide react-hook-form context
const TestWrapper = ({
	onSubmit = vi.fn(),
	isPending = false,
	isEdit = false,
	onCancel = vi.fn(),
	defaultValues = { name: '', email: '', phone: '', address: '' },
}: {
	onSubmit?: (data: CreateClientInput) => Promise<void>;
	isPending?: boolean;
	isEdit?: boolean;
	onCancel?: () => void;
	defaultValues?: CreateClientInput;
}) => {
	const form = useForm<CreateClientInput>({
		resolver: zodResolver(createClientSchema),
		defaultValues,
	});

	return (
		<ClientForm
			form={form}
			onSubmit={onSubmit}
			isPending={isPending}
			isEdit={isEdit}
			onCancel={onCancel}
		/>
	);
};

const getNameInput = () => screen.getByLabelText('Name');
const getEmailInput = () => screen.getByLabelText('Email');
const getPhoneInput = () => screen.getByLabelText('Phone');
const getAddressInput = () => screen.getByLabelText('Address');
const getSubmitButton = () =>
	screen.getByRole('button', { name: /add client|save changes/i });
const getCancelButton = () => screen.getByRole('button', { name: /cancel/i });

describe('ClientForm', () => {
	describe('Rendering', () => {
		it('renders all form fields', () => {
			render(<TestWrapper />);

			expect(getNameInput()).toBeInTheDocument();
			expect(getEmailInput()).toBeInTheDocument();
			expect(getPhoneInput()).toBeInTheDocument();
			expect(getAddressInput()).toBeInTheDocument();
		});

		it('renders "Add Client" button in create mode', () => {
			render(<TestWrapper isEdit={false} />);

			expect(
				screen.getByRole('button', { name: 'Add Client' })
			).toBeInTheDocument();
		});

		it('renders "Save Changes" button in edit mode', () => {
			render(<TestWrapper isEdit />);

			expect(
				screen.getByRole('button', { name: 'Save Changes' })
			).toBeInTheDocument();
		});

		it('renders Cancel button', () => {
			render(<TestWrapper />);

			expect(getCancelButton()).toBeInTheDocument();
		});

		it('renders with default values', () => {
			render(
				<TestWrapper
					defaultValues={{
						name: 'Test Client',
						email: 'test@example.com',
						phone: '123456789',
						address: '123 Test St',
					}}
				/>
			);

			expect(getNameInput()).toHaveValue('Test Client');
			expect(getEmailInput()).toHaveValue('test@example.com');
			expect(getAddressInput()).toHaveValue('123 Test St');
		});
	});

	describe('Form fields', () => {
		it('has correct placeholders', () => {
			render(<TestWrapper />);

			expect(
				screen.getByPlaceholderText('Enter client name')
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('Enter email address')
			).toBeInTheDocument();
			expect(
				screen.getByPlaceholderText('Enter phone number')
			).toBeInTheDocument();
			expect(screen.getByPlaceholderText('Enter address')).toBeInTheDocument();
		});

		it('email input has type="email"', () => {
			render(<TestWrapper />);

			expect(getEmailInput()).toHaveAttribute('type', 'email');
		});
	});

	describe('Validation', () => {
		it('does not submit form with empty required fields', async () => {
			const user = userEvent.setup();
			const onSubmit = vi.fn();
			render(<TestWrapper onSubmit={onSubmit} />);

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});

		it('does not submit form with invalid email', async () => {
			const user = userEvent.setup();
			const onSubmit = vi.fn();
			render(<TestWrapper onSubmit={onSubmit} />);

			await user.type(getNameInput(), 'Test Client');
			await user.type(getEmailInput(), 'invalid-email');
			await user.type(getPhoneInput(), '123456789');
			await user.type(getAddressInput(), '123 Test St');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(onSubmit).not.toHaveBeenCalled();
			});
		});
	});

	describe('Submission', () => {
		it('calls onSubmit with form data on valid submission', async () => {
			const user = userEvent.setup();
			const onSubmit = vi.fn();
			render(<TestWrapper onSubmit={onSubmit} />);

			await user.type(getNameInput(), 'New Client');
			await user.type(getEmailInput(), 'new@example.com');
			await user.type(getPhoneInput(), '123456789');
			await user.type(getAddressInput(), '456 New St');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(onSubmit).toHaveBeenCalled();
				expect(onSubmit.mock.calls[0][0]).toEqual({
					name: 'New Client',
					email: 'new@example.com',
					phone: '123456789',
					address: '456 New St',
				});
			});
		});
	});

	describe('Cancel action', () => {
		it('calls onCancel when cancel button is clicked', async () => {
			const user = userEvent.setup();
			const onCancel = vi.fn();
			render(<TestWrapper onCancel={onCancel} />);

			await user.click(getCancelButton());

			expect(onCancel).toHaveBeenCalled();
		});
	});

	describe('Loading state', () => {
		it('shows "Saving..." when isPending is true', () => {
			render(<TestWrapper isPending />);

			expect(
				screen.getByRole('button', { name: /saving/i })
			).toBeInTheDocument();
		});

		it('disables submit button when isPending', () => {
			render(<TestWrapper isPending />);

			expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled();
		});

		it('disables cancel button when isPending', () => {
			render(<TestWrapper isPending />);

			expect(getCancelButton()).toBeDisabled();
		});

		it('shows spinner icon when isPending', () => {
			render(<TestWrapper isPending />);

			const submitButton = screen.getByRole('button', { name: /saving/i });
			const spinner = submitButton.querySelector('svg');
			expect(spinner).toBeInTheDocument();
			expect(spinner).toHaveClass('animate-spin');
		});
	});

	describe('Accessibility', () => {
		it('submit button has aria-busy when isPending', () => {
			render(<TestWrapper isPending />);

			const submitButton = screen.getByRole('button', { name: /saving/i });
			expect(submitButton).toHaveAttribute('aria-busy', 'true');
		});

		it('form fields have proper labels', () => {
			render(<TestWrapper />);

			expect(screen.getByLabelText('Name')).toBeInTheDocument();
			expect(screen.getByLabelText('Email')).toBeInTheDocument();
			expect(screen.getByLabelText('Phone')).toBeInTheDocument();
			expect(screen.getByLabelText('Address')).toBeInTheDocument();
		});
	});
});
