# Test Patterns

Testing patterns for UI components using Vitest + Testing Library + vitest-axe.

## Test File Structure

```tsx
// ComponentName.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { ComponentName } from './ComponentName';

// Mock server actions
vi.mock('@/services/auth/actions', () => ({
  signIn: vi.fn(),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Test categories follow...
});
```

## Form Component Tests

### Rendering Tests

```tsx
describe('Rendering', () => {
  it('renders all form fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('renders with default values', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toHaveValue('');
    expect(screen.getByLabelText(/password/i)).toHaveValue('');
  });

  it('renders with initial data when provided', () => {
    render(<LoginForm initialData={{ email: 'test@example.com' }} />);

    expect(screen.getByLabelText(/email/i)).toHaveValue('test@example.com');
  });

  it('has autofocus on first field', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toHaveFocus();
  });
});
```

### Validation Tests

```tsx
describe('Validation', () => {
  it('shows error for empty email on blur', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.click(emailInput);
    await user.tab(); // blur

    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
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

    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
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
```

### Interaction Tests

```tsx
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
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
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

    expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
  });

  it('shows server error on failure', async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.mocked(signIn);
    mockSignIn.mockResolvedValue({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    });

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
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
    const mockPush = vi.fn();
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      refresh: vi.fn(),
    } as never);

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
});
```

### Accessibility Tests

```tsx
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
    expect(screen.getByRole('button', { name: /sign in/i })).toHaveFocus();
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

  it('links error messages to inputs via aria-describedby', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    const emailInput = screen.getByLabelText(/email/i);
    await user.click(emailInput);
    await user.tab();

    await waitFor(() => {
      const errorId = emailInput.getAttribute('aria-describedby');
      expect(errorId).toBeTruthy();
      expect(document.getElementById(errorId!)).toHaveTextContent(/required/i);
    });
  });

  it('announces form as aria-label', () => {
    render(<LoginForm />);

    expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'Login form');
  });
});
```

## Password Input Tests

```tsx
describe('PasswordInput', () => {
  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<PasswordInput id="password" />);

    const input = document.querySelector('input[type="password"]');
    const toggleButton = screen.getByRole('button', { name: /show password/i });

    // Initially hidden
    expect(input).toHaveAttribute('type', 'password');

    // Click to show
    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

    // Click to hide again
    await user.click(toggleButton);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('has accessible toggle button', () => {
    render(<PasswordInput id="password" />);

    const toggleButton = screen.getByRole('button', { name: /show password/i });
    expect(toggleButton).toHaveAttribute('aria-label');
  });
});
```

## Table Component Tests

```tsx
describe('DataTable', () => {
  const mockData = [
    { id: '1', name: 'Item A' },
    { id: '2', name: 'Item B' },
    { id: '3', name: 'Item C' },
  ];

  it('renders all rows', () => {
    render(<DataTable data={mockData} />);

    expect(screen.getByText('Item A')).toBeInTheDocument();
    expect(screen.getByText('Item B')).toBeInTheDocument();
    expect(screen.getByText('Item C')).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(<DataTable data={[]} />);

    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('sorts by column when header clicked', async () => {
    const user = userEvent.setup();
    render(<DataTable data={mockData} />);

    await user.click(screen.getByText('Name'));

    const rows = screen.getAllByRole('row');
    // First row is header, so data starts at index 1
    expect(rows[1]).toHaveTextContent('Item A');
  });

  it('calls onRowClick when row clicked', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<DataTable data={mockData} onRowClick={onRowClick} />);

    await user.click(screen.getByText('Item A'));

    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });

  it('supports keyboard row selection', async () => {
    const user = userEvent.setup();
    const onRowClick = vi.fn();
    render(<DataTable data={mockData} onRowClick={onRowClick} />);

    const firstRow = screen.getByText('Item A').closest('tr');
    firstRow?.focus();
    await user.keyboard('{Enter}');

    expect(onRowClick).toHaveBeenCalledWith(mockData[0]);
  });
});
```

## Test Setup File

```tsx
// vitest.setup.ts
import '@testing-library/jest-dom/vitest';
import 'vitest-axe/extend-expect';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
```

## Vitest Config for Component Tests

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

## Required Dependencies

```bash
pnpm add -D vitest @testing-library/react @testing-library/user-event vitest-axe jsdom @vitejs/plugin-react
```
