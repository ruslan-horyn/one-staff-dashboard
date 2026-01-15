import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTablePagination } from '../data-table-pagination';

const defaultProps = {
	page: 1,
	pageSize: 20,
	totalItems: 100,
	totalPages: 5,
	onPageChange: vi.fn(),
	onPageSizeChange: vi.fn(),
};

describe('DataTablePagination', () => {
	describe('Rendering', () => {
		it('renders pagination info', () => {
			render(<DataTablePagination {...defaultProps} />);

			expect(screen.getByText(/showing 1-20 of 100/i)).toBeInTheDocument();
		});

		it('renders page size selector', () => {
			render(<DataTablePagination {...defaultProps} />);

			expect(screen.getByText(/rows per page/i)).toBeInTheDocument();
		});

		it('renders page info', () => {
			render(<DataTablePagination {...defaultProps} />);

			expect(screen.getByText(/page 1 of 5/i)).toBeInTheDocument();
		});

		it('renders navigation buttons', () => {
			render(<DataTablePagination {...defaultProps} />);

			expect(
				screen.getByRole('button', { name: /go to first page/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /go to previous page/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /go to next page/i })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: /go to last page/i })
			).toBeInTheDocument();
		});
	});

	describe('Pagination info calculation', () => {
		it('shows correct range for first page', () => {
			render(<DataTablePagination {...defaultProps} page={1} pageSize={20} />);

			expect(screen.getByText(/showing 1-20 of 100/i)).toBeInTheDocument();
		});

		it('shows correct range for middle page', () => {
			render(<DataTablePagination {...defaultProps} page={3} pageSize={20} />);

			expect(screen.getByText(/showing 41-60 of 100/i)).toBeInTheDocument();
		});

		it('shows correct range for last page with partial items', () => {
			render(
				<DataTablePagination
					{...defaultProps}
					page={5}
					pageSize={20}
					totalItems={95}
				/>
			);

			expect(screen.getByText(/showing 81-95 of 95/i)).toBeInTheDocument();
		});

		it('shows 0-0 when no items', () => {
			render(
				<DataTablePagination
					{...defaultProps}
					page={1}
					totalItems={0}
					totalPages={0}
				/>
			);

			expect(screen.getByText(/showing 0-0 of 0/i)).toBeInTheDocument();
		});
	});

	describe('Navigation buttons state', () => {
		it('disables previous buttons on first page', () => {
			render(<DataTablePagination {...defaultProps} page={1} />);

			expect(
				screen.getByRole('button', { name: /go to first page/i })
			).toBeDisabled();
			expect(
				screen.getByRole('button', { name: /go to previous page/i })
			).toBeDisabled();
		});

		it('enables previous buttons on non-first page', () => {
			render(<DataTablePagination {...defaultProps} page={3} />);

			expect(
				screen.getByRole('button', { name: /go to first page/i })
			).not.toBeDisabled();
			expect(
				screen.getByRole('button', { name: /go to previous page/i })
			).not.toBeDisabled();
		});

		it('disables next buttons on last page', () => {
			render(<DataTablePagination {...defaultProps} page={5} totalPages={5} />);

			expect(
				screen.getByRole('button', { name: /go to next page/i })
			).toBeDisabled();
			expect(
				screen.getByRole('button', { name: /go to last page/i })
			).toBeDisabled();
		});

		it('enables next buttons on non-last page', () => {
			render(<DataTablePagination {...defaultProps} page={3} />);

			expect(
				screen.getByRole('button', { name: /go to next page/i })
			).not.toBeDisabled();
			expect(
				screen.getByRole('button', { name: /go to last page/i })
			).not.toBeDisabled();
		});
	});

	describe('Interaction', () => {
		it('calls onPageChange with page 1 when clicking first page button', async () => {
			const user = userEvent.setup();
			const onPageChange = vi.fn();
			render(
				<DataTablePagination
					{...defaultProps}
					page={3}
					onPageChange={onPageChange}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /go to first page/i })
			);

			expect(onPageChange).toHaveBeenCalledWith(1);
		});

		it('calls onPageChange with previous page when clicking previous button', async () => {
			const user = userEvent.setup();
			const onPageChange = vi.fn();
			render(
				<DataTablePagination
					{...defaultProps}
					page={3}
					onPageChange={onPageChange}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /go to previous page/i })
			);

			expect(onPageChange).toHaveBeenCalledWith(2);
		});

		it('calls onPageChange with next page when clicking next button', async () => {
			const user = userEvent.setup();
			const onPageChange = vi.fn();
			render(
				<DataTablePagination
					{...defaultProps}
					page={3}
					onPageChange={onPageChange}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /go to next page/i })
			);

			expect(onPageChange).toHaveBeenCalledWith(4);
		});

		it('calls onPageChange with last page when clicking last page button', async () => {
			const user = userEvent.setup();
			const onPageChange = vi.fn();
			render(
				<DataTablePagination
					{...defaultProps}
					page={3}
					totalPages={5}
					onPageChange={onPageChange}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /go to last page/i })
			);

			expect(onPageChange).toHaveBeenCalledWith(5);
		});
	});

	describe('Page size selection', () => {
		it('renders default page size options', () => {
			render(<DataTablePagination {...defaultProps} />);

			// Check that the trigger shows current page size
			expect(screen.getByRole('combobox')).toHaveTextContent('20');
		});

		it('renders custom page size options', () => {
			render(
				<DataTablePagination
					{...defaultProps}
					pageSizeOptions={[5, 15, 25]}
					pageSize={15}
				/>
			);

			expect(screen.getByRole('combobox')).toHaveTextContent('15');
		});
	});

	describe('Edge cases', () => {
		it('shows page 1 of 1 when totalPages is 0', () => {
			render(
				<DataTablePagination
					{...defaultProps}
					page={1}
					totalItems={0}
					totalPages={0}
				/>
			);

			expect(screen.getByText(/page 1 of 1/i)).toBeInTheDocument();
		});

		it('applies custom className', () => {
			const { container } = render(
				<DataTablePagination {...defaultProps} className="custom-class" />
			);

			expect(
				container.querySelector('[data-slot="data-table-pagination"]')
			).toHaveClass('custom-class');
		});
	});
});
