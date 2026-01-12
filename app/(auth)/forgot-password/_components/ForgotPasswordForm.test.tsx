import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { resetPassword } from '@/services/auth/actions';

import { ForgotPasswordForm } from './ForgotPasswordForm';

vi.mock('@/services/auth/actions', () => ({
	resetPassword: vi.fn(),
}));

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
		refresh: vi.fn(),
	}),
}));

vi.mock('@/services/shared/errors', () => ({
	ErrorCodes: {
		SESSION_EXPIRED: 'SESSION_EXPIRED',
		VALIDATION_ERROR: 'VALIDATION_ERROR',
		FORBIDDEN: 'FORBIDDEN',
	},
}));

const getEmailInput = () => screen.getByLabelText('Email');
const getSubmitButton = () =>
	screen.getByRole('button', { name: /send reset link/i });

describe('ForgotPasswordForm', () => {
	describe('Rendering', () => {
		it('renders email input and submit button', () => {
			render(<ForgotPasswordForm />);

			expect(getEmailInput()).toBeInTheDocument();
			expect(getSubmitButton()).toBeInTheDocument();
		});

		it('renders with empty email by default', () => {
			render(<ForgotPasswordForm />);

			expect(getEmailInput()).toHaveValue('');
		});

		it('renders back to login link', () => {
			render(<ForgotPasswordForm />);

			expect(
				screen.getByRole('link', { name: /back to login/i })
			).toBeInTheDocument();
		});
	});

	describe('Validation', () => {
		it('does not submit with invalid email', async () => {
			const user = userEvent.setup();
			const mockResetPassword = vi.mocked(resetPassword);
			render(<ForgotPasswordForm />);

			await user.type(getEmailInput(), 'invalid');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockResetPassword).not.toHaveBeenCalled();
			});
		});

		it('does not submit with empty email', async () => {
			const user = userEvent.setup();
			const mockResetPassword = vi.mocked(resetPassword);
			render(<ForgotPasswordForm />);

			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockResetPassword).not.toHaveBeenCalled();
			});
		});
	});

	describe('Interactions', () => {
		it('submits form with valid email', async () => {
			const user = userEvent.setup();
			const mockResetPassword = vi.mocked(resetPassword);
			mockResetPassword.mockResolvedValue({
				success: true,
				data: { success: true },
			});

			render(<ForgotPasswordForm />);

			await user.type(getEmailInput(), 'test@example.com');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockResetPassword).toHaveBeenCalledWith({
					email: 'test@example.com',
				});
			});
		});

		it('shows success message after submission', async () => {
			const user = userEvent.setup();
			const mockResetPassword = vi.mocked(resetPassword);
			mockResetPassword.mockResolvedValue({
				success: true,
				data: { success: true },
			});

			render(<ForgotPasswordForm />);

			await user.type(getEmailInput(), 'test@example.com');
			await user.click(getSubmitButton());

			expect(await screen.findByText(/check your email/i)).toBeInTheDocument();
		});

		it('disables form during submission', async () => {
			const user = userEvent.setup();
			const mockResetPassword = vi.mocked(resetPassword);
			mockResetPassword.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() => resolve({ success: true, data: { success: true } }),
							100
						)
					)
			);

			render(<ForgotPasswordForm />);

			await user.type(getEmailInput(), 'test@example.com');
			await user.click(getSubmitButton());

			expect(getEmailInput()).toBeDisabled();
		});

		it('shows loading state during submission', async () => {
			const user = userEvent.setup();
			const mockResetPassword = vi.mocked(resetPassword);
			mockResetPassword.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() => resolve({ success: true, data: { success: true } }),
							100
						)
					)
			);

			render(<ForgotPasswordForm />);

			await user.type(getEmailInput(), 'test@example.com');
			await user.click(getSubmitButton());

			expect(
				screen.getByRole('button', { name: /sending/i })
			).toBeInTheDocument();
		});

		it('submits form on Enter key', async () => {
			const user = userEvent.setup();
			const mockResetPassword = vi.mocked(resetPassword);
			mockResetPassword.mockResolvedValue({
				success: true,
				data: { success: true },
			});

			render(<ForgotPasswordForm />);

			await user.type(getEmailInput(), 'test@example.com');
			await user.keyboard('{Enter}');

			await waitFor(() => {
				expect(mockResetPassword).toHaveBeenCalled();
			});
		});
	});

	describe('Error handling', () => {
		it('shows error for expired token from URL', () => {
			render(<ForgotPasswordForm initialError="SESSION_EXPIRED" />);

			expect(
				screen.getByText(/password reset link has expired/i)
			).toBeInTheDocument();
		});

		it('shows error for validation error from URL', () => {
			render(<ForgotPasswordForm initialError="VALIDATION_ERROR" />);

			expect(screen.getByText(/invalid request/i)).toBeInTheDocument();
		});

		it('shows rate limit error', async () => {
			const user = userEvent.setup();
			const mockResetPassword = vi.mocked(resetPassword);
			mockResetPassword.mockResolvedValue({
				success: false,
				error: {
					code: 'FORBIDDEN',
					message: 'Too many requests',
				},
			});

			render(<ForgotPasswordForm />);

			await user.type(getEmailInput(), 'test@example.com');
			await user.click(getSubmitButton());

			expect(await screen.findByText(/too many requests/i)).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('supports keyboard navigation', async () => {
			const user = userEvent.setup();
			render(<ForgotPasswordForm />);

			const emailInput = getEmailInput();
			await user.click(emailInput);
			expect(emailInput).toHaveFocus();

			await user.tab();
			expect(getSubmitButton()).toHaveFocus();
		});
	});
});
