import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DestructiveButton } from '../destructive-button';

describe('DestructiveButton', () => {
	describe('Rendering', () => {
		it('renders children when not pending', () => {
			render(<DestructiveButton>Delete</DestructiveButton>);

			expect(
				screen.getByRole('button', { name: 'Delete' })
			).toBeInTheDocument();
		});

		it('renders loading text when pending', () => {
			render(
				<DestructiveButton isPending loadingText="Deleting...">
					Delete
				</DestructiveButton>
			);

			expect(
				screen.getByRole('button', { name: /deleting/i })
			).toBeInTheDocument();
			expect(screen.queryByText('Delete')).not.toBeInTheDocument();
		});

		it('renders default loading text when no loadingText provided', () => {
			render(<DestructiveButton isPending>Delete</DestructiveButton>);

			expect(
				screen.getByRole('button', { name: /loading/i })
			).toBeInTheDocument();
		});

		it('renders spinner icon when pending', () => {
			render(
				<DestructiveButton isPending loadingText="Deleting...">
					Delete
				</DestructiveButton>
			);

			const button = screen.getByRole('button');
			const spinner = button.querySelector('svg');
			expect(spinner).toBeInTheDocument();
			expect(spinner).toHaveClass('animate-spin');
		});
	});

	describe('Disabled state', () => {
		it('is disabled when isPending is true', () => {
			render(<DestructiveButton isPending>Delete</DestructiveButton>);

			expect(screen.getByRole('button')).toBeDisabled();
		});

		it('is disabled when disabled prop is true', () => {
			render(<DestructiveButton disabled>Delete</DestructiveButton>);

			expect(screen.getByRole('button')).toBeDisabled();
		});

		it('is enabled when neither isPending nor disabled', () => {
			render(<DestructiveButton>Delete</DestructiveButton>);

			expect(screen.getByRole('button')).not.toBeDisabled();
		});
	});

	describe('Interactions', () => {
		it('calls onClick when clicked', async () => {
			const user = userEvent.setup();
			const onClick = vi.fn();

			render(<DestructiveButton onClick={onClick}>Delete</DestructiveButton>);

			await user.click(screen.getByRole('button'));

			expect(onClick).toHaveBeenCalledTimes(1);
		});

		it('does not call onClick when disabled', async () => {
			const user = userEvent.setup();
			const onClick = vi.fn();

			render(
				<DestructiveButton onClick={onClick} disabled>
					Delete
				</DestructiveButton>
			);

			await user.click(screen.getByRole('button'));

			expect(onClick).not.toHaveBeenCalled();
		});

		it('does not call onClick when pending', async () => {
			const user = userEvent.setup();
			const onClick = vi.fn();

			render(
				<DestructiveButton onClick={onClick} isPending>
					Delete
				</DestructiveButton>
			);

			await user.click(screen.getByRole('button'));

			expect(onClick).not.toHaveBeenCalled();
		});
	});

	describe('Accessibility', () => {
		it('has aria-busy when pending', () => {
			render(<DestructiveButton isPending>Delete</DestructiveButton>);

			expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
		});

		it('does not have aria-busy when not pending', () => {
			render(<DestructiveButton>Delete</DestructiveButton>);

			const ariaAttr = screen.getByRole('button').getAttribute('aria-busy');
			expect(ariaAttr === null || ariaAttr === 'false').toBe(true);
		});

		it('spinner has aria-hidden for screen readers', () => {
			render(<DestructiveButton isPending>Delete</DestructiveButton>);

			const button = screen.getByRole('button');
			const spinner = button.querySelector('svg');
			expect(spinner).toHaveAttribute('aria-hidden', 'true');
		});
	});

	describe('Styling', () => {
		it('applies custom className', () => {
			render(
				<DestructiveButton className="custom-class">Delete</DestructiveButton>
			);

			expect(screen.getByRole('button')).toHaveClass('custom-class');
		});

		it('has type="button" by default', () => {
			render(<DestructiveButton>Delete</DestructiveButton>);

			expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
		});

		it('allows overriding type to submit', () => {
			render(<DestructiveButton type="submit">Delete</DestructiveButton>);

			expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
		});
	});

	describe('Size variants', () => {
		it('passes size prop to button', () => {
			render(<DestructiveButton size="sm">Delete</DestructiveButton>);

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('data-size', 'sm');
		});

		it('passes lg size to button', () => {
			render(<DestructiveButton size="lg">Delete</DestructiveButton>);

			const button = screen.getByRole('button');
			expect(button).toHaveAttribute('data-size', 'lg');
		});
	});
});
