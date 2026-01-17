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

	// Error display
	readonly errorAlert: Locator;

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

		// Error alert
		this.errorAlert = page.getByRole('alert');

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
}
