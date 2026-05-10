'use server';

import { headers } from 'next/headers';

import { createAction } from '@/services/shared/action-wrapper';
import {
	type SubscribeToWaitlistInput,
	subscribeToWaitlistSchema,
} from './schemas';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_CLEANUP_THRESHOLD = 1000;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function pruneExpiredRateLimitEntries(now: number): void {
	for (const [key, entry] of rateLimitStore) {
		if (entry.resetAt < now) rateLimitStore.delete(key);
	}
}

function isWithinRateLimit(clientKey: string): boolean {
	const now = Date.now();
	if (rateLimitStore.size > RATE_LIMIT_CLEANUP_THRESHOLD) {
		pruneExpiredRateLimitEntries(now);
	}
	const entry = rateLimitStore.get(clientKey);
	if (!entry || entry.resetAt < now) {
		rateLimitStore.set(clientKey, {
			count: 1,
			resetAt: now + RATE_LIMIT_WINDOW_MS,
		});
		return true;
	}
	if (entry.count >= RATE_LIMIT_MAX_REQUESTS) return false;
	entry.count += 1;
	return true;
}

async function getTrustedClientIp(): Promise<string> {
	const headersList = await headers();
	return headersList.get('x-real-ip') ?? 'unknown';
}

export const subscribeToWaitlist = createAction<
	SubscribeToWaitlistInput,
	{ email: string }
>(
	async ({ email, source }, { supabase }) => {
		const clientIp = await getTrustedClientIp();
		if (!isWithinRateLimit(clientIp)) {
			throw Object.assign(new Error('Too many requests, try again later'), {
				code: 'RATE_LIMIT',
			});
		}

		const { error } = await supabase
			.from('waitlist_subscribers')
			.insert({ email, source });

		if (error?.code === '23505') {
			return { email };
		}

		if (error) throw error;

		return { email };
	},
	{ schema: subscribeToWaitlistSchema, requireAuth: false }
);
