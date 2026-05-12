'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useId, useState } from 'react';
import { useForm } from 'react-hook-form';

import { subscribeToWaitlist } from '@/services/waitlist/actions';
import {
	type SubscribeToWaitlistInput,
	subscribeToWaitlistSchema,
} from '@/services/waitlist/schemas';

interface WaitlistFormProps {
	source?: string;
	className?: string;
}

export const WaitlistForm = ({
	source = 'form',
	className,
}: WaitlistFormProps) => {
	const [isSuccess, setIsSuccess] = useState(false);
	const emailId = useId();
	const errorId = useId();

	const {
		register,
		handleSubmit,
		setError,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm<SubscribeToWaitlistInput>({
		resolver: zodResolver(subscribeToWaitlistSchema),
		defaultValues: { email: '', source },
	});

	const onSubmit = async (data: SubscribeToWaitlistInput) => {
		clearErrors('email');
		const result = await subscribeToWaitlist(data);

		if (result.success) {
			setIsSuccess(true);
		} else {
			setError('email', { message: result.error.message });
		}
	};

	if (isSuccess) {
		return (
			<p className={className}>
				You&apos;re on the list! We&apos;ll let you know when we launch.
			</p>
		);
	}

	return (
		<form onSubmit={handleSubmit(onSubmit)} className={className}>
			<label htmlFor={emailId} className="sr-only">
				Email
			</label>
			<input
				id={emailId}
				type="email"
				placeholder="your@email.com"
				disabled={isSubmitting}
				aria-invalid={!!errors.email}
				aria-describedby={errors.email ? errorId : undefined}
				data-testid="waitlist-email-input"
				{...register('email')}
			/>
			<button
				type="submit"
				disabled={isSubmitting}
				data-testid="waitlist-submit-button"
			>
				{isSubmitting ? 'Saving...' : 'Join waitlist'}
			</button>
			{errors.email && (
				<p id={errorId} role="alert" data-testid="waitlist-error-alert">
					{errors.email.message}
				</p>
			)}
			<p>
				We process your data in accordance with our{' '}
				<Link href="/privacy" data-testid="waitlist-privacy-link">
					Privacy Policy
				</Link>
				.
			</p>
		</form>
	);
};
