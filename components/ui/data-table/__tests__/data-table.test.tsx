import type { ColumnDef } from '@tanstack/react-table';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTable } from '../data-table';

interface TestData {
	id: string;
	name: string;
	email: string;
}

const testData: TestData[] = [
	{ id: '1', name: 'John Doe', email: 'john@example.com' },
	{ id: '2', name: 'Jane Smith', email: 'jane@example.com' },
	{ id: '3', name: 'Bob Johnson', email: 'bob@example.com' },
];

const columns: ColumnDef<TestData, string>[] = [
	{
		accessorKey: 'name',
		header: 'Name',
	},
	{
		accessorKey: 'email',
		header: 'Email',
	},
];

describe('DataTable', () => {
	describe('Rendering', () => {
		it('renders table structure', () => {
			render(<DataTable columns={columns} data={testData} />);

			expect(screen.getByRole('table')).toBeInTheDocument();
		});

		it('renders column headers', () => {
			render(<DataTable columns={columns} data={testData} />);

			expect(screen.getByText('Name')).toBeInTheDocument();
			expect(screen.getByText('Email')).toBeInTheDocument();
		});

		it('renders data rows', () => {
			render(<DataTable columns={columns} data={testData} />);

			expect(screen.getByText('John Doe')).toBeInTheDocument();
			expect(screen.getByText('john@example.com')).toBeInTheDocument();
			expect(screen.getByText('Jane Smith')).toBeInTheDocument();
			expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
		});

		it('renders correct number of rows', () => {
			render(<DataTable columns={columns} data={testData} />);

			// 1 header row + 3 data rows = 4 total
			const rows = screen.getAllByRole('row');
			expect(rows).toHaveLength(4);
		});
	});

	describe('Loading state', () => {
		it('renders skeleton when isLoading is true', () => {
			render(<DataTable columns={columns} data={[]} isLoading={true} />);

			expect(
				document.querySelector('[data-slot="data-table-skeleton"]')
			).toBeInTheDocument();
		});

		it('does not render data when loading', () => {
			render(<DataTable columns={columns} data={testData} isLoading={true} />);

			expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
		});
	});

	describe('Empty state', () => {
		it('renders empty state when no data', () => {
			render(
				<DataTable
					columns={columns}
					data={[]}
					emptyState={{
						title: 'No workers',
						description: 'Add your first worker',
					}}
				/>
			);

			expect(screen.getByText('No workers')).toBeInTheDocument();
			expect(screen.getByText('Add your first worker')).toBeInTheDocument();
		});

		it('renders "No results" when no data and no emptyState', () => {
			render(<DataTable columns={columns} data={[]} />);

			expect(screen.getByText('No results.')).toBeInTheDocument();
		});
	});

	describe('Pagination', () => {
		it('renders pagination when pagination prop is provided', () => {
			const pagination = {
				page: 1,
				pageSize: 20,
				totalItems: 100,
				totalPages: 5,
				hasNextPage: true,
				hasPreviousPage: false,
			};

			render(
				<DataTable
					columns={columns}
					data={testData}
					pagination={pagination}
					onPaginationChange={vi.fn()}
				/>
			);

			expect(
				screen.getByText(/showing 1-20 of 100 items/i)
			).toBeInTheDocument();
		});

		it('calls onPaginationChange when page changes', async () => {
			const user = userEvent.setup();
			const onPaginationChange = vi.fn();
			const pagination = {
				page: 1,
				pageSize: 20,
				totalItems: 100,
				totalPages: 5,
				hasNextPage: true,
				hasPreviousPage: false,
			};

			render(
				<DataTable
					columns={columns}
					data={testData}
					pagination={pagination}
					onPaginationChange={onPaginationChange}
				/>
			);

			await user.click(
				screen.getByRole('button', { name: /go to next page/i })
			);

			expect(onPaginationChange).toHaveBeenCalledWith(2, 20);
		});

		it('does not render pagination when pagination prop is not provided', () => {
			render(<DataTable columns={columns} data={testData} />);

			expect(screen.queryByText(/showing.*of.*items/i)).not.toBeInTheDocument();
		});
	});

	describe('Row selection', () => {
		it('renders checkboxes when enableRowSelection is true', () => {
			render(
				<DataTable
					columns={columns}
					data={testData}
					enableRowSelection={true}
				/>
			);

			// Select all checkbox + 3 row checkboxes = 4 total
			const checkboxes = screen.getAllByRole('checkbox');
			expect(checkboxes).toHaveLength(4);
		});

		it('does not render checkboxes when enableRowSelection is false', () => {
			render(
				<DataTable
					columns={columns}
					data={testData}
					enableRowSelection={false}
				/>
			);

			expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
		});

		it('calls onRowSelectionChange when row is selected', async () => {
			const user = userEvent.setup();
			const onRowSelectionChange = vi.fn();

			render(
				<DataTable
					columns={columns}
					data={testData}
					enableRowSelection={true}
					onRowSelectionChange={onRowSelectionChange}
				/>
			);

			// Click first row checkbox (index 1, after header checkbox)
			const checkboxes = screen.getAllByRole('checkbox');
			await user.click(checkboxes[1]);

			expect(onRowSelectionChange).toHaveBeenCalledWith([testData[0]]);
		});
	});

	describe('Expandable rows', () => {
		it('renders expand buttons when renderExpandedRow is provided', () => {
			render(
				<DataTable
					columns={columns}
					data={testData}
					renderExpandedRow={(row) => (
						<div>Details for {row.original.name}</div>
					)}
				/>
			);

			// 3 expand buttons for 3 rows
			const expandButtons = screen.getAllByRole('button', {
				name: /expand row/i,
			});
			expect(expandButtons).toHaveLength(3);
		});

		it('shows expanded content when row is clicked', async () => {
			const user = userEvent.setup();

			render(
				<DataTable
					columns={columns}
					data={testData}
					renderExpandedRow={(row) => (
						<div data-testid="expanded-content">
							Details for {row.original.name}
						</div>
					)}
				/>
			);

			const expandButtons = screen.getAllByRole('button', {
				name: /expand row/i,
			});
			await user.click(expandButtons[0]);

			expect(screen.getByTestId('expanded-content')).toBeInTheDocument();
			expect(screen.getByText('Details for John Doe')).toBeInTheDocument();
		});

		it('collapses row when clicked again', async () => {
			const user = userEvent.setup();

			render(
				<DataTable
					columns={columns}
					data={testData}
					renderExpandedRow={(row) => (
						<div data-testid="expanded-content">
							Details for {row.original.name}
						</div>
					)}
				/>
			);

			const expandButtons = screen.getAllByRole('button', {
				name: /expand row/i,
			});

			// Expand
			await user.click(expandButtons[0]);
			expect(screen.getByTestId('expanded-content')).toBeInTheDocument();

			// Collapse
			const collapseButton = screen.getByRole('button', {
				name: /collapse row/i,
			});
			await user.click(collapseButton);

			expect(screen.queryByTestId('expanded-content')).not.toBeInTheDocument();
		});

		it('sets aria-expanded attribute correctly', async () => {
			const user = userEvent.setup();

			render(
				<DataTable
					columns={columns}
					data={testData}
					renderExpandedRow={(row) => (
						<div>Details for {row.original.name}</div>
					)}
				/>
			);

			// Get the first expand button
			const expandButtons = screen.getAllByLabelText(/expand row/i);
			expect(expandButtons[0]).toHaveAttribute('aria-expanded', 'false');

			await user.click(expandButtons[0]);

			// After clicking, need to re-query as component re-renders
			const collapseButton = screen.getByLabelText(/collapse row/i);
			expect(collapseButton).toHaveAttribute('aria-expanded', 'true');
		});
	});

	describe('Styling', () => {
		it('applies custom className', () => {
			const { container } = render(
				<DataTable columns={columns} data={testData} className="custom-class" />
			);

			expect(container.querySelector('[data-slot="data-table"]')).toHaveClass(
				'custom-class'
			);
		});
	});
});
