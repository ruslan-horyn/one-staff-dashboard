'use server';

import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from '@/services/shared/result';
import { subscribeToWaitlistSchema } from './schemas';

export async function subscribeToWaitlist(
	input: unknown
): Promise<ActionResult<{ email: string }>> {
	const parsed = subscribeToWaitlistSchema.safeParse(input);

	if (!parsed.success) {
		return {
			success: false,
			error: {
				code: 'VALIDATION_ERROR',
				message: parsed.error.issues[0]?.message ?? 'Nieprawidłowe dane',
			},
		};
	}

	const { email, source } = parsed.data;
	const supabase = await createClient();

	const { error } = await supabase
		.from('waitlist_subscribers')
		.insert({ email, source });

	// Silently succeed for duplicate emails — don't leak whether email is already registered
	if (error?.code === '23505') {
		return { success: true, data: { email } };
	}

	if (error) {
		return {
			success: false,
			error: {
				code: 'DATABASE_ERROR',
				message: 'Nie udało się zapisać. Spróbuj ponownie.',
			},
		};
	}

	return { success: true, data: { email } };
}
