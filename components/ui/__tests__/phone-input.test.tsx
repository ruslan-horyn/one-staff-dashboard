import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { PhoneInput } from '../phone-input';

// Wrapper for controlled component testing
const ControlledPhoneInput = ({
	onChangeSpy,
	initialValue = '',
}: {
	onChangeSpy: (value: string) => void;
	initialValue?: string;
}) => {
	const [value, setValue] = useState(initialValue);
	return (
		<PhoneInput
			value={value}
			onChange={(v) => {
				setValue(v);
				onChangeSpy(v);
			}}
		/>
	);
};

describe('PhoneInput', () => {
	describe('Rendering', () => {
		it('renders input element', () => {
			const onChange = vi.fn();
			render(<PhoneInput onChange={onChange} />);

			expect(screen.getByRole('textbox')).toBeInTheDocument();
		});

		it('renders with placeholder', () => {
			const onChange = vi.fn();
			render(<PhoneInput onChange={onChange} placeholder="123 456 789" />);

			expect(screen.getByPlaceholderText('123 456 789')).toBeInTheDocument();
		});

		it('has type="tel" attribute', () => {
			const onChange = vi.fn();
			render(<PhoneInput onChange={onChange} />);

			expect(screen.getByRole('textbox')).toHaveAttribute('type', 'tel');
		});

		it('has inputmode="numeric" attribute', () => {
			const onChange = vi.fn();
			render(<PhoneInput onChange={onChange} />);

			expect(screen.getByRole('textbox')).toHaveAttribute(
				'inputmode',
				'numeric'
			);
		});
	});

	describe('Formatting', () => {
		it('formats Polish phone number (9 digits)', () => {
			const onChange = vi.fn();
			render(<PhoneInput value="123456789" onChange={onChange} />);

			expect(screen.getByRole('textbox')).toHaveValue('123 456 789');
		});

		it('formats Polish phone with country code', () => {
			const onChange = vi.fn();
			render(<PhoneInput value="+48123456789" onChange={onChange} />);

			expect(screen.getByRole('textbox')).toHaveValue('+48 123 456 789');
		});

		it('handles partial input', () => {
			const onChange = vi.fn();
			render(<PhoneInput value="12345" onChange={onChange} />);

			expect(screen.getByRole('textbox')).toHaveValue('123 45');
		});

		it('handles empty value', () => {
			const onChange = vi.fn();
			render(<PhoneInput value="" onChange={onChange} />);

			expect(screen.getByRole('textbox')).toHaveValue('');
		});
	});

	describe('onChange', () => {
		it('calls onChange with normalized digits', () => {
			const onChange = vi.fn();
			render(<ControlledPhoneInput onChangeSpy={onChange} />);

			const input = screen.getByRole('textbox');
			fireEvent.change(input, { target: { value: '123' } });

			expect(onChange).toHaveBeenCalledWith('123');
		});

		it('strips non-digit characters from input', () => {
			const onChange = vi.fn();
			render(<ControlledPhoneInput onChangeSpy={onChange} />);

			const input = screen.getByRole('textbox');
			fireEvent.change(input, { target: { value: '1a2b3' } });

			// Only digits should be in the onChange call
			expect(onChange).toHaveBeenCalledWith('123');
		});

		it('preserves leading plus sign', () => {
			const onChange = vi.fn();
			render(<ControlledPhoneInput onChangeSpy={onChange} />);

			const input = screen.getByRole('textbox');
			fireEvent.change(input, { target: { value: '+48123' } });

			expect(onChange).toHaveBeenCalledWith('+48123');
		});
	});

	describe('Error state', () => {
		it('displays error message when provided', () => {
			const onChange = vi.fn();
			render(
				<PhoneInput onChange={onChange} error="Phone number is required" />
			);

			expect(screen.getByText('Phone number is required')).toBeInTheDocument();
		});

		it('sets aria-invalid when error is provided', () => {
			const onChange = vi.fn();
			render(<PhoneInput onChange={onChange} error="Invalid phone" />);

			expect(screen.getByRole('textbox')).toHaveAttribute(
				'aria-invalid',
				'true'
			);
		});

		it('links error message via aria-describedby', () => {
			const onChange = vi.fn();
			render(<PhoneInput onChange={onChange} error="Invalid phone" />);

			const input = screen.getByRole('textbox');
			const errorId = input.getAttribute('aria-describedby');

			expect(errorId).toBeTruthy();
			expect(document.getElementById(errorId!)).toHaveTextContent(
				'Invalid phone'
			);
		});

		it('does not show error styling when not provided', () => {
			const onChange = vi.fn();
			render(<PhoneInput onChange={onChange} />);

			// aria-invalid should be false or not present when no error
			const input = screen.getByRole('textbox');
			const ariaInvalid = input.getAttribute('aria-invalid');
			expect(ariaInvalid === null || ariaInvalid === 'false').toBe(true);
		});
	});

	describe('Disabled state', () => {
		it('renders disabled when disabled prop is true', () => {
			const onChange = vi.fn();
			render(<PhoneInput onChange={onChange} disabled />);

			expect(screen.getByRole('textbox')).toBeDisabled();
		});
	});

	describe('Custom className', () => {
		it('applies custom className to input', () => {
			const onChange = vi.fn();
			render(<PhoneInput onChange={onChange} className="custom-class" />);

			expect(screen.getByRole('textbox')).toHaveClass('custom-class');
		});
	});
});
