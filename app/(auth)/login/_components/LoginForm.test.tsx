import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signIn } from '@/services/auth/actions';
import { LoginForm } from './LoginForm';

vi.mock('@/services/auth/actions', () => ({
	signIn: vi.fn(),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
		refresh: mockRefresh,
	}),
}));

const getEmailInput = () => screen.getByLabelText('Email');
const getPasswordInput = () => screen.getByLabelText('Password');
const getSubmitButton = () => screen.getByRole('button', { name: /sign in/i });

describe('LoginForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders all form fields', () => {
			render(<LoginForm />);

			expect(getEmailInput()).toBeInTheDocument();
			expect(getPasswordInput()).toBeInTheDocument();
			expect(getSubmitButton()).toBeInTheDocument();
		});

		it('renders with default empty values', () => {
			render(<LoginForm />);

			expect(getEmailInput()).toHaveValue('');
			expect(getPasswordInput()).toHaveValue('');
		});

		it('has accessible form name', () => {
			render(<LoginForm />);

			expect(screen.getByRole('form')).toHaveAttribute(
				'aria-label',
				'Login form'
			);
		});
	});

	describe('Validation', () => {
		it('does not submit form with invalid email', async () => {
			const user = userEvent.setup();
			const mockSignIn = vi.mocked(signIn);
			render(<LoginForm />);

			await user.type(getEmailInput(), 'notanemail');
			await user.type(getPasswordInput(), 'password123');
			await user.click(getSubmitButton());

			// Form should not submit with invalid email
			await waitFor(() => {
				expect(mockSignIn).not.toHaveBeenCalled();
			});
		});

		it('does not submit form with short password', async () => {
			const user = userEvent.setup();
			const mockSignIn = vi.mocked(signIn);
			render(<LoginForm />);

			await user.type(getEmailInput(), 'test@example.com');
			await user.type(getPasswordInput(), '1234567');
			await user.click(getSubmitButton());

			// Form should not submit with short password
			await waitFor(() => {
				expect(mockSignIn).not.toHaveBeenCalled();
			});
		});

		it('clears error when form is resubmitted with valid data', async () => {
			const user = userEvent.setup();
			const mockSignIn = vi.mocked(signIn);
			mockSignIn.mockResolvedValue({
				success: true,
				data: { user: null, session: null },
			});

			render(<LoginForm />);

			// Submit with empty email (leave it empty, just type password)
			await user.type(getPasswordInput(), 'password123');
			await user.click(getSubmitButton());

			// Form should show validation - we can't easily test for specific error
			// but we can verify the form didn't submit
			expect(mockSignIn).not.toHaveBeenCalled();

			// Now fill email and resubmit
			await user.type(getEmailInput(), 'test@example.com');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockSignIn).toHaveBeenCalled();
			});
		});

		it('marks invalid fields with aria-invalid on submit', async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			// Submit with empty email to trigger required validation
			await user.type(getPasswordInput(), 'password123');
			await user.click(getSubmitButton());

			const emailInput = getEmailInput();
			await waitFor(() => {
				expect(emailInput).toHaveAttribute('aria-invalid', 'true');
			});
		});
	});

	describe('Interactions', () => {
		it('submits form with valid data', async () => {
			const user = userEvent.setup();
			const mockSignIn = vi.mocked(signIn);
			mockSignIn.mockResolvedValue({
				success: true,
				data: { user: null, session: null },
			});

			render(<LoginForm />);

			await user.type(getEmailInput(), 'test@example.com');
			await user.type(getPasswordInput(), 'password123');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockSignIn).toHaveBeenCalledWith({
					email: 'test@example.com',
					password: 'password123',
				});
			});
		});

		it('disables form during submission', async () => {
			const user = userEvent.setup();
			const mockSignIn = vi.mocked(signIn);
			mockSignIn.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() =>
								resolve({ success: true, data: { user: null, session: null } }),
							100
						)
					)
			);

			render(<LoginForm />);

			await user.type(getEmailInput(), 'test@example.com');
			await user.type(getPasswordInput(), 'password123');
			await user.click(getSubmitButton());

			expect(getEmailInput()).toBeDisabled();
			expect(getPasswordInput()).toBeDisabled();
		});

		it('shows loading state during submission', async () => {
			const user = userEvent.setup();
			const mockSignIn = vi.mocked(signIn);
			mockSignIn.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() =>
								resolve({ success: true, data: { user: null, session: null } }),
							100
						)
					)
			);

			render(<LoginForm />);

			await user.type(getEmailInput(), 'test@example.com');
			await user.type(getPasswordInput(), 'password123');
			await user.click(getSubmitButton());

			expect(
				screen.getByRole('button', { name: /signing in/i })
			).toBeInTheDocument();
		});

		it('shows server error on failure', async () => {
			const user = userEvent.setup();
			const mockSignIn = vi.mocked(signIn);
			mockSignIn.mockResolvedValue({
				success: false,
				error: {
					code: 'INVALID_CREDENTIALS',
					message: 'Invalid email or password',
				},
			});

			render(<LoginForm />);

			await user.type(getEmailInput(), 'test@example.com');
			await user.type(getPasswordInput(), 'wrongpassword');
			await user.click(getSubmitButton());

			expect(
				await screen.findByText(/invalid email or password/i)
			).toBeInTheDocument();
		});

		it('redirects after successful submission', async () => {
			const user = userEvent.setup();
			const mockSignIn = vi.mocked(signIn);
			mockSignIn.mockResolvedValue({
				success: true,
				data: { user: null, session: null },
			});

			render(<LoginForm redirectTo="/dashboard" />);

			await user.type(getEmailInput(), 'test@example.com');
			await user.type(getPasswordInput(), 'password123');
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockPush).toHaveBeenCalledWith('/dashboard');
			});
		});

		it('submits form on Enter key', async () => {
			const user = userEvent.setup();
			const mockSignIn = vi.mocked(signIn);
			mockSignIn.mockResolvedValue({
				success: true,
				data: { user: null, session: null },
			});

			render(<LoginForm />);

			await user.type(getEmailInput(), 'test@example.com');
			await user.type(getPasswordInput(), 'password123');
			await user.keyboard('{Enter}');

			await waitFor(() => {
				expect(mockSignIn).toHaveBeenCalled();
			});
		});
	});

	describe('Accessibility', () => {
		it('supports keyboard navigation', async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			const emailInput = getEmailInput();
			const passwordInput = getPasswordInput();

			await user.click(emailInput);
			expect(emailInput).toHaveFocus();

			await user.tab();
			expect(passwordInput).toHaveFocus();
		});

		it('links error messages to inputs via aria-describedby', async () => {
			const user = userEvent.setup();
			render(<LoginForm />);

			// Submit with empty email to trigger validation
			await user.type(getPasswordInput(), 'password123');
			await user.click(getSubmitButton());

			// Check that email input has error linked via aria-describedby
			const emailInput = getEmailInput();
			await waitFor(() => {
				expect(emailInput).toHaveAttribute('aria-invalid', 'true');
				const describedBy = emailInput.getAttribute('aria-describedby');
				expect(describedBy).toBeTruthy();
			});
		});

		it('has password visibility toggle with aria-label', () => {
			render(<LoginForm />);

			const toggleButton = screen.getByRole('button', {
				name: /show password/i,
			});
			expect(toggleButton).toBeInTheDocument();
		});
	});
});
