import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Dashboard Page Object - encapsulates dashboard page interactions
 */
export class DashboardPage extends BasePage {
	// Main content
	readonly heading: Locator;
	readonly content: Locator;

	constructor(page: Page) {
		super(page);

		this.heading = page.getByRole('heading', { level: 1 });
		// Use specific selector - target the inner main element with class flex-1
		this.content = page.locator('main.flex-1');
	}

	/**
	 * Navigate to the dashboard (home page)
	 */
	async goto(): Promise<void> {
		await this.page.goto('/');
	}

	/**
	 * Check if the dashboard is visible
	 */
	async isVisible(): Promise<boolean> {
		return this.content.isVisible();
	}

	/**
	 * Get the main heading text
	 */
	async getHeadingText(): Promise<string> {
		return (await this.heading.textContent()) ?? '';
	}
}
