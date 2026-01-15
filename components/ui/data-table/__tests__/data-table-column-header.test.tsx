import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTableColumnHeader } from '../data-table-column-header';

// Mock column object that matches @tanstack/react-table Column interface
const createMockColumn = (overrides = {}) => ({
	getCanSort: vi.fn(() => true),
	getIsSorted: vi.fn(() => false),
	toggleSorting: vi.fn(),
	...overrides,
});

describe('DataTableColumnHeader', () => {
	describe('Rendering', () => {
		it('renders title', () => {
			const column = createMockColumn();
			render(<DataTableColumnHeader column={column} title="Name" />);

			expect(screen.getByText('Name')).toBeInTheDocument();
		});

		it('renders sortable button when column can sort', () => {
			const column = createMockColumn({ getCanSort: vi.fn(() => true) });
			render(<DataTableColumnHeader column={column} title="Name" />);

			expect(
				screen.getByRole('button', { name: /sort by name/i })
			).toBeInTheDocument();
		});

		it('renders plain text when column cannot sort', () => {
			const column = createMockColumn({ getCanSort: vi.fn(() => false) });
			render(<DataTableColumnHeader column={column} title="Actions" />);

			expect(
				screen.queryByRole('button', { name: /sort/i })
			).not.toBeInTheDocument();
			expect(screen.getByText('Actions')).toBeInTheDocument();
		});
	});

	describe('Sort indicators', () => {
		it('shows ArrowUpDown icon when not sorted', () => {
			const column = createMockColumn({ getIsSorted: vi.fn(() => false) });
			render(<DataTableColumnHeader column={column} title="Name" />);

			// ArrowUpDown icon should be present (default unsorted state)
			const button = screen.getByRole('button');
			expect(button.querySelector('svg')).toBeInTheDocument();
		});

		it('shows ArrowUp icon when sorted ascending', () => {
			const column = createMockColumn({ getIsSorted: vi.fn(() => 'asc') });
			render(<DataTableColumnHeader column={column} title="Name" />);

			const button = screen.getByRole('button');
			expect(button.querySelector('svg')).toBeInTheDocument();
		});

		it('shows ArrowDown icon when sorted descending', () => {
			const column = createMockColumn({ getIsSorted: vi.fn(() => 'desc') });
			render(<DataTableColumnHeader column={column} title="Name" />);

			const button = screen.getByRole('button');
			expect(button.querySelector('svg')).toBeInTheDocument();
		});
	});

	describe('Interaction', () => {
		it('calls toggleSorting when clicked', async () => {
			const user = userEvent.setup();
			const toggleSorting = vi.fn();
			const column = createMockColumn({ toggleSorting });

			render(<DataTableColumnHeader column={column} title="Name" />);

			await user.click(screen.getByRole('button'));
			expect(toggleSorting).toHaveBeenCalled();
		});

		it('toggles to descending when currently ascending', async () => {
			const user = userEvent.setup();
			const toggleSorting = vi.fn();
			const column = createMockColumn({
				toggleSorting,
				getIsSorted: vi.fn(() => 'asc'),
			});

			render(<DataTableColumnHeader column={column} title="Name" />);

			await user.click(screen.getByRole('button'));
			// toggleSorting is called with true when current sort is 'asc'
			expect(toggleSorting).toHaveBeenCalledWith(true);
		});

		it('toggles to ascending when not sorted', async () => {
			const user = userEvent.setup();
			const toggleSorting = vi.fn();
			const column = createMockColumn({
				toggleSorting,
				getIsSorted: vi.fn(() => false),
			});

			render(<DataTableColumnHeader column={column} title="Name" />);

			await user.click(screen.getByRole('button'));
			expect(toggleSorting).toHaveBeenCalledWith(false);
		});
	});

	describe('Accessibility', () => {
		it('has accessible aria-label on sort button', () => {
			const column = createMockColumn();
			render(<DataTableColumnHeader column={column} title="Worker Name" />);

			expect(
				screen.getByRole('button', { name: /sort by worker name/i })
			).toBeInTheDocument();
		});

		it('applies custom className', () => {
			const column = createMockColumn({ getCanSort: vi.fn(() => false) });
			const { container } = render(
				<DataTableColumnHeader
					column={column}
					title="Name"
					className="custom-class"
				/>
			);

			expect(container.firstChild).toHaveClass('custom-class');
		});
	});
});
