import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { getE2ESupabaseConfig } from './lib/env/e2e';

// Detect CI environment and load appropriate env file
const isCI = !!process.env.CI;
const envFile = isCI ? '.env.ci' : '.env.local';
dotenv.config({ path: path.resolve(__dirname, envFile), quiet: true });

// Get Supabase configuration using centralized helper
const { supabaseUrl, supabaseKey, siteUrl } = getE2ESupabaseConfig();

console.log(`E2E Environment: ${isCI ? 'CI/CD' : 'Local'}`);
console.log(`Using: ${envFile}`);

/**
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
	testDir: './e2e/tests',
	/* Run tests in files in parallel */
	fullyParallel: true,
	/* Fail the build on CI if you accidentally left test.only in the source code */
	forbidOnly: !!process.env.CI,
	/* Retry on CI only */
	retries: process.env.CI ? 2 : 0,
	/* Opt out of parallel tests on CI */
	workers: process.env.CI ? 1 : undefined,
	/* Reporter to use */
	reporter: [['html', { open: 'never' }], ['list']],
	/* Shared settings for all the projects below */
	use: {
		/* Base URL to use in actions like `await page.goto('/')` */
		baseURL: siteUrl,
		/* Collect trace when retrying the failed test */
		trace: 'on-first-retry',
		/* Take screenshot on failure */
		screenshot: 'only-on-failure',
	},

	/* Configure projects for major browsers - Chromium only per CLAUDE.md */
	projects: [
		/* Setup project for authentication state */
		{
			name: 'setup',
			testMatch: /auth\.setup\.ts/,
			testDir: './e2e',
		},
		/* Unauthenticated tests - auth flow tests that don't need pre-authentication */
		{
			name: 'chromium-unauthenticated',
			use: { ...devices['Desktop Chrome'] },
			testMatch: /auth\/.*\.spec\.ts/,
		},
		/* Authenticated tests - require login state from setup */
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				/* Use storage state from setup project for authenticated tests */
				storageState: 'e2e/.auth/user.json',
			},
			dependencies: ['setup'],
			testIgnore: /auth\/.*\.spec\.ts/,
		},
	],

	/* Run local dev server before starting the tests */
	webServer: {
		command: process.env.CI ? 'pnpm start' : 'pnpm dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		env: {
			// Pass resolved _DEV vars to Next.js with standard names
			NEXT_PUBLIC_SUPABASE_URL: supabaseUrl!,
			NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: supabaseKey!,
			NEXT_PUBLIC_SITE_URL: siteUrl,
		},
	},

	/* Global setup verification */
	globalSetup: './e2e/global-setup.ts',

	/* Output directories */
	outputDir: 'test-results/',
});
