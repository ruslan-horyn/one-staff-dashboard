import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataTableSkeleton } from '../data-table-skeleton';

describe('DataTableSkeleton', () => {
	describe('Rendering', () => {
		it('renders table structure', () => {
			render(<DataTableSkeleton columns={3} />);

			expect(screen.getByRole('table')).toBeInTheDocument();
		});

		it('renders correct number of columns', () => {
			render(<DataTableSkeleton columns={4} />);

			const headerCells = screen.getAllByRole('columnheader');
			expect(headerCells).toHaveLength(4);
		});

		it('renders default 5 rows', () => {
			render(<DataTableSkeleton columns={3} />);

			const rows = screen.getAllByRole('row');
			// 1 header row + 5 body rows = 6 total
			expect(rows).toHaveLength(6);
		});

		it('renders custom number of rows', () => {
			render(<DataTableSkeleton columns={3} rows={10} />);

			const rows = screen.getAllByRole('row');
			// 1 header row + 10 body rows = 11 total
			expect(rows).toHaveLength(11);
		});

		it('renders skeleton elements in cells', () => {
			render(<DataTableSkeleton columns={2} rows={2} />);

			// 2 header skeletons + (2 rows * 2 columns) body skeletons = 6 total
			const skeletons = document.querySelectorAll('[data-slot="skeleton"]');
			expect(skeletons).toHaveLength(6);
		});

		it('applies custom className', () => {
			const { container } = render(
				<DataTableSkeleton columns={3} className="custom-class" />
			);

			expect(
				container.querySelector('[data-slot="data-table-skeleton"]')
			).toHaveClass('custom-class');
		});
	});

	describe('Edge cases', () => {
		it('renders single column', () => {
			render(<DataTableSkeleton columns={1} rows={1} />);

			const headerCells = screen.getAllByRole('columnheader');
			expect(headerCells).toHaveLength(1);
		});

		it('renders many columns', () => {
			render(<DataTableSkeleton columns={10} rows={1} />);

			const headerCells = screen.getAllByRole('columnheader');
			expect(headerCells).toHaveLength(10);
		});
	});
});
