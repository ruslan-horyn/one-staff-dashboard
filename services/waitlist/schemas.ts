import { z } from 'zod';

export const subscribeToWaitlistSchema = z.object({
	email: z.string().email('Nieprawidłowy adres email'),
	source: z.string().max(100).optional(),
});

export type SubscribeToWaitlistInput = z.infer<
	typeof subscribeToWaitlistSchema
>;
