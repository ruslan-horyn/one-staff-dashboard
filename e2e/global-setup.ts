import type { FullConfig } from '@playwright/test';
import { validateE2EEnv } from '../lib/env/e2e';

/**
 * Global setup for E2E tests
 * Runs once before all tests to verify the test environment is ready
 */
async function globalSetup(config: FullConfig): Promise<void> {
	const result = validateE2EEnv({ throwOnError: false });

	if (!result.success) {
		const errors = result.errors.map((e) => `  - ${e}`).join('\n');
		throw new Error(`E2E environment validation failed:\n${errors}`);
	}

	console.log('\n--- E2E Test Environment ---');
	console.log(`Base URL: ${config.projects[0]?.use?.baseURL || 'not set'}`);
	console.log(`Supabase URL: ${result.data.SUPABASE_URL}`);
	console.log(`Test User: ${result.data.TEST_USER_EMAIL}`);
	console.log('----------------------------\n');
}

export default globalSetup;
