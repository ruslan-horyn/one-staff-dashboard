import { render, screen } from '@testing-library/react';
import { Home, Users } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { SidebarProvider } from '@/components/ui/sidebar';
import type { NavItem } from '../constants';
import { SidebarNav } from '../sidebarNav';

const mockPathname = vi.fn(() => '/');
vi.mock('next/navigation', () => ({
	usePathname: () => mockPathname(),
}));

vi.mock('@/hooks/useIsMobile', () => ({
	useIsMobile: () => false,
}));

const testNavItems: NavItem[] = [
	{ title: 'Home', href: '/', icon: Home },
	{ title: 'Workers', href: '/workers', icon: Users },
];

const renderWithProvider = (ui: React.ReactElement) => {
	return render(<SidebarProvider>{ui}</SidebarProvider>);
};

describe('SidebarNav', () => {
	describe('Rendering', () => {
		it('renders all nav items', () => {
			renderWithProvider(
				<SidebarNav items={testNavItems} aria-label="Test navigation" />
			);

			expect(screen.getByText('Home')).toBeInTheDocument();
			expect(screen.getByText('Workers')).toBeInTheDocument();
		});

		it('renders nav element with aria-label', () => {
			renderWithProvider(
				<SidebarNav items={testNavItems} aria-label="Main navigation" />
			);

			expect(
				screen.getByRole('navigation', { name: 'Main navigation' })
			).toBeInTheDocument();
		});

		it('renders links with correct href', () => {
			renderWithProvider(
				<SidebarNav items={testNavItems} aria-label="Test navigation" />
			);

			expect(screen.getByRole('link', { name: /home/i })).toHaveAttribute(
				'href',
				'/'
			);
			expect(screen.getByRole('link', { name: /workers/i })).toHaveAttribute(
				'href',
				'/workers'
			);
		});

		it('passes additional nav props', () => {
			renderWithProvider(
				<SidebarNav
					items={testNavItems}
					aria-label="Test navigation"
					data-testid="custom-nav"
					className="custom-class"
				/>
			);

			const nav = screen.getByTestId('custom-nav');
			expect(nav).toHaveClass('custom-class');
		});
	});

	describe('Active State', () => {
		it('marks home link as active when pathname is /', () => {
			mockPathname.mockReturnValue('/');
			renderWithProvider(
				<SidebarNav items={testNavItems} aria-label="Test navigation" />
			);

			const homeLink = screen.getByRole('link', { name: /home/i });
			expect(homeLink).toHaveAttribute('aria-current', 'page');
		});

		it('marks workers link as active when pathname starts with /workers', () => {
			mockPathname.mockReturnValue('/workers');
			renderWithProvider(
				<SidebarNav items={testNavItems} aria-label="Test navigation" />
			);

			const workersLink = screen.getByRole('link', { name: /workers/i });
			expect(workersLink).toHaveAttribute('aria-current', 'page');
		});

		it('marks workers link as active for nested routes', () => {
			mockPathname.mockReturnValue('/workers/123');
			renderWithProvider(
				<SidebarNav items={testNavItems} aria-label="Test navigation" />
			);

			const workersLink = screen.getByRole('link', { name: /workers/i });
			expect(workersLink).toHaveAttribute('aria-current', 'page');
		});

		it('does not mark home as active for other routes', () => {
			mockPathname.mockReturnValue('/workers');
			renderWithProvider(
				<SidebarNav items={testNavItems} aria-label="Test navigation" />
			);

			const homeLink = screen.getByRole('link', { name: /home/i });
			expect(homeLink).not.toHaveAttribute('aria-current');
		});

		it('does not mark any link as active for unmatched route', () => {
			mockPathname.mockReturnValue('/settings');
			renderWithProvider(
				<SidebarNav items={testNavItems} aria-label="Test navigation" />
			);

			const homeLink = screen.getByRole('link', { name: /home/i });
			const workersLink = screen.getByRole('link', { name: /workers/i });

			expect(homeLink).not.toHaveAttribute('aria-current');
			expect(workersLink).not.toHaveAttribute('aria-current');
		});
	});

	describe('Accessibility', () => {
		it('renders as nav landmark', () => {
			renderWithProvider(
				<SidebarNav items={testNavItems} aria-label="Test navigation" />
			);

			expect(screen.getByRole('navigation')).toBeInTheDocument();
		});

		it('uses aria-current for active page', () => {
			mockPathname.mockReturnValue('/');
			renderWithProvider(
				<SidebarNav items={testNavItems} aria-label="Test navigation" />
			);

			const activeLink = screen.getByRole('link', { name: /home/i });
			expect(activeLink).toHaveAttribute('aria-current', 'page');
		});
	});

	describe('Empty State', () => {
		it('renders empty nav when no items provided', () => {
			renderWithProvider(
				<SidebarNav items={[]} aria-label="Empty navigation" />
			);

			expect(
				screen.getByRole('navigation', { name: 'Empty navigation' })
			).toBeInTheDocument();
			expect(screen.queryByRole('link')).not.toBeInTheDocument();
		});
	});
});
