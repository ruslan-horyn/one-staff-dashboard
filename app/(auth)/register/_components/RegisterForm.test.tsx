import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { signUp } from '@/services/auth/actions';

import { RegisterForm } from './RegisterForm';

vi.mock('@/services/auth/actions', () => ({
	signUp: vi.fn(),
}));

const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
		refresh: mockRefresh,
	}),
}));

const getOrganizationInput = () => screen.getByLabelText('Organization name');
const getFirstNameInput = () => screen.getByLabelText('First name');
const getLastNameInput = () => screen.getByLabelText('Last name');
const getEmailInput = () => screen.getByLabelText('Email');
const getPasswordInput = () => screen.getByLabelText('Password');
const getConfirmPasswordInput = () => screen.getByLabelText('Confirm password');
const getSubmitButton = () =>
	screen.getByRole('button', { name: /create account/i });

const fillValidForm = async (user: ReturnType<typeof userEvent.setup>) => {
	await user.type(getOrganizationInput(), 'My Company');
	await user.type(getFirstNameInput(), 'John');
	await user.type(getLastNameInput(), 'Doe');
	await user.type(getEmailInput(), 'john@example.com');
	await user.type(getPasswordInput(), 'password123');
	await user.type(getConfirmPasswordInput(), 'password123');
};

