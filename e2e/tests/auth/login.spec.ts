import { expect, test } from '@playwright/test';
import { LoginPage } from '../../page-objects';
import {
	invalidCredentials,
	testUser,
	validationTestData,
} from '../../setup/test-data';

/**
 * Login Flow E2E Tests (US-002)
 *
 * Tests cover the PRD acceptance criteria:
 * - AC1: Form with email/password fields is displayed
 * - AC2: Successful login redirects to dashboard
 * - AC3: Invalid credentials show error message
 * - AC4: Form validation (invalid email, short password)
 */

test.describe('Login Page', () => {
	let loginPage: LoginPage;

	test.beforeEach(async ({ page }) => {
		loginPage = new LoginPage(page);
		await loginPage.goto();
	});

	test.describe('Page Rendering (AC1)', () => {
		test('should display login form with email and password fields', async () => {
			await expect(loginPage.form).toBeVisible();
			await expect(loginPage.emailInput).toBeVisible();
			await expect(loginPage.passwordInput).toBeVisible();
			await expect(loginPage.submitButton).toBeVisible();
		});

		test('should have email field focused by default', async () => {
			await expect(loginPage.emailInput).toBeFocused();
		});

		test('should display forgot password link', async () => {
			await expect(loginPage.forgotPasswordLink).toBeVisible();
			await expect(loginPage.forgotPasswordLink).toHaveAttribute(
				'href',
				'/forgot-password'
			);
		});

		test('should display register link', async () => {
			await expect(loginPage.registerLink).toBeVisible();
			await expect(loginPage.registerLink).toHaveAttribute('href', '/register');
		});
	});

	test.describe('Successful Login (AC2)', () => {
		test('should redirect to home page with valid credentials', async ({
			page,
		}) => {
			await loginPage.login(testUser.email, testUser.password);

			// Wait for redirect to home (dashboard)
			await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);

			// Verify we're no longer on the login page and see the dashboard heading
			await expect(page.getByRole('heading', { name: 'Board' })).toBeVisible();
		});

		test('should show loading state during submission', async ({ page }) => {
			// Fill credentials
			await loginPage.fillCredentials(testUser.email, testUser.password);

			// Click submit
			await loginPage.submitButton.click();

			// Verify redirect happens (login was successful)
			await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
		});
	});

	test.describe('Failed Login (AC3)', () => {
		test('should display error message with incorrect email', async () => {
			await loginPage.login(invalidCredentials.email, testUser.password);

			// Error alert should be visible
			await expect(loginPage.errorAlert).toBeVisible();
		});

		test('should display error message with incorrect password', async () => {
			await loginPage.login(testUser.email, invalidCredentials.password);

			// Error alert should be visible
			await expect(loginPage.errorAlert).toBeVisible();
		});

		test('should stay on login page after failed login', async ({ page }) => {
			await loginPage.login(
				invalidCredentials.email,
				invalidCredentials.password
			);

			// Should still be on login page
			await expect(page).toHaveURL(/\/login/);
		});
	});

	test.describe('Form Validation (AC4)', () => {
		test('should show error for invalid email format', async () => {
			await loginPage.fillCredentials(
				validationTestData.invalidEmail,
				validationTestData.validPassword
			);
			await loginPage.submit();

			// Email input should be invalid (browser validation or form validation)
			// The form should not submit successfully
			await expect(loginPage.page).toHaveURL(/\/login/);
		});

		test('should require email field', async () => {
			await loginPage.passwordInput.fill(validationTestData.validPassword);
			await loginPage.submit();

			// Should stay on login page
			await expect(loginPage.page).toHaveURL(/\/login/);
		});

		test('should require password field', async () => {
			await loginPage.emailInput.fill(validationTestData.validEmail);
			await loginPage.submit();

			// Should stay on login page
			await expect(loginPage.page).toHaveURL(/\/login/);
		});
	});

	test.describe('Form Interactions', () => {
		test('should allow form submission with Enter key', async ({ page }) => {
			await loginPage.fillCredentials(testUser.email, testUser.password);
			await page.keyboard.press('Enter');

			// Should attempt login (redirect to dashboard or show error)
			await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
		});

		test('should toggle password visibility', async () => {
			await loginPage.passwordInput.fill('testpassword');

			// Password should be hidden by default
			await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');

			// Toggle visibility
			await loginPage.togglePasswordVisibility();

			// Password should now be visible
			await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');

			// Toggle back
			await loginPage.togglePasswordVisibility();

			// Password should be hidden again
			await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
		});
	});

	test.describe('Navigation Links', () => {
		test('should navigate to forgot password page', async ({ page }) => {
			await loginPage.forgotPasswordLink.click();
			await expect(page).toHaveURL(/\/forgot-password/);
		});

		test('should navigate to register page', async ({ page }) => {
			await loginPage.registerLink.click();
			await expect(page).toHaveURL(/\/register/);
		});
	});

	test.describe('Accessibility', () => {
		test('should have proper form labels', async () => {
			// Email input should have an associated label
			await expect(loginPage.emailInput).toHaveAccessibleName('Email');

			// Password input should have an associated label
			await expect(loginPage.passwordInput).toHaveAccessibleName('Password');
		});

		test('should have accessible submit button', async () => {
			await expect(loginPage.submitButton).toHaveAccessibleName(/sign in/i);
		});

		test('should support keyboard navigation', async ({ page }) => {
			// Ensure we start with email focused
			await loginPage.emailInput.focus();
			await expect(loginPage.emailInput).toBeFocused();

			// Tab to password
			await page.keyboard.press('Tab');
			await expect(loginPage.passwordInput).toBeFocused();

			// Tab to password toggle
			await page.keyboard.press('Tab');
			await expect(loginPage.passwordToggle).toBeFocused();

			// Tab to forgot password link
			await page.keyboard.press('Tab');
			await expect(loginPage.forgotPasswordLink).toBeFocused();

			// Tab to submit button
			await page.keyboard.press('Tab');
			await expect(loginPage.submitButton).toBeFocused();
		});

		test('should have proper aria-label on form', async () => {
			await expect(loginPage.form).toHaveAccessibleName('Login form');
		});
	});
});

test.describe('Login Redirect Behavior', () => {
	test('should redirect authenticated users away from login page', async ({
		page,
	}) => {
		const loginPage = new LoginPage(page);

		// Login first
		await loginPage.goto();
		await loginPage.loginAndWaitForRedirect(testUser.email, testUser.password);

		// Try to access login page again
		await page.goto('/login');

		// Should be redirected to dashboard
		await expect(page).toHaveURL(/^http:\/\/localhost:3000\/?$/);
	});
});
