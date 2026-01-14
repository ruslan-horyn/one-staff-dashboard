import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageHeader } from '../pageHeader';

describe('PageHeader', () => {
	describe('Rendering', () => {
		it('renders title', () => {
			render(<PageHeader title="Test Title" />);

			expect(
				screen.getByRole('heading', { name: 'Test Title', level: 1 })
			).toBeInTheDocument();
		});

		it('renders description when provided', () => {
			render(
				<PageHeader title="Test Title" description="Test description text" />
			);

			expect(screen.getByText('Test description text')).toBeInTheDocument();
		});

		it('does not render description when not provided', () => {
			render(<PageHeader title="Test Title" />);

			const description = document.querySelector('p');
			expect(description).not.toBeInTheDocument();
		});

		it('renders actions when provided', () => {
			render(
				<PageHeader
					title="Test Title"
					actions={<button type="button">Action Button</button>}
				/>
			);

			expect(
				screen.getByRole('button', { name: 'Action Button' })
			).toBeInTheDocument();
		});

		it('does not render actions container when not provided', () => {
			const { container } = render(<PageHeader title="Test Title" />);

			// The actions wrapper shouldn't exist
			const actionsContainer = container.querySelector(
				'.flex.items-center.gap-2'
			);
			expect(actionsContainer).not.toBeInTheDocument();
		});

		it('renders multiple actions', () => {
			render(
				<PageHeader
					title="Test Title"
					actions={
						<>
							<button type="button">Action 1</button>
							<button type="button">Action 2</button>
						</>
					}
				/>
			);

			expect(
				screen.getByRole('button', { name: 'Action 1' })
			).toBeInTheDocument();
			expect(
				screen.getByRole('button', { name: 'Action 2' })
			).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('uses h1 for title', () => {
			render(<PageHeader title="Test Title" />);

			const heading = screen.getByRole('heading', { level: 1 });
			expect(heading).toHaveTextContent('Test Title');
		});
	});
});
