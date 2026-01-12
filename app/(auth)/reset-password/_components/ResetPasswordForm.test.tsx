import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { updatePassword } from '@/services/auth/actions';

import { ResetPasswordForm } from './ResetPasswordForm';

vi.mock('@/services/auth/actions', () => ({
	updatePassword: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
		refresh: vi.fn(),
	}),
}));

vi.mock('sonner', () => ({
	toast: {
		success: vi.fn(),
		error: vi.fn(),
	},
}));

const getPasswordInput = () => screen.getByLabelText('New password');
const getConfirmPasswordInput = () => screen.getByLabelText('Confirm password');
const getSubmitButton = () =>
	screen.getByRole('button', { name: /update password/i });

describe('ResetPasswordForm', () => {
	describe('Rendering', () => {
		it('renders password and confirm password inputs', () => {
			render(<ResetPasswordForm />);

			expect(getPasswordInput()).toBeInTheDocument();
			expect(getConfirmPasswordInput()).toBeInTheDocument();
			expect(getSubmitButton()).toBeInTheDocument();
		});

		it('renders with empty values by default', () => {
			render(<ResetPasswordForm />);

			expect(getPasswordInput()).toHaveValue('');
			expect(getConfirmPasswordInput()).toHaveValue('');
		});

		it('shows password requirements description', () => {
			render(<ResetPasswordForm />);

			expect(screen.getByText(/at least 8 characters/i)).toBeInTheDocument();
		});

		it('has accessible form name', () => {
			render(<ResetPasswordForm />);

			expect(screen.getByRole('form')).toHaveAttribute(
				'aria-label',
				'Reset password form'
			);
		});
	});

	describe('Validation', () => {
		it('does not submit with short password', async () => {
			const user = userEvent.setup();
			const mockUpdatePassword = vi.mocked(updatePassword);
			render(<ResetPasswordForm />);

			await user.type(getPasswordInput(), '1234567');
			await user.type(getConfirmPasswordInput(), '1234567');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockUpdatePassword).not.toHaveBeenCalled();
			});
		});

		it('does not submit with mismatched passwords', async () => {
			const user = userEvent.setup();
			const mockUpdatePassword = vi.mocked(updatePassword);
			render(<ResetPasswordForm />);

			await user.type(getPasswordInput(), 'password123');
			await user.type(getConfirmPasswordInput(), 'different123');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockUpdatePassword).not.toHaveBeenCalled();
			});
		});

		it('does not submit with empty passwords', async () => {
			const user = userEvent.setup();
			const mockUpdatePassword = vi.mocked(updatePassword);
			render(<ResetPasswordForm />);

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockUpdatePassword).not.toHaveBeenCalled();
			});
		});
	});

	describe('Interactions', () => {
		it('submits form with valid matching passwords', async () => {
			const user = userEvent.setup();
			const mockUpdatePassword = vi.mocked(updatePassword);
			mockUpdatePassword.mockResolvedValue({
				success: true,
				data: { success: true },
			});

			render(<ResetPasswordForm />);

			await user.type(getPasswordInput(), 'newpassword123');
			await user.type(getConfirmPasswordInput(), 'newpassword123');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockUpdatePassword).toHaveBeenCalledWith({
					newPassword: 'newpassword123',
					confirmPassword: 'newpassword123',
				});
			});
		});

		it('disables form during submission', async () => {
			const user = userEvent.setup();
			const mockUpdatePassword = vi.mocked(updatePassword);
			mockUpdatePassword.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() => resolve({ success: true, data: { success: true } }),
							100
						)
					)
			);

			render(<ResetPasswordForm />);

			await user.type(getPasswordInput(), 'newpassword123');
			await user.type(getConfirmPasswordInput(), 'newpassword123');
			await user.click(getSubmitButton());

			expect(getPasswordInput()).toBeDisabled();
			expect(getConfirmPasswordInput()).toBeDisabled();
		});

		it('shows loading state during submission', async () => {
			const user = userEvent.setup();
			const mockUpdatePassword = vi.mocked(updatePassword);
			mockUpdatePassword.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() => resolve({ success: true, data: { success: true } }),
							100
						)
					)
			);

			render(<ResetPasswordForm />);

			await user.type(getPasswordInput(), 'newpassword123');
			await user.type(getConfirmPasswordInput(), 'newpassword123');
			await user.click(getSubmitButton());

			expect(
				screen.getByRole('button', { name: /updating/i })
			).toBeInTheDocument();
		});

		it('redirects to login after success', async () => {
			const user = userEvent.setup();
			const mockUpdatePassword = vi.mocked(updatePassword);
			mockUpdatePassword.mockResolvedValue({
				success: true,
				data: { success: true },
			});

			render(<ResetPasswordForm />);

			await user.type(getPasswordInput(), 'newpassword123');
			await user.type(getConfirmPasswordInput(), 'newpassword123');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockPush).toHaveBeenCalledWith('/login');
			});
		});

		it('submits form on Enter key', async () => {
			const user = userEvent.setup();
			const mockUpdatePassword = vi.mocked(updatePassword);
			mockUpdatePassword.mockResolvedValue({
				success: true,
				data: { success: true },
			});

			render(<ResetPasswordForm />);

			await user.type(getPasswordInput(), 'newpassword123');
			await user.type(getConfirmPasswordInput(), 'newpassword123');
			await user.keyboard('{Enter}');

			await waitFor(() => {
				expect(mockUpdatePassword).toHaveBeenCalled();
			});
		});
	});

	describe('Error handling', () => {
		it('shows server error in alert', async () => {
			const user = userEvent.setup();
			const mockUpdatePassword = vi.mocked(updatePassword);
			mockUpdatePassword.mockResolvedValue({
				success: false,
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Password too weak',
				},
			});

			render(<ResetPasswordForm />);

			await user.type(getPasswordInput(), 'newpassword123');
			await user.type(getConfirmPasswordInput(), 'newpassword123');
			await user.click(getSubmitButton());

			expect(await screen.findByText(/password too weak/i)).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('supports keyboard navigation', async () => {
			const user = userEvent.setup();
			render(<ResetPasswordForm />);

			const passwordInput = getPasswordInput();
			await user.click(passwordInput);
			expect(passwordInput).toHaveFocus();

			await user.tab();
			// Should focus on password visibility toggle first, then confirm password
			await user.tab();
			expect(getConfirmPasswordInput()).toHaveFocus();
		});

		it('has password visibility toggles', () => {
			render(<ResetPasswordForm />);

			const toggleButtons = screen.getAllByRole('button', {
				name: /show password/i,
			});
			expect(toggleButtons.length).toBe(2);
		});
	});
});
