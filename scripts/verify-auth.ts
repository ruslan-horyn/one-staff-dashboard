/**
 * Verifies E2E test user can authenticate
 * Usage: pnpm verify:auth
 */
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { validateE2EEnv } from '../lib/env/e2e';

// Load environment variables based on CI detection
const isCI = !!process.env.CI;
const envFile = isCI ? '.env.ci' : '.env.local';
dotenv.config({ path: path.resolve(__dirname, '..', envFile), quiet: true });

async function verifyAuth() {
	// Validate E2E environment with defaults allowed for local development
	const result = validateE2EEnv({
		allowDefaults: !isCI,
		throwOnError: false,
	});

	if (!result.success) {
		for (const error of result.errors) {
			console.error(`✗ ${error}`);
		}
		process.exit(1);
	}

	const { SUPABASE_URL, SUPABASE_KEY, TEST_USER_EMAIL, TEST_USER_PASSWORD } =
		result.data;

	console.log(`Verifying E2E test user: ${TEST_USER_EMAIL}`);
	console.log(`Supabase URL: ${SUPABASE_URL}`);

	const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
		auth: { autoRefreshToken: false, persistSession: false },
	});

	const { data, error } = await supabase.auth.signInWithPassword({
		email: TEST_USER_EMAIL,
		password: TEST_USER_PASSWORD,
	});

	if (error) {
		console.error(`✗ Failed to sign in: ${error.message}`);
		console.error('');
		console.error('Make sure the test user exists in your database.');
		process.exit(1);
	}

	console.log(`✓ Test user verified: ${data.user.email}`);
	await supabase.auth.signOut();
}

verifyAuth();
