/**
 * Verifies E2E test user can authenticate
 * Usage: pnpm verify:auth
 */
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables based on CI detection
const isCI = !!process.env.CI;
const envFile = isCI ? '.env.test.ci' : '.env.local';
dotenv.config({ path: path.resolve(__dirname, '..', envFile), quiet: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

// Use same defaults as e2e/setup/test-data.ts
const TEST_USER = {
	email: process.env.E2E_TEST_USER_EMAIL || 'admin@test.com',
	password: process.env.E2E_TEST_USER_PASSWORD || 'password123',
};

async function verifyAuth() {
	if (!SUPABASE_URL) {
		console.error('✗ NEXT_PUBLIC_SUPABASE_URL is not set');
		process.exit(1);
	}

	if (!SUPABASE_KEY) {
		console.error('✗ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY is not set');
		process.exit(1);
	}

	console.log(`Verifying E2E test user: ${TEST_USER.email}`);
	console.log(`Supabase URL: ${SUPABASE_URL}`);

	const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
		auth: { autoRefreshToken: false, persistSession: false },
	});

	const { data, error } = await supabase.auth.signInWithPassword({
		email: TEST_USER.email,
		password: TEST_USER.password,
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