describe('RegisterForm', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Rendering', () => {
		it('renders all form fields', () => {
			render(<RegisterForm />);

			expect(getOrganizationInput()).toBeInTheDocument();
			expect(getFirstNameInput()).toBeInTheDocument();
			expect(getLastNameInput()).toBeInTheDocument();
			expect(getEmailInput()).toBeInTheDocument();
			expect(getPasswordInput()).toBeInTheDocument();
			expect(getConfirmPasswordInput()).toBeInTheDocument();
			expect(getSubmitButton()).toBeInTheDocument();
		});

		it('renders with default empty values', () => {
			render(<RegisterForm />);

			expect(getOrganizationInput()).toHaveValue('');
			expect(getFirstNameInput()).toHaveValue('');
			expect(getLastNameInput()).toHaveValue('');
			expect(getEmailInput()).toHaveValue('');
			expect(getPasswordInput()).toHaveValue('');
			expect(getConfirmPasswordInput()).toHaveValue('');
		});

		it('has accessible form name', () => {
			render(<RegisterForm />);

			expect(screen.getByRole('form')).toHaveAttribute(
				'aria-label',
				'Registration form'
			);
		});

		it('renders sign in link', () => {
			render(<RegisterForm />);

			const link = screen.getByRole('link', { name: /sign in/i });
			expect(link).toBeInTheDocument();
			expect(link).toHaveAttribute('href', '/login');
		});
	});

	describe('Validation', () => {
		it('shows error for empty organization name', async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const organizationInput = getOrganizationInput();
			await user.click(organizationInput);
			await user.tab();

			expect(
				await screen.findByText(/organization name is required/i)
			).toBeInTheDocument();
		});

		it('shows error for empty first name', async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const firstNameInput = getFirstNameInput();
			await user.click(firstNameInput);
			await user.tab();

			expect(
				await screen.findByText(/first name is required/i)
			).toBeInTheDocument();
		});

		it('shows error for empty last name', async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const lastNameInput = getLastNameInput();
			await user.click(lastNameInput);
			await user.tab();

			expect(
				await screen.findByText(/last name is required/i)
			).toBeInTheDocument();
		});

		it('shows error for invalid email format', async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			await user.type(getEmailInput(), 'invalid-email');
			await user.tab();

			expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
		});

		it('shows error for short password', async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			await user.type(getPasswordInput(), '1234567');
			await user.tab();

			expect(
				await screen.findByText(/at least 8 characters/i)
			).toBeInTheDocument();
		});

		it('shows error when passwords do not match', async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			await user.type(getPasswordInput(), 'password123');
			await user.type(getConfirmPasswordInput(), 'password456');
			await user.tab();

			expect(
				await screen.findByText(/passwords don't match/i)
			).toBeInTheDocument();
		});

		it('clears error when field becomes valid on blur', async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const emailInput = getEmailInput();

			await user.type(emailInput, 'invalid');
			await user.tab();
			expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();

			await user.clear(emailInput);
			await user.type(emailInput, 'valid@example.com');
			await user.tab();

			await waitFor(() => {
				expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
			});
		});

		it('marks invalid fields with aria-invalid', async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const emailInput = getEmailInput();
			await user.type(emailInput, 'invalid');
			await user.tab();

			await waitFor(() => {
				expect(emailInput).toHaveAttribute('aria-invalid', 'true');
			});
		});
	});

	describe('Interactions', () => {
		it('submits form with valid data', async () => {
			const user = userEvent.setup();
			const mockSignUp = vi.mocked(signUp);
			mockSignUp.mockResolvedValue({
				success: true,
				data: { user: null, session: null },
			});

			render(<RegisterForm />);

			await fillValidForm(user);
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockSignUp).toHaveBeenCalledWith({
					organizationName: 'My Company',
					firstName: 'John',
					lastName: 'Doe',
					email: 'john@example.com',
					password: 'password123',
				});
			});
		});

		it('does not include confirmPassword in server call', async () => {
			const user = userEvent.setup();
			const mockSignUp = vi.mocked(signUp);
			mockSignUp.mockResolvedValue({
				success: true,
				data: { user: null, session: null },
			});

			render(<RegisterForm />);

			await fillValidForm(user);
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockSignUp).toHaveBeenCalled();
				const callArgs = mockSignUp.mock.calls[0][0];
				expect(callArgs).not.toHaveProperty('confirmPassword');
			});
		});

		it('disables form during submission', async () => {
			const user = userEvent.setup();
			const mockSignUp = vi.mocked(signUp);
			mockSignUp.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() =>
								resolve({ success: true, data: { user: null, session: null } }),
							100
						)
					)
			);

			render(<RegisterForm />);

			await fillValidForm(user);
			await user.click(getSubmitButton());

			expect(getOrganizationInput()).toBeDisabled();
			expect(getFirstNameInput()).toBeDisabled();
			expect(getLastNameInput()).toBeDisabled();
			expect(getEmailInput()).toBeDisabled();
			expect(getPasswordInput()).toBeDisabled();
			expect(getConfirmPasswordInput()).toBeDisabled();
		});

		it('shows loading state during submission', async () => {
			const user = userEvent.setup();
			const mockSignUp = vi.mocked(signUp);
			mockSignUp.mockImplementation(
				() =>
					new Promise((resolve) =>
						setTimeout(
							() =>
								resolve({ success: true, data: { user: null, session: null } }),
							100
						)
					)
			);

			render(<RegisterForm />);

			await fillValidForm(user);
			await user.click(getSubmitButton());

			expect(
				screen.getByRole('button', { name: /creating account/i })
			).toBeInTheDocument();
		});

		it('shows server error on failure', async () => {
			const user = userEvent.setup();
			const mockSignUp = vi.mocked(signUp);
			mockSignUp.mockResolvedValue({
				success: false,
				error: {
					code: 'INTERNAL_ERROR',
					message: 'Something went wrong',
				},
			});

			render(<RegisterForm />);

			await fillValidForm(user);
			await user.click(getSubmitButton());

			expect(
				await screen.findByText(/something went wrong/i)
			).toBeInTheDocument();
		});

		it('shows duplicate email error', async () => {
			const user = userEvent.setup();
			const mockSignUp = vi.mocked(signUp);
			mockSignUp.mockResolvedValue({
				success: false,
				error: {
					code: 'DUPLICATE_ENTRY',
					message: 'User already exists',
				},
			});

			render(<RegisterForm />);

			await fillValidForm(user);
			await user.click(getSubmitButton());

			expect(
				await screen.findByText(/account with this email already exists/i)
			).toBeInTheDocument();
		});

		it('redirects after successful submission', async () => {
			const user = userEvent.setup();
			const mockSignUp = vi.mocked(signUp);
			mockSignUp.mockResolvedValue({
				success: true,
				data: { user: null, session: null },
			});

			render(<RegisterForm />);

			await fillValidForm(user);
			await user.click(getSubmitButton());

			await waitFor(() => {
				expect(mockPush).toHaveBeenCalledWith('/');
			});
		});

		it('submits form on Enter key', async () => {
			const user = userEvent.setup();
			const mockSignUp = vi.mocked(signUp);
			mockSignUp.mockResolvedValue({
				success: true,
				data: { user: null, session: null },
			});

			render(<RegisterForm />);

			await fillValidForm(user);
			await user.keyboard('{Enter}');

			await waitFor(() => {
				expect(mockSignUp).toHaveBeenCalled();
			});
		});
	});

	describe('Accessibility', () => {
		it('supports keyboard navigation', async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const organizationInput = getOrganizationInput();
			const firstNameInput = getFirstNameInput();
			const lastNameInput = getLastNameInput();

			await user.click(organizationInput);
			expect(organizationInput).toHaveFocus();

			await user.tab();
			expect(firstNameInput).toHaveFocus();

			await user.tab();
			expect(lastNameInput).toHaveFocus();
		});

		it('links error messages to inputs via aria-describedby', async () => {
			const user = userEvent.setup();
			render(<RegisterForm />);

			const emailInput = getEmailInput();
			await user.type(emailInput, 'invalid');
			await user.tab();

			await waitFor(() => {
				const errorId = emailInput.getAttribute('aria-describedby');
				expect(errorId).toBeTruthy();
				expect(
					document.getElementById(errorId!.split(' ')[1])
				).toHaveTextContent(/invalid email/i);
			});
		});

		it('has password visibility toggles with aria-label', () => {
			render(<RegisterForm />);

			const toggleButtons = screen.getAllByRole('button', {
				name: /show password/i,
			});
			expect(toggleButtons).toHaveLength(2);
		});
	});
});
