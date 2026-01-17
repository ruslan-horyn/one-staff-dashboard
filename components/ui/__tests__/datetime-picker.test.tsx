import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { DateTimePicker } from '../datetime-picker';

describe('DateTimePicker', () => {
	describe('Rendering', () => {
		it('renders trigger button', () => {
			const onChange = vi.fn();
			render(<DateTimePicker onChange={onChange} />);

			expect(screen.getByRole('button')).toBeInTheDocument();
		});

		it('shows placeholder when no value', () => {
			const onChange = vi.fn();
			render(<DateTimePicker onChange={onChange} />);

			expect(screen.getByText('Select date and time...')).toBeInTheDocument();
		});

		it('shows custom placeholder', () => {
			const onChange = vi.fn();
			render(
				<DateTimePicker onChange={onChange} placeholder="Choose datetime" />
			);

			expect(screen.getByText('Choose datetime')).toBeInTheDocument();
		});

		it('displays formatted date when value provided', () => {
			const onChange = vi.fn();
			const date = new Date(2026, 0, 15, 14, 30); // Jan 15, 2026, 14:30

			render(<DateTimePicker value={date} onChange={onChange} />);

			expect(screen.getByText(/15 Jan 2026, 14:30/)).toBeInTheDocument();
		});

		it('shows calendar icon', () => {
			const onChange = vi.fn();
			const { container } = render(<DateTimePicker onChange={onChange} />);

			expect(container.querySelector('svg')).toBeInTheDocument();
		});
	});

	describe('Popover interaction', () => {
		it('opens popover when trigger is clicked', async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			render(<DateTimePicker onChange={onChange} />);

			await user.click(screen.getByRole('button'));

			// Calendar should be visible
			expect(screen.getByRole('grid')).toBeInTheDocument();
		});

		it('closes popover on escape', async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			render(<DateTimePicker onChange={onChange} />);

			await user.click(screen.getByRole('button'));
			expect(screen.getByRole('grid')).toBeInTheDocument();

			await user.keyboard('{Escape}');

			// Grid should no longer be visible
			expect(screen.queryByRole('grid')).not.toBeInTheDocument();
		});
	});

	describe('Date selection', () => {
		it('updates temp state when date is selected', async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			render(<DateTimePicker onChange={onChange} />);

			await user.click(screen.getByRole('button'));

			// Click on a day button (e.g., day 15)
			const calendar = screen.getByRole('grid');
			const dayButtons = within(calendar).getAllByRole('button');
			const day15 = dayButtons.find((btn) => btn.textContent === '15');

			if (day15) {
				await user.click(day15);
			}

			// The date is not committed yet until Apply is clicked
			expect(onChange).not.toHaveBeenCalled();
		});
	});

	describe('Apply button', () => {
		it('calls onChange with selected date when Apply is clicked', async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			render(<DateTimePicker onChange={onChange} />);

			await user.click(screen.getByRole('button'));

			// Select a day
			const calendar = screen.getByRole('grid');
			const dayButtons = within(calendar).getAllByRole('button');
			const day15 = dayButtons.find((btn) => btn.textContent === '15');

			if (day15) {
				await user.click(day15);
			}

			// Click Apply
			const applyButton = screen.getByRole('button', { name: 'Apply' });
			await user.click(applyButton);

			expect(onChange).toHaveBeenCalled();
			const calledDate = onChange.mock.calls[0][0];
			expect(calledDate).toBeInstanceOf(Date);
			expect(calledDate.getDate()).toBe(15);
		});

		it('is disabled when no date is selected', async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			render(<DateTimePicker onChange={onChange} />);

			await user.click(screen.getByRole('button'));

			const applyButton = screen.getByRole('button', { name: 'Apply' });
			expect(applyButton).toBeDisabled();
		});
	});

	describe('Clear functionality', () => {
		it('shows clear button when value is set and clearable is true', () => {
			const onChange = vi.fn();
			const date = new Date(2026, 0, 15, 14, 30);

			render(
				<DateTimePicker value={date} onChange={onChange} clearable={true} />
			);

			expect(
				screen.getByRole('button', { name: 'Clear date' })
			).toBeInTheDocument();
		});

		it('does not show clear button when clearable is false', () => {
			const onChange = vi.fn();
			const date = new Date(2026, 0, 15, 14, 30);

			render(
				<DateTimePicker value={date} onChange={onChange} clearable={false} />
			);

			expect(
				screen.queryByRole('button', { name: 'Clear date' })
			).not.toBeInTheDocument();
		});

		it('calls onChange with undefined when clear button is clicked', async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			const date = new Date(2026, 0, 15, 14, 30);

			render(<DateTimePicker value={date} onChange={onChange} clearable />);

			const clearButton = screen.getByRole('button', { name: 'Clear date' });
			await user.click(clearButton);

			expect(onChange).toHaveBeenCalledWith(undefined);
		});

		it('clears date when Enter key is pressed on clear button', async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			const date = new Date(2026, 0, 15, 14, 30);

			render(<DateTimePicker value={date} onChange={onChange} clearable />);

			const clearButton = screen.getByRole('button', { name: 'Clear date' });
			clearButton.focus();
			await user.keyboard('{Enter}');

			expect(onChange).toHaveBeenCalledWith(undefined);
		});

		it('clears date when Space key is pressed on clear button', async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			const date = new Date(2026, 0, 15, 14, 30);

			render(<DateTimePicker value={date} onChange={onChange} clearable />);

			const clearButton = screen.getByRole('button', { name: 'Clear date' });
			clearButton.focus();
			await user.keyboard(' ');

			expect(onChange).toHaveBeenCalledWith(undefined);
		});
	});

	describe('Error state', () => {
		it('displays error message when provided', () => {
			const onChange = vi.fn();
			render(<DateTimePicker onChange={onChange} error="Date is required" />);

			expect(screen.getByText('Date is required')).toBeInTheDocument();
		});

		it('sets aria-invalid when error is provided', () => {
			const onChange = vi.fn();
			render(<DateTimePicker onChange={onChange} error="Invalid date" />);

			expect(screen.getByRole('button')).toHaveAttribute(
				'aria-invalid',
				'true'
			);
		});
	});

	describe('Disabled state', () => {
		it('disables trigger when disabled prop is true', () => {
			const onChange = vi.fn();
			render(<DateTimePicker onChange={onChange} disabled />);

			expect(screen.getByRole('button')).toBeDisabled();
		});

		it('does not show clear button when disabled', () => {
			const onChange = vi.fn();
			const date = new Date(2026, 0, 15, 14, 30);

			render(
				<DateTimePicker value={date} onChange={onChange} clearable disabled />
			);

			expect(
				screen.queryByRole('button', { name: 'Clear date' })
			).not.toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('has aria-haspopup attribute', () => {
			const onChange = vi.fn();
			render(<DateTimePicker onChange={onChange} />);

			expect(screen.getByRole('button')).toHaveAttribute(
				'aria-haspopup',
				'dialog'
			);
		});

		it('has aria-expanded attribute', async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			render(<DateTimePicker onChange={onChange} />);

			const trigger = screen.getByRole('button');
			expect(trigger).toHaveAttribute('aria-expanded', 'false');

			await user.click(trigger);
			expect(trigger).toHaveAttribute('aria-expanded', 'true');
		});
	});

	describe('Custom className', () => {
		it('applies custom className to wrapper', () => {
			const onChange = vi.fn();
			const { container } = render(
				<DateTimePicker onChange={onChange} className="custom-class" />
			);

			expect(container.firstChild).toHaveClass('custom-class');
		});
	});

	describe('Date constraints (minDate/maxDate)', () => {
		it('does not mutate minDate when checking disabled dates', async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			// Create minDate with specific time (14:30:45.123)
			const minDate = new Date(2026, 0, 10, 14, 30, 45, 123);
			const originalTime = minDate.getTime();

			render(<DateTimePicker onChange={onChange} minDate={minDate} />);

			// Open popover - this triggers isDateDisabled checks
			await user.click(screen.getByRole('button'));

			// Wait for calendar to render
			expect(screen.getByRole('grid')).toBeInTheDocument();

			// minDate should NOT be mutated
			expect(minDate.getTime()).toBe(originalTime);
			expect(minDate.getHours()).toBe(14);
			expect(minDate.getMinutes()).toBe(30);
			expect(minDate.getSeconds()).toBe(45);
			expect(minDate.getMilliseconds()).toBe(123);
		});

		it('does not mutate maxDate when checking disabled dates', async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			// Create maxDate with specific time (10:15:30.500)
			const maxDate = new Date(2026, 0, 20, 10, 15, 30, 500);
			const originalTime = maxDate.getTime();

			render(<DateTimePicker onChange={onChange} maxDate={maxDate} />);

			// Open popover - this triggers isDateDisabled checks
			await user.click(screen.getByRole('button'));

			// Wait for calendar to render
			expect(screen.getByRole('grid')).toBeInTheDocument();

			// maxDate should NOT be mutated
			expect(maxDate.getTime()).toBe(originalTime);
			expect(maxDate.getHours()).toBe(10);
			expect(maxDate.getMinutes()).toBe(15);
			expect(maxDate.getSeconds()).toBe(30);
			expect(maxDate.getMilliseconds()).toBe(500);
		});

		it('correctly disables dates before minDate', async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			// Set minDate to Jan 15, 2026
			const minDate = new Date(2026, 0, 15);

			render(<DateTimePicker onChange={onChange} minDate={minDate} />);

			await user.click(screen.getByRole('button'));

			const calendar = screen.getByRole('grid');
			const dayButtons = within(calendar).getAllByRole('button');

			// Day 10 should be disabled (before minDate)
			const day10 = dayButtons.find((btn) => btn.textContent === '10');
			if (day10) {
				expect(day10).toBeDisabled();
			}

			// Day 15 should NOT be disabled (equals minDate)
			const day15 = dayButtons.find((btn) => btn.textContent === '15');
			if (day15) {
				expect(day15).not.toBeDisabled();
			}

			// Day 20 should NOT be disabled (after minDate)
			const day20 = dayButtons.find((btn) => btn.textContent === '20');
			if (day20) {
				expect(day20).not.toBeDisabled();
			}
		});

		it('correctly disables dates after maxDate', async () => {
			const user = userEvent.setup();
			const onChange = vi.fn();
			// Set maxDate to Jan 15, 2026
			const maxDate = new Date(2026, 0, 15);

			render(<DateTimePicker onChange={onChange} maxDate={maxDate} />);

			await user.click(screen.getByRole('button'));

			const calendar = screen.getByRole('grid');
			const dayButtons = within(calendar).getAllByRole('button');

			// Day 10 should NOT be disabled (before maxDate)
			const day10 = dayButtons.find((btn) => btn.textContent === '10');
			if (day10) {
				expect(day10).not.toBeDisabled();
			}

			// Day 15 should NOT be disabled (equals maxDate)
			const day15 = dayButtons.find((btn) => btn.textContent === '15');
			if (day15) {
				expect(day15).not.toBeDisabled();
			}

			// Day 20 should be disabled (after maxDate)
			const day20 = dayButtons.find((btn) => btn.textContent === '20');
			if (day20) {
				expect(day20).toBeDisabled();
			}
		});
	});
});
