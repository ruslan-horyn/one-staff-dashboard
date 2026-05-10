import { expect, test as setup } from '@playwright/test';
import { routes } from '@/lib/routes';
import { testUser } from './setup/test-data';
import { escapeRegExp } from './utils/regex';

const authStateFile = 'e2e/.auth/user.json';

setup('authenticate', async ({ page }) => {
	await page.goto(routes.login);

	await page.getByLabel('Email').fill(testUser.email);
	await page.getByPlaceholder('Enter your password').fill(testUser.password);

	await page.getByRole('button', { name: /sign in/i }).click();

	await expect(page).toHaveURL(new RegExp(`${escapeRegExp(routes.board)}$`));
	await page.waitForLoadState('networkidle');

	await page.context().storageState({ path: authStateFile });
});
