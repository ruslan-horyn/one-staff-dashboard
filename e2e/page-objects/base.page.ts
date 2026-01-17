import type { Page } from '@playwright/test';

/**
 * Base page class providing common functionality for all page objects
 */
export abstract class BasePage {
	readonly page: Page;

	constructor(page: Page) {
		this.page = page;
	}

	/**
	 * Navigate to the page URL
	 */
	abstract goto(): Promise<void>;

	/**
	 * Check if the page is currently visible/loaded
	 */
	abstract isVisible(): Promise<boolean>;

	/**
	 * Wait for the page to be fully loaded
	 */
	async waitForLoad(): Promise<void> {
		await this.page.waitForLoadState('networkidle');
	}

	/**
	 * Get current page URL
	 */
	getCurrentUrl(): string {
		return this.page.url();
	}

	/**
	 * Get page title
	 */
	async getTitle(): Promise<string> {
		return this.page.title();
	}
}
