'use client';

import Link from 'next/link';
import { useState } from 'react';
import { subscribeToWaitlist } from '@/services/waitlist/actions';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface WaitlistFormProps {
	source?: string;
	className?: string;
}

export const WaitlistForm = ({
	source = 'form',
	className,
}: WaitlistFormProps) => {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState<Status>('idle');
	const [errorMessage, setErrorMessage] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setStatus('loading');

		const result = await subscribeToWaitlist({ email, source });

		if (result.success) {
			setStatus('success');
		} else {
			setStatus('error');
			setErrorMessage(result.error.message);
		}
	};

	if (status === 'success') {
		return <p className={className}>Zapisano! Damy Ci znać, gdy ruszymy.</p>;
	}

	return (
		<form onSubmit={handleSubmit} className={className}>
			<label htmlFor="waitlist-email" className="sr-only">
				Email
			</label>
			<input
				id="waitlist-email"
				type="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				placeholder="twoj@email.com"
				required
			/>
			<button type="submit" disabled={status === 'loading'}>
				{status === 'loading' ? 'Zapisywanie...' : 'Zapisz się'}
			</button>
			{status === 'error' && <p role="alert">{errorMessage}</p>}
			<p>
				Twoje dane przetwarzamy zgodnie z{' '}
				<Link href="/privacy">Polityką prywatności</Link>.
			</p>
		</form>
	);
};
