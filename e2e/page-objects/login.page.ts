import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Login Page Object - encapsulates login page interactions
 * Uses semantic selectors based on the existing LoginForm component
 */
export class LoginPage extends BasePage {
	// Form elements
	readonly form: Locator;
	readonly emailInput: Locator;
	readonly passwordInput: Locator;
	readonly submitButton: Locator;

	// Links
	readonly forgotPasswordLink: Locator;
	readonly registerLink: Locator;

	// Alerts
	readonly errorAlert: Locator;
	readonly successAlert: Locator;

	// Password toggle
	readonly passwordToggle: Locator;

	constructor(page: Page) {
		super(page);

		// Form and inputs - use aria-label selector for form
		this.form = page.locator('form[aria-label="Login form"]');
		this.emailInput = page.getByLabel('Email');
		// Use placeholder to avoid matching the password toggle button
		this.passwordInput = page.getByPlaceholder('Enter your password');
		this.submitButton = page.getByRole('button', { name: /sign in/i });

		// Navigation links
		this.forgotPasswordLink = page.getByRole('link', {
			name: /forgot password/i,
		});
		this.registerLink = page.getByRole('link', {
			name: /create organization/i,
		});

		// Alerts - error uses text-destructive class, success uses border-green-500 class
		this.errorAlert = page.locator('[role="alert"].text-destructive');
		this.successAlert = page.locator('[role="alert"].border-green-500');

		// Password visibility toggle
		this.passwordToggle = page.getByRole('button', {
			name: /show password|hide password/i,
		});
	}

	/**
	 * Navigate to the login page
	 */
	async goto(): Promise<void> {
		await this.page.goto('/login');
	}

	/**
	 * Check if the login page is visible
	 */
	async isVisible(): Promise<boolean> {
		return this.form.isVisible();
	}

	/**
	 * Fill in login credentials
	 */
	async fillCredentials(email: string, password: string): Promise<void> {
		await this.emailInput.fill(email);
		await this.passwordInput.fill(password);
	}

	/**
	 * Submit the login form
	 */
	async submit(): Promise<void> {
		await this.submitButton.click();
	}

	/**
	 * Perform complete login flow
	 */
	async login(email: string, password: string): Promise<void> {
		await this.fillCredentials(email, password);
		await this.submit();
	}

	/**
	 * Login and wait for redirect to dashboard
	 */
	async loginAndWaitForRedirect(
		email: string,
		password: string
	): Promise<void> {
		await this.login(email, password);
		await this.page.waitForURL(/^http:\/\/localhost:3000\/?$/);
	}

	/**
	 * Get the error message text from the alert
	 */
	async getErrorMessage(): Promise<string> {
		await this.errorAlert.waitFor({ state: 'visible' });
		const consent = await this.errorAlert.textContent();
		return consent ?? '';
	}

	/**
	 * Check if the form is disabled (during submission)
	 */
	async isFormDisabled(): Promise<boolean> {
		return this.emailInput.isDisabled();
	}

	/**
	 * Check if submit button shows loading state
	 */
	async isSubmitButtonLoading(): Promise<boolean> {
		const buttonText = await this.submitButton.textContent();
		return buttonText?.toLowerCase().includes('signing in') ?? false;
	}

	/**
	 * Toggle password visibility
	 */
	async togglePasswordVisibility(): Promise<void> {
		await this.passwordToggle.click();
	}

	/**
	 * Check if password is visible (input type is text)
	 */
	async isPasswordVisible(): Promise<boolean> {
		const inputType = await this.passwordInput.getAttribute('type');
		return inputType === 'text';
	}

	/**
	 * Get validation message for email field
	 */
	async getEmailValidationMessage(): Promise<string> {
		const errorElement = this.page
			.locator('[id^="email"]')
			.locator('~ p[id*="message"]');
		if (await errorElement.isVisible()) {
			return (await errorElement.textContent()) ?? '';
		}
		return '';
	}

	/**
	 * Get validation message for password field
	 */
	async getPasswordValidationMessage(): Promise<string> {
		const errorElement = this.page
			.locator('[id^="password"]')
			.locator('~ p[id*="message"]');
		if (await errorElement.isVisible()) {
			return (await errorElement.textContent()) ?? '';
		}
		return '';
	}

	/**
	 * Navigate to login page with success message param
	 */
	async gotoWithMessage(message: string): Promise<void> {
		await this.page.goto(`/login?message=${encodeURIComponent(message)}`);
	}

	/**
	 * Navigate to login page with app error param
	 */
	async gotoWithError(errorCode: string): Promise<void> {
		await this.page.goto(`/login?error=${encodeURIComponent(errorCode)}`);
	}

	/**
	 * Navigate to login page with Supabase error params
	 */
	async gotoWithSupabaseError(
		errorCode: string,
		errorDescription?: string
	): Promise<void> {
		const params = new URLSearchParams({
			error: 'access_denied',
			error_code: errorCode,
		});
		if (errorDescription) {
			params.set('error_description', errorDescription);
		}
		await this.page.goto(`/login?${params.toString()}`);
	}

	/**
	 * Get success alert message text
	 */
	async getSuccessMessage(): Promise<string> {
		await this.successAlert.waitFor({ state: 'visible' });
		return (await this.successAlert.textContent()) ?? '';
	}

	/**
	 * Check if success alert is visible
	 */
	async isSuccessAlertVisible(): Promise<boolean> {
		return this.successAlert.isVisible();
	}

	/**
	 * Check if error alert is visible
	 */
	async isErrorAlertVisible(): Promise<boolean> {
		return this.errorAlert.isVisible();
	}
}
