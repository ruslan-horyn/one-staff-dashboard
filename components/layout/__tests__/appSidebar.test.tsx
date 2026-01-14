import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { SidebarProvider } from '@/components/ui/sidebar';
import { signOut } from '@/services/auth/actions';
import { AppSidebar } from '../appSidebar';

vi.mock('@/services/auth/actions', () => ({
	signOut: vi.fn(),
}));

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
	usePathname: () => '/',
	useRouter: () => ({
		push: mockPush,
	}),
}));

// Mock the useIsMobile hook
vi.mock('@/hooks/useIsMobile', () => ({
	useIsMobile: () => false,
}));

const defaultUser = {
	firstName: 'John',
	lastName: 'Doe',
	email: 'john@example.com',
	role: 'admin' as const,
	organizationName: 'Test Organization',
};

// Helper to render with SidebarProvider context
const renderWithProvider = (ui: React.ReactElement) => {
	return render(<SidebarProvider>{ui}</SidebarProvider>);
};

describe('AppSidebar', () => {
	describe('Rendering', () => {
		it('renders organization name in header', () => {
			renderWithProvider(<AppSidebar user={defaultUser} />);

			expect(screen.getByText('Test Organization')).toBeInTheDocument();
		});

		it('renders main navigation items', () => {
			renderWithProvider(<AppSidebar user={defaultUser} />);

			expect(screen.getByRole('link', { name: /board/i })).toBeInTheDocument();
			expect(
				screen.getByRole('link', { name: /workers/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('link', { name: /reports/i })
			).toBeInTheDocument();
		});

		it('renders admin navigation items for admin role', () => {
			renderWithProvider(<AppSidebar user={defaultUser} />);

			expect(
				screen.getByRole('link', { name: /clients/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('link', { name: /locations/i })
			).toBeInTheDocument();
			expect(screen.getByRole('link', { name: /users/i })).toBeInTheDocument();
		});

		it('does not render admin items for coordinator role', () => {
			const coordinatorUser = {
				...defaultUser,
				role: 'coordinator' as const,
			};
			renderWithProvider(<AppSidebar user={coordinatorUser} />);

			expect(
				screen.queryByRole('link', { name: /clients/i })
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole('link', { name: /locations/i })
			).not.toBeInTheDocument();
			expect(
				screen.queryByRole('link', { name: /users/i })
			).not.toBeInTheDocument();
		});

		it('renders user info in footer', () => {
			renderWithProvider(<AppSidebar user={defaultUser} />);

			expect(screen.getByText('John Doe')).toBeInTheDocument();
			expect(screen.getByText('john@example.com')).toBeInTheDocument();
		});

		it('renders avatar with initials', () => {
			renderWithProvider(<AppSidebar user={defaultUser} />);

			expect(screen.getAllByText('JD')[0]).toBeInTheDocument();
		});
	});

	describe('Navigation', () => {
		it('has correct href for Board link', () => {
			renderWithProvider(<AppSidebar user={defaultUser} />);

			const boardLink = screen.getByRole('link', { name: /board/i });
			expect(boardLink).toHaveAttribute('href', '/');
		});

		it('has correct href for Workers link', () => {
			renderWithProvider(<AppSidebar user={defaultUser} />);

			const workersLink = screen.getByRole('link', { name: /workers/i });
			expect(workersLink).toHaveAttribute('href', '/workers');
		});

		it('has correct href for Reports link', () => {
			renderWithProvider(<AppSidebar user={defaultUser} />);

			const reportsLink = screen.getByRole('link', { name: /reports/i });
			expect(reportsLink).toHaveAttribute('href', '/reports');
		});

		it('marks current route as active', () => {
			renderWithProvider(<AppSidebar user={defaultUser} />);

			// Board should be active since pathname is '/'
			const boardLink = screen.getByRole('link', { name: /board/i });
			expect(boardLink).toHaveAttribute('aria-current', 'page');
		});
	});

	describe('User dropdown', () => {
		it('opens user dropdown on click', async () => {
			const user = userEvent.setup();
			renderWithProvider(<AppSidebar user={defaultUser} />);

			// Find and click the footer user button
			const userButtons = screen.getAllByText('John Doe');
			const footerUserButton = userButtons[0].closest('button');
			await user.click(footerUserButton!);

			// Should show Profile and Sign out options
			expect(screen.getByText('Profile')).toBeInTheDocument();
			expect(screen.getByText('Sign out')).toBeInTheDocument();
		});

		it('shows Profile link in dropdown', async () => {
			const user = userEvent.setup();
			renderWithProvider(<AppSidebar user={defaultUser} />);

			const userButtons = screen.getAllByText('John Doe');
			const footerUserButton = userButtons[0].closest('button');
			await user.click(footerUserButton!);

			const profileLink = screen.getByRole('menuitem', { name: /profile/i });
			expect(profileLink).toBeInTheDocument();
		});

		it('calls signOut on sign out click', async () => {
			const user = userEvent.setup();
			const mockSignOut = vi.mocked(signOut);
			mockSignOut.mockResolvedValue({ success: true, data: { success: true } });

			renderWithProvider(<AppSidebar user={defaultUser} />);

			const userButtons = screen.getAllByText('John Doe');
			const footerUserButton = userButtons[0].closest('button');
			await user.click(footerUserButton!);

			const signOutButton = screen.getByRole('menuitem', { name: /sign out/i });
			await user.click(signOutButton);

			await waitFor(() => {
				expect(mockSignOut).toHaveBeenCalled();
				expect(mockPush).toHaveBeenCalledWith('/login');
			});
		});
	});

	describe('Accessibility', () => {
		it('has navigation landmarks', () => {
			renderWithProvider(<AppSidebar user={defaultUser} />);

			// Main navigation
			const mainNav = screen.getByRole('navigation', {
				name: /main navigation/i,
			});
			expect(mainNav).toBeInTheDocument();
		});

		it('has admin navigation landmark for admin users', () => {
			renderWithProvider(<AppSidebar user={defaultUser} />);

			const adminNav = screen.getByRole('navigation', {
				name: /admin navigation/i,
			});
			expect(adminNav).toBeInTheDocument();
		});
	});
});
