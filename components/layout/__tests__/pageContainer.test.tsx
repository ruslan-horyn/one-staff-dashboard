import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PageContainer } from '../pageContainer';

describe('PageContainer', () => {
	describe('Rendering', () => {
		it('renders children', () => {
			render(
				<PageContainer>
					<p>Test content</p>
				</PageContainer>
			);

			expect(screen.getByText('Test content')).toBeInTheDocument();
		});

		it('applies default padding classes', () => {
			const { container } = render(
				<PageContainer>
					<p>Test content</p>
				</PageContainer>
			);

			const wrapper = container.firstChild as HTMLElement;
			expect(wrapper).toHaveClass('p-4', 'md:p-6');
		});

		it('accepts custom className', () => {
			const { container } = render(
				<PageContainer className="custom-class">
					<p>Test content</p>
				</PageContainer>
			);

			const wrapper = container.firstChild as HTMLElement;
			expect(wrapper).toHaveClass('custom-class');
		});

		it('merges custom className with default classes', () => {
			const { container } = render(
				<PageContainer className="custom-class">
					<p>Test content</p>
				</PageContainer>
			);

			const wrapper = container.firstChild as HTMLElement;
			expect(wrapper).toHaveClass('p-4', 'md:p-6', 'custom-class');
		});
	});
});
