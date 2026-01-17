import { expect, test as setup } from '@playwright/test';
import { testUser } from './setup/test-data';

const authFile = 'e2e/.auth/user.json';

/**
 * Authentication setup - runs before tests that require logged-in state
 * Saves authentication state to file for reuse across tests
 */
setup('authenticate', async ({ page }) => {
	// Navigate to login page
	await page.goto('/login');

	// Fill in credentials
	await page.getByLabel('Email').fill(testUser.email);
	await page.getByPlaceholder('Enter your password').fill(testUser.password);

	// Submit form
	await page.getByRole('button', { name: /sign in/i }).click();

	// Wait for redirect to home (successful login)
	await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);

	// Save signed-in state to file
	await page.context().storageState({ path: authFile });
});
