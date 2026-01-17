import type { FullConfig } from '@playwright/test';
import { z } from 'zod';

const e2eEnvSchema = z.object({
	NEXT_PUBLIC_SUPABASE_URL: z.url().min(1),
	NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: z.string().min(1),
	E2E_TEST_USER_EMAIL: z.email().min(1),
	E2E_TEST_USER_PASSWORD: z.string().min(1),
});

/**
 * Global setup for E2E tests
 * Runs once before all tests to verify the test environment is ready
 */
async function globalSetup(config: FullConfig): Promise<void> {
	const result = e2eEnvSchema.safeParse(process.env);

	if (!result.success) {
		const errors = result.error.issues
			.map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
			.join('\n');
		throw new Error(`E2E environment validation failed:\n${errors}`);
	}

	console.log('\n--- E2E Test Environment ---');
	console.log(`Base URL: ${config.projects[0]?.use?.baseURL || 'not set'}`);
	console.log(`Supabase URL: ${result.data.NEXT_PUBLIC_SUPABASE_URL}`);
	console.log(`Test User: ${result.data.E2E_TEST_USER_EMAIL}`);
	console.log('----------------------------\n');
}

export default globalSetup;
