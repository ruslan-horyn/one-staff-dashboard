'use server';

import { headers } from 'next/headers';

import { createAction } from '@/services/shared/action-wrapper';
import {
	type SubscribeToWaitlistInput,
	subscribeToWaitlistSchema,
} from './schemas';

// In-memory IP-based rate limiter (best-effort; resets on serverless cold start).
// Sized for waitlist abuse prevention, not strong DDoS protection.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const entry = rateLimitStore.get(ip);
	if (!entry || entry.resetAt < now) {
		rateLimitStore.set(ip, {
			count: 1,
			resetAt: now + RATE_LIMIT_WINDOW_MS,
		});
		return true;
	}
	if (entry.count >= RATE_LIMIT_MAX_REQUESTS) return false;
	entry.count += 1;
	return true;
}

async function getClientIp(): Promise<string> {
	const headersList = await headers();
	const forwardedFor = headersList.get('x-forwarded-for');
	if (forwardedFor) return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
	return headersList.get('x-real-ip') ?? 'unknown';
}

export const subscribeToWaitlist = createAction<
	SubscribeToWaitlistInput,
	{ email: string }
>(
	async ({ email, source }, { supabase }) => {
		const ip = await getClientIp();
		if (!checkRateLimit(ip)) {
			throw Object.assign(new Error('Too many requests, try again later'), {
				code: 'RATE_LIMIT',
			});
		}

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
