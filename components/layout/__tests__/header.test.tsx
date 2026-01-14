import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SidebarProvider } from '@/components/ui/sidebar';
import { Header } from '../header';

vi.mock('next/navigation', () => ({
	useRouter: () => ({
		push: vi.fn(),
	}),
}));

// Mock the useIsMobile hook
vi.mock('@/hooks/useIsMobile', () => ({
	useIsMobile: () => false,
}));

vi.mock('@/services/auth/actions', () => ({
	signOut: vi.fn(),
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

describe('Header', () => {
	describe('Rendering', () => {
		it('renders sidebar trigger button', () => {
			renderWithProvider(<Header user={defaultUser} />);

			expect(
				screen.getByRole('button', { name: /toggle sidebar/i })
			).toBeInTheDocument();
		});

		it('renders app title', () => {
			renderWithProvider(<Header user={defaultUser} />);

			expect(screen.getByText('One Staff Dashboard')).toBeInTheDocument();
		});

		it('renders organization name on desktop', () => {
			renderWithProvider(<Header user={defaultUser} />);

			expect(screen.getByText('Test Organization')).toBeInTheDocument();
		});

		it('renders user menu', () => {
			renderWithProvider(<Header user={defaultUser} />);

			expect(
				screen.getByRole('button', { name: /user menu/i })
			).toBeInTheDocument();
		});

		it('renders user avatar initials', () => {
			renderWithProvider(<Header user={defaultUser} />);

			expect(screen.getByText('JD')).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has header landmark', () => {
			renderWithProvider(<Header user={defaultUser} />);

			expect(screen.getByRole('banner')).toBeInTheDocument();
		});

		it('sidebar trigger has accessible label', () => {
			renderWithProvider(<Header user={defaultUser} />);

			const trigger = screen.getByRole('button', { name: /toggle sidebar/i });
			expect(trigger).toHaveAttribute('aria-label', 'Toggle sidebar');
		});
	});
});
