// Example: app/(auth)/login/_components/LoginForm.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { LoginForm } from './LoginForm';
import { signIn } from '@/services/auth/actions';

// Mock server actions
vi.mock('@/services/auth/actions', () => ({
  signIn: vi.fn(),
}));

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // RENDERING TESTS
  // ============================================
  describe('Rendering', () => {
    it('renders all form fields', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /sign in/i })
      ).toBeInTheDocument();
    });

    it('renders with default empty values', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText(/email/i)).toHaveValue('');
      expect(screen.getByLabelText(/password/i)).toHaveValue('');
    });

    it('has autofocus on email field', () => {
      render(<LoginForm />);

      expect(screen.getByLabelText(/email/i)).toHaveFocus();
    });

    it('has accessible form name', () => {
      render(<LoginForm />);

      expect(screen.getByRole('form')).toHaveAttribute(
        'aria-label',
        'Login form'
      );
    });
  });

  // ============================================
  // VALIDATION TESTS
  // ============================================
  describe('Validation', () => {
    it('shows error for empty email on blur', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.click(emailInput);
      await user.tab();

      expect(
        await screen.findByText(/email is required/i)
      ).toBeInTheDocument();
    });

    it('shows error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.tab();

      expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();
    });

    it('shows error for short password', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      await user.type(screen.getByLabelText(/password/i), '1234567');
      await user.tab();

      expect(
        await screen.findByText(/at least 8 characters/i)
      ).toBeInTheDocument();
    });

    it('clears error when field becomes valid', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);

      // Trigger error
      await user.type(emailInput, 'invalid');
      await user.tab();
      expect(await screen.findByText(/invalid email/i)).toBeInTheDocument();

      // Fix and verify error clears
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');

      await waitFor(() => {
        expect(screen.queryByText(/invalid email/i)).not.toBeInTheDocument();
      });
    });

    it('marks invalid fields with aria-invalid', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  // ============================================
  // INTERACTION TESTS
  // ============================================
  describe('Interactions', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.mocked(signIn);
      mockSignIn.mockResolvedValue({ success: true, data: {} });

      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

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
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(screen.getByLabelText(/email/i)).toBeDisabled();
      expect(screen.getByLabelText(/password/i)).toBeDisabled();
      expect(
        screen.getByRole('button', { name: /signing in/i })
      ).toBeDisabled();
    });

    it('shows loading state during submission', async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.mocked(signIn);
      mockSignIn.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

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

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      expect(
        await screen.findByText(/invalid email or password/i)
      ).toBeInTheDocument();
    });

    it('calls onSuccess callback on successful submission', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      const mockSignIn = vi.mocked(signIn);
      mockSignIn.mockResolvedValue({ success: true, data: {} });

      render(<LoginForm onSuccess={onSuccess} />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('redirects after successful submission', async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.mocked(signIn);
      mockSignIn.mockResolvedValue({ success: true, data: {} });

      render(<LoginForm redirectTo="/dashboard" />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('submits form on Enter key', async () => {
      const user = userEvent.setup();
      const mockSignIn = vi.mocked(signIn);
      mockSignIn.mockResolvedValue({ success: true, data: {} });

      render(<LoginForm />);

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.keyboard('{Enter}');

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalled();
      });
    });
  });

  // ============================================
  // ACCESSIBILITY TESTS
  // ============================================
  describe('Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<LoginForm />);
      const results = await axe(container);
      expect(results.violations).toEqual([]);
    });

    it('has no violations with errors displayed', async () => {
      const user = userEvent.setup();
      const { container } = render(<LoginForm />);

      // Trigger validation errors
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      await screen.findByText(/email is required/i);

      const results = await axe(container);
      expect(results.violations).toEqual([]);
    });

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      // Tab through form
      await user.tab();
      expect(screen.getByLabelText(/email/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/password/i)).toHaveFocus();

      await user.tab();
      // Toggle password button
      await user.tab();
      expect(screen.getByRole('button', { name: /sign in/i })).toHaveFocus();
    });

    it('links error messages to inputs via aria-describedby', async () => {
      const user = userEvent.setup();
      render(<LoginForm />);

      const emailInput = screen.getByLabelText(/email/i);
      await user.click(emailInput);
      await user.tab();

      await waitFor(() => {
        const errorId = emailInput.getAttribute('aria-describedby');
        expect(errorId).toBeTruthy();
        expect(document.getElementById(errorId!)).toHaveTextContent(
          /required/i
        );
      });
    });
  });
});
