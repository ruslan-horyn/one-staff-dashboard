import { z } from 'zod';

const envSchema = z.object({
	NEXT_PUBLIC_SUPABASE_URL: z.url(),
	NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
	NEXT_PUBLIC_SITE_URL: z.string().min(1),
});

const parsed = envSchema.safeParse({
	NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
	NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsed.success) {
	const treeifyError = z.treeifyError(parsed.error);
	const messages = treeifyError.errors.join(', ');
	console.error('Invalid environment variables:', messages);
	throw new Error(messages);
}

export const env = parsed.data;
