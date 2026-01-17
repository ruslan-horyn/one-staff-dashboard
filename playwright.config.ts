import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

// Detect CI environment and load appropriate env file
const isCI = !!process.env.CI;
const envFile = isCI ? '.env.test.ci' : '.env.local';
dotenv.config({ path: path.resolve(__dirname, envFile), quiet: true });

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
		baseURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
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
		command: 'pnpm dev',
		url: 'http://localhost:3000',
		reuseExistingServer: !process.env.CI,
		timeout: 120000,
		env: {
			NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
			NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
				process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!,
			NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL!,
		},
	},

	/* Global setup verification */
	globalSetup: './e2e/global-setup.ts',

	/* Output directories */
	outputDir: 'test-results/',
});
