/**
 * Test script for verifying seeded users authentication
 * Run with: pnpm test:auth
 */

import { config } from 'dotenv';

// Load .env.local before importing env module
config({ path: '.env.local' });

async function main() {
	// Dynamic import after dotenv is loaded
	const { env } = await import('@/lib/env');
	const { createClient } = await import('@supabase/supabase-js');

	const TEST_USERS = [
		{ email: 'admin@test.com', password: 'password123', expectedRole: 'admin' },
		{
			email: 'coordinator@test.com',
			password: 'password123',
			expectedRole: 'coordinator',
		},
	];

	console.log('Testing Supabase Authentication with Seeded Users\n');
	console.log('Supabase URL:', env.NEXT_PUBLIC_SUPABASE_URL);
	console.log('-------------------------------------------\n');

	const supabase = createClient(
		env.NEXT_PUBLIC_SUPABASE_URL,
		env.NEXT_PUBLIC_SUPABASE_ANON_KEY
	);

	// First, check if we can query public tables (as anon)
	console.log('Testing database connection...');
	const { error: connError } = await supabase
		.from('profiles')
		.select('id')
		.limit(1);
	if (connError) {
		console.log(
			`  DB connection test: ${connError.message} (expected - RLS blocks anon)`
		);
	} else {
		console.log('  DB connection test: OK');
	}
	console.log('');

	for (const user of TEST_USERS) {
		console.log(`Testing: ${user.email}`);

		// Sign in
		const { data: authData, error: authError } =
			await supabase.auth.signInWithPassword({
				email: user.email,
				password: user.password,
			});

		if (authError) {
			console.log(`  [FAIL] Sign-in error: ${authError.message}`);
			console.log(`  [FAIL] Error code: ${authError.code}`);
			console.log(`  [FAIL] Error status: ${authError.status}\n`);
			continue;
		}

		console.log(`  [OK] Signed in successfully`);
		console.log(`  [OK] User ID: ${authData.user.id}`);

		// Fetch profile
		const { data: profile, error: profileError } = await supabase
			.from('profiles')
			.select('id, first_name, last_name, role')
			.eq('id', authData.user.id)
			.single();

		if (profileError) {
			console.log(`  [FAIL] Profile fetch error: ${profileError.message}\n`);
		} else {
			console.log(`  [OK] Profile: ${profile.first_name} ${profile.last_name}`);

			if (profile.role === user.expectedRole) {
				console.log(
					`  [OK] Role: ${profile.role} (expected: ${user.expectedRole})`
				);
			} else {
				console.log(
					`  [FAIL] Role mismatch: ${profile.role} (expected: ${user.expectedRole})`
				);
			}
		}

		// Sign out
		await supabase.auth.signOut();
		console.log(`  [OK] Signed out\n`);
	}

	console.log('-------------------------------------------');
	console.log('Auth test complete!');
}

main().catch(console.error);
