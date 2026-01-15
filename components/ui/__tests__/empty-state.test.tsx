import { render, screen } from '@testing-library/react';
import { AlertCircle } from 'lucide-react';
import { describe, expect, it } from 'vitest';

import { EmptyState } from '../empty-state';

describe('EmptyState', () => {
	describe('Rendering', () => {
		it('renders title', () => {
			render(<EmptyState title="No data found" />);

			expect(screen.getByText('No data found')).toBeInTheDocument();
		});

		it('renders description when provided', () => {
			render(
				<EmptyState
					title="No data found"
					description="Try adjusting your search"
				/>
			);

			expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
		});

		it('does not render description when not provided', () => {
			render(<EmptyState title="No data found" />);

			const description = document.querySelector(
				'[data-slot="empty-state-description"]'
			);
			expect(description).not.toBeInTheDocument();
		});

		it('renders icon when provided', () => {
			render(
				<EmptyState
					title="No data found"
					icon={<AlertCircle data-testid="test-icon" />}
				/>
			);

			expect(screen.getByTestId('test-icon')).toBeInTheDocument();
		});

		it('does not render icon wrapper when not provided', () => {
			render(<EmptyState title="No data found" />);

			const iconWrapper = document.querySelector(
				'[data-slot="empty-state-icon"]'
			);
			expect(iconWrapper).not.toBeInTheDocument();
		});

		it('renders action when provided', () => {
			render(
				<EmptyState
					title="No data found"
					action={<button type="button">Add Item</button>}
				/>
			);

			expect(
				screen.getByRole('button', { name: 'Add Item' })
			).toBeInTheDocument();
		});

		it('does not render action wrapper when not provided', () => {
			render(<EmptyState title="No data found" />);

			const actionWrapper = document.querySelector(
				'[data-slot="empty-state-action"]'
			);
			expect(actionWrapper).not.toBeInTheDocument();
		});

		it('applies custom className', () => {
			const { container } = render(
				<EmptyState title="No data found" className="custom-class" />
			);

			expect(container.querySelector('[data-slot="empty-state"]')).toHaveClass(
				'custom-class'
			);
		});
	});

	describe('Full configuration', () => {
		it('renders all props together', () => {
			render(
				<EmptyState
					icon={<AlertCircle data-testid="test-icon" />}
					title="No workers yet"
					description="Get started by adding your first worker"
					action={<button type="button">Add Worker</button>}
				/>
			);

			expect(screen.getByTestId('test-icon')).toBeInTheDocument();
			expect(screen.getByText('No workers yet')).toBeInTheDocument();
			expect(
				screen.getByText('Get started by adding your first worker')
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: 'Add Worker' })
			).toBeInTheDocument();
		});
	});
});
