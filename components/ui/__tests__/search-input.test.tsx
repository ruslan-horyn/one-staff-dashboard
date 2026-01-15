import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { SearchInput } from '../search-input';

// Mock next/navigation
vi.mock('next/navigation', () => ({
	useRouter: () => ({
		replace: vi.fn(),
	}),
	usePathname: () => '/test',
	useSearchParams: () => new URLSearchParams(),
}));

describe('SearchInput', () => {
	describe('Rendering', () => {
		it('renders input element', () => {
			render(<SearchInput />);

			expect(screen.getByRole('searchbox')).toBeInTheDocument();
		});

		it('renders with default placeholder', () => {
			render(<SearchInput />);

			expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
		});

		it('renders with custom placeholder', () => {
			render(<SearchInput placeholder="Search workers..." />);

			expect(
				screen.getByPlaceholderText('Search workers...')
			).toBeInTheDocument();
		});

		it('has type="search" attribute', () => {
			render(<SearchInput />);

			expect(screen.getByRole('searchbox')).toHaveAttribute('type', 'search');
		});

		it('renders search icon', () => {
			const { container } = render(<SearchInput />);

			// Search icon should be present (lucide-react renders as svg)
			expect(container.querySelector('svg')).toBeInTheDocument();
		});
	});

	describe('Input behavior', () => {
		it('updates value when typing', async () => {
			const user = userEvent.setup();
			render(<SearchInput debounceMs={0} />);

			const input = screen.getByRole('searchbox');
			await user.type(input, 'test');

			expect(input).toHaveValue('test');
		});
	});

	describe('Clear button', () => {
		it('does not show clear button when empty', () => {
			render(<SearchInput debounceMs={0} />);

			expect(
				screen.queryByRole('button', { name: /clear/i })
			).not.toBeInTheDocument();
		});

		it('shows clear button when has value', async () => {
			const user = userEvent.setup();
			render(<SearchInput debounceMs={0} />);

			const input = screen.getByRole('searchbox');
			await user.type(input, 'test');

			expect(
				screen.getByRole('button', { name: /clear/i })
			).toBeInTheDocument();
		});

		it('clears value when clear button is clicked', async () => {
			const user = userEvent.setup();
			render(<SearchInput debounceMs={0} />);

			const input = screen.getByRole('searchbox');
			await user.type(input, 'test');

			const clearButton = screen.getByRole('button', { name: /clear/i });
			await user.click(clearButton);

			expect(input).toHaveValue('');
		});
	});

	describe('Loading state', () => {
		it('shows loading spinner when isLoading is true', () => {
			render(<SearchInput isLoading />);

			// Loader2 icon should be visible
			const spinner = document.querySelector('.animate-spin');
			expect(spinner).toBeInTheDocument();
		});

		it('hides clear button when loading', async () => {
			const user = userEvent.setup();
			render(<SearchInput isLoading debounceMs={0} />);

			const input = screen.getByRole('searchbox');
			await user.type(input, 'test');

			// Clear button should not be visible during loading
			expect(
				screen.queryByRole('button', { name: /clear/i })
			).not.toBeInTheDocument();
		});

		it('sets aria-busy when loading', () => {
			render(<SearchInput isLoading />);

			expect(screen.getByRole('searchbox')).toHaveAttribute(
				'aria-busy',
				'true'
			);
		});
	});

	describe('Accessibility', () => {
		it('has searchbox role', () => {
			render(<SearchInput />);

			expect(screen.getByRole('searchbox')).toBeInTheDocument();
		});

		it('clear button has accessible label', async () => {
			const user = userEvent.setup();
			render(<SearchInput debounceMs={0} />);

			const input = screen.getByRole('searchbox');
			await user.type(input, 'test');

			expect(
				screen.getByRole('button', { name: 'Clear search' })
			).toBeInTheDocument();
		});
	});

	describe('Custom className', () => {
		it('applies custom className to wrapper', () => {
			const { container } = render(<SearchInput className="custom-class" />);

			expect(container.firstChild).toHaveClass('custom-class');
		});
	});
});
