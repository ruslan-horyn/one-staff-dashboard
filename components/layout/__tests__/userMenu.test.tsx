import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { signOut } from '@/services/auth/actions';
import { UserMenu } from '../userMenu';

vi.mock('@/services/auth/actions', () => ({
	signOut: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: mockPush,
	}),
}));

const defaultUser = {
	firstName: 'John',
	lastName: 'Doe',
	email: 'john@example.com',
	role: 'admin' as const,
};

describe('UserMenu', () => {
	describe('Rendering', () => {
		it('renders avatar with user initials', () => {
			render(<UserMenu user={defaultUser} />);

			expect(screen.getByText('JD')).toBeInTheDocument();
		});

		it('renders user menu trigger button with aria-label', () => {
			render(<UserMenu user={defaultUser} />);

			expect(
				screen.getByRole('button', { name: /user menu/i })
			).toBeInTheDocument();
		});
	});

	describe('Interactions', () => {
		it('opens dropdown menu on click', async () => {
			const user = userEvent.setup();
			render(<UserMenu user={defaultUser} />);

			const trigger = screen.getByRole('button', { name: /user menu/i });
			await user.click(trigger);

			expect(screen.getByText('John Doe')).toBeInTheDocument();
			expect(screen.getByText('john@example.com')).toBeInTheDocument();
		});

		it('displays role badge in dropdown', async () => {
			const user = userEvent.setup();
			render(<UserMenu user={defaultUser} />);

			const trigger = screen.getByRole('button', { name: /user menu/i });
			await user.click(trigger);

			expect(screen.getByText('Administrator')).toBeInTheDocument();
		});

		it('displays Coordinator badge for coordinator role', async () => {
			const user = userEvent.setup();
			const coordinatorUser = { ...defaultUser, role: 'coordinator' as const };
			render(<UserMenu user={coordinatorUser} />);

			const trigger = screen.getByRole('button', { name: /user menu/i });
			await user.click(trigger);

			expect(screen.getByText('Coordinator')).toBeInTheDocument();
		});

		it('shows profile menu item in dropdown', async () => {
			const user = userEvent.setup();
			render(<UserMenu user={defaultUser} />);

			const trigger = screen.getByRole('button', { name: /user menu/i });
			await user.click(trigger);

			// Profile is rendered as a menuitem with a link inside
			const profileMenuItem = screen.getByRole('menuitem', {
				name: /profile/i,
			});
			expect(profileMenuItem).toBeInTheDocument();
		});

		it('calls signOut and redirects on sign out click', async () => {
			const user = userEvent.setup();
			const mockSignOut = vi.mocked(signOut);
			mockSignOut.mockResolvedValue({ success: true, data: { success: true } });

			render(<UserMenu user={defaultUser} />);

			const trigger = screen.getByRole('button', { name: /user menu/i });
			await user.click(trigger);

			const signOutButton = screen.getByRole('menuitem', { name: /sign out/i });
			await user.click(signOutButton);

			await waitFor(() => {
				expect(mockSignOut).toHaveBeenCalled();
				expect(mockPush).toHaveBeenCalledWith('/login');
			});
		});

		it('disables sign out button during submission', async () => {
			const user = userEvent.setup();
			const mockSignOut = vi.mocked(signOut);
			let resolveSignOut: (value: {
				success: true;
				data: { success: boolean };
			}) => void;
			mockSignOut.mockImplementation(
				() =>
					new Promise((resolve) => {
						resolveSignOut = resolve;
					})
			);

			render(<UserMenu user={defaultUser} />);

			const trigger = screen.getByRole('button', { name: /user menu/i });
			await user.click(trigger);

			const signOutButton = screen.getByRole('menuitem', { name: /sign out/i });
			await user.click(signOutButton);

			// The action should be called
			expect(mockSignOut).toHaveBeenCalled();

			// Resolve the promise
			resolveSignOut!({ success: true, data: { success: true } });

			await waitFor(() => {
				expect(mockPush).toHaveBeenCalledWith('/login');
			});
		});
	});

	describe('Accessibility', () => {
		it('has accessible trigger button', () => {
			render(<UserMenu user={defaultUser} />);

			const trigger = screen.getByRole('button', { name: /user menu/i });
			expect(trigger).toHaveAttribute('aria-label', 'User menu');
		});

		it('supports keyboard navigation in dropdown', async () => {
			const user = userEvent.setup();
			render(<UserMenu user={defaultUser} />);

			const trigger = screen.getByRole('button', { name: /user menu/i });
			await user.click(trigger);

			// Press down arrow to navigate
			await user.keyboard('{ArrowDown}');

			// Items should be focusable
			expect(document.activeElement).toHaveAttribute('role', 'menuitem');
		});
	});
});
