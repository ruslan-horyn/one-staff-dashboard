import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ComboboxSelect } from '../combobox-select';

interface TestOption {
	id: string;
	name: string;
}

const mockOptions: TestOption[] = [
	{ id: '1', name: 'Option 1' },
	{ id: '2', name: 'Option 2' },
	{ id: '3', name: 'Option 3' },
];

const getOptionLabel = (option: TestOption) => option.name;
const getOptionValue = (option: TestOption) => option.id;

describe('ComboboxSelect', () => {
	describe('Rendering', () => {
		it('renders trigger button', () => {
			const onChange = vi.fn();
			render(
				<ComboboxSelect
					options={mockOptions}
					getOptionLabel={getOptionLabel}
					getOptionValue={getOptionValue}
					onChange={onChange}
				/>
			);

			expect(screen.getByRole('combobox')).toBeInTheDocument();
		});

		it('shows placeholder when no value selected', () => {
			const onChange = vi.fn();
			render(
				<ComboboxSelect
					options={mockOptions}
					getOptionLabel={getOptionLabel}
					getOptionValue={getOptionValue}
					onChange={onChange}
					placeholder="Select option..."
				/>
			);

			expect(screen.getByText('Select option...')).toBeInTheDocument();
		});

		it('shows default placeholder', () => {
			const onChange = vi.fn();
			render(
				<ComboboxSelect
					options={mockOptions}
					getOptionLabel={getOptionLabel}
					getOptionValue={getOptionValue}
					onChange={onChange}
				/>
			);

			expect(screen.getByText('Select...')).toBeInTheDocument();
		});

		it('displays selected option label', () => {
			const onChange = vi.fn();
			render(
				<ComboboxSelect
					options={mockOptions}
					getOptionLabel={getOptionLabel}
					getOptionValue={getOptionValue}
					value={mockOptions[1]}
					onChange={onChange}
				/>
			);

			expect(screen.getByText('Option 2')).toBeInTheDocument();
		});
	});

	describe('Loading state', () => {
		it('shows loading spinner in trigger when isLoading', () => {
			const onChange = vi.fn();
			render(
				<ComboboxSelect
					options={mockOptions}
					getOptionLabel={getOptionLabel}
					getOptionValue={getOptionValue}
					onChange={onChange}
					isLoading
				/>
			);

			// Spinner should be in trigger
			const trigger = screen.getByRole('combobox');
			expect(trigger.querySelector('.animate-spin')).toBeInTheDocument();
		});
	});

	describe('Error state', () => {
		it('displays error message when provided', () => {
			const onChange = vi.fn();
			render(
				<ComboboxSelect
					options={mockOptions}
					getOptionLabel={getOptionLabel}
					getOptionValue={getOptionValue}
					onChange={onChange}
					error="Selection is required"
				/>
			);

			expect(screen.getByText('Selection is required')).toBeInTheDocument();
		});

		it('sets aria-invalid when error is provided', () => {
			const onChange = vi.fn();
			render(
				<ComboboxSelect
					options={mockOptions}
					getOptionLabel={getOptionLabel}
					getOptionValue={getOptionValue}
					onChange={onChange}
					error="Invalid selection"
				/>
			);

			expect(screen.getByRole('combobox')).toHaveAttribute(
				'aria-invalid',
				'true'
			);
		});
	});

	describe('Disabled state', () => {
		it('disables trigger when disabled prop is true', () => {
			const onChange = vi.fn();
			render(
				<ComboboxSelect
					options={mockOptions}
					getOptionLabel={getOptionLabel}
					getOptionValue={getOptionValue}
					onChange={onChange}
					disabled
				/>
			);

			expect(screen.getByRole('combobox')).toBeDisabled();
		});
	});

	describe('Accessibility', () => {
		it('has combobox role on trigger', () => {
			const onChange = vi.fn();
			render(
				<ComboboxSelect
					options={mockOptions}
					getOptionLabel={getOptionLabel}
					getOptionValue={getOptionValue}
					onChange={onChange}
				/>
			);

			expect(screen.getByRole('combobox')).toBeInTheDocument();
		});

		it('has aria-expanded attribute set to false initially', () => {
			const onChange = vi.fn();
			render(
				<ComboboxSelect
					options={mockOptions}
					getOptionLabel={getOptionLabel}
					getOptionValue={getOptionValue}
					onChange={onChange}
				/>
			);

			expect(screen.getByRole('combobox')).toHaveAttribute(
				'aria-expanded',
				'false'
			);
		});
	});

	describe('Custom className', () => {
		it('applies custom className to wrapper', () => {
			const onChange = vi.fn();
			const { container } = render(
				<ComboboxSelect
					options={mockOptions}
					getOptionLabel={getOptionLabel}
					getOptionValue={getOptionValue}
					onChange={onChange}
					className="custom-class"
				/>
			);

			expect(container.firstChild).toHaveClass('custom-class');
		});
	});
});
