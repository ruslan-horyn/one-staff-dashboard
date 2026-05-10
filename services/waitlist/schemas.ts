import { z } from 'zod';

export const subscribeToWaitlistSchema = z.object({
	email: z
		.string()
		.email('Invalid email address')
		.max(254, 'Email is too long')
		.toLowerCase(),
	source: z.string().min(1).max(100).optional(),
});

export type SubscribeToWaitlistInput = z.infer<
	typeof subscribeToWaitlistSchema
>;
