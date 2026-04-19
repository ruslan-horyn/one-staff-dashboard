import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { WaitlistForm } from '@/components/marketing/WaitlistForm';

vi.mock('@/services/waitlist/actions', () => ({
	subscribeToWaitlist: vi.fn(),
}));

import { subscribeToWaitlist } from '@/services/waitlist/actions';

describe('WaitlistForm', () => {
	it('renders email input and submit button', () => {
		render(<WaitlistForm />);
		expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
		expect(
			screen.getByRole('button', { name: /zapisz się/i })
		).toBeInTheDocument();
	});

	it('renders privacy notice with link to /privacy', () => {
		render(<WaitlistForm />);
		expect(
			screen.getByRole('link', { name: /polityką prywatności/i })
		).toHaveAttribute('href', '/privacy');
	});

	it('shows success message after successful submission', async () => {
		vi.mocked(subscribeToWaitlist).mockResolvedValue({
			success: true,
			data: { email: 'test@example.com' },
		});

		render(<WaitlistForm />);
		await userEvent.type(
			screen.getByRole('textbox', { name: /email/i }),
			'test@example.com'
		);
		await userEvent.click(screen.getByRole('button', { name: /zapisz się/i }));

		await waitFor(() => {
			expect(screen.getByText(/zapisano/i)).toBeInTheDocument();
		});
	});

	it('shows success message for duplicate email (silent)', async () => {
		vi.mocked(subscribeToWaitlist).mockResolvedValue({
			success: true,
			data: { email: 'dupe@example.com' },
		});

		render(<WaitlistForm />);
		await userEvent.type(
			screen.getByRole('textbox', { name: /email/i }),
			'dupe@example.com'
		);
		await userEvent.click(screen.getByRole('button', { name: /zapisz się/i }));

		await waitFor(() => {
			expect(screen.getByText(/zapisano/i)).toBeInTheDocument();
		});
	});

	it('shows error message on failure', async () => {
		vi.mocked(subscribeToWaitlist).mockResolvedValue({
			success: false,
			error: {
				code: 'DATABASE_ERROR',
				message: 'Nie udało się zapisać. Spróbuj ponownie.',
			},
		});

		render(<WaitlistForm />);
		await userEvent.type(
			screen.getByRole('textbox', { name: /email/i }),
			'test@example.com'
		);
		await userEvent.click(screen.getByRole('button', { name: /zapisz się/i }));

		await waitFor(() => {
			expect(screen.getByText(/nie udało się/i)).toBeInTheDocument();
		});
	});

	it('disables button while submitting', async () => {
		vi.mocked(subscribeToWaitlist).mockImplementation(
			() =>
				new Promise((resolve) =>
					setTimeout(
						() =>
							resolve({ success: true, data: { email: 'test@example.com' } }),
						100
					)
				)
		);

		render(<WaitlistForm />);
		await userEvent.type(
			screen.getByRole('textbox', { name: /email/i }),
			'test@example.com'
		);
		await userEvent.click(screen.getByRole('button', { name: /zapisz się/i }));

		expect(screen.getByRole('button')).toBeDisabled();
	});
});
