'use server';

import { createAction } from '@/services/shared/action-wrapper';
import {
	type SubscribeToWaitlistInput,
	subscribeToWaitlistSchema,
} from './schemas';

export const subscribeToWaitlist = createAction<
	SubscribeToWaitlistInput,
	{ email: string }
>(
	async ({ email, source }, { supabase }) => {
		const { error } = await supabase
			.from('waitlist_subscribers')
			.insert({ email, source });

		// Silently succeed for duplicate emails — don't leak whether email is already registered
		if (error?.code === '23505') {
			return { email };
		}

		if (error) throw error;

		return { email };
	},
	{ schema: subscribeToWaitlistSchema, requireAuth: false }
);
