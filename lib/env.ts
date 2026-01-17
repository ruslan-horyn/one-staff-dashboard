import { z } from 'zod';

const envSchema = z.object({
	NEXT_PUBLIC_SUPABASE_URL: z.url(),
	NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().min(1),
	NEXT_PUBLIC_SITE_URL: z.string().min(1),
});

const parsed = envSchema.safeParse({
	NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
	NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
		process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
	NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsed.success) {
	const formattedErrors = parsed.error.issues
		.map((issue) => `${issue.path.join('.')}: ${issue.message}`)
		.join('\n  ');

	throw new Error(
		`Invalid environment variables:\n formattedErrors${formattedErrors}`
	);
}

export const env = parsed.data;
