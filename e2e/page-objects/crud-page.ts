import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface CrudPageConfig {
	/** Page heading text, e.g. 'Clients' */
	heading: string;
	/** data-testid for the Add button, e.g. 'add-client' */
	addButtonTestId: string;
	/** Search placeholder text, e.g. 'Search clients...' */
	searchPlaceholder: string;
	/** Route path, e.g. '/clients' */
	route: string;
}

/**
 * Base class for CRUD module page objects.
 * Uses data-testid for interactive elements, getByRole for semantic elements.
 */
export abstract class CrudPage extends BasePage {
	readonly config: CrudPageConfig;

	// Semantic elements (getByRole)
	readonly heading: Locator;
	readonly table: Locator;
	readonly formDialog: Locator;
	readonly formDialogTitle: Locator;
	readonly deleteDialog: Locator;

	// Interactive elements (getByTestId)
	readonly addButton: Locator;
	readonly submitButton: Locator;
	readonly cancelButton: Locator;
	readonly confirmDeleteButton: Locator;
	readonly cancelDeleteButton: Locator;
	readonly searchInput: Locator;

	// Empty state
	readonly emptyState: Locator;

	constructor(page: Page, config: CrudPageConfig) {
		super(page);
		this.config = config;

		// Semantic selectors
		this.heading = page.getByRole('heading', {
			name: config.heading,
			level: 1,
		});
		this.table = page.getByRole('table');
		this.formDialog = page.getByRole('dialog');
		this.formDialogTitle = this.formDialog.getByRole('heading');
		this.deleteDialog = page.getByRole('alertdialog');

		// TestId selectors
		this.addButton = page.getByTestId(config.addButtonTestId).first();
		this.submitButton = this.formDialog.getByTestId('submit-button');
		this.cancelButton = this.formDialog.getByTestId('cancel-button');
		this.confirmDeleteButton = this.deleteDialog.getByTestId('confirm-delete');
		this.cancelDeleteButton = this.deleteDialog.getByRole('button', {
			name: /cancel/i,
		});
		this.searchInput = page.getByTestId('search-input');

		// Empty state — content-based (OK for verification)
		this.emptyState = page.getByText(/no .+ found/i);
	}

	async goto(): Promise<void> {
		await this.page.goto(this.config.route);
	}

	async isVisible(): Promise<boolean> {
		return this.heading.isVisible();
	}

	// --- Dialog interactions ---

	async openCreateDialog(): Promise<void> {
		await this.addButton.click();
		await this.formDialog.waitFor({ state: 'visible' });
	}

	async submitForm(): Promise<void> {
		await this.submitButton.click();
		await Promise.any([
			this.formDialog.waitFor({ state: 'hidden' }),
			expect(this.submitButton).toBeEnabled(),
		]);
	}

	async closeFormDialog(): Promise<void> {
		await this.cancelButton.click();
		await this.formDialog.waitFor({ state: 'hidden' });
	}

	// --- Row actions ---

	async openRowActions(name: string): Promise<void> {
		const row = this.getRow(name);
		await row.getByTestId('row-actions').click();
	}

	async editItem(name: string): Promise<void> {
		await this.openRowActions(name);
		await this.page.getByRole('menuitem', { name: /edit/i }).click();
		await this.formDialog.waitFor({ state: 'visible' });
	}

	async deleteItem(name: string): Promise<void> {
		await this.openRowActions(name);
		await this.page.getByRole('menuitem', { name: /delete/i }).click();
		await this.deleteDialog.waitFor({ state: 'visible' });
	}

	async confirmDelete(): Promise<void> {
		await this.confirmDeleteButton.click();
	}

	async cancelDelete(): Promise<void> {
		await this.cancelDeleteButton.click();
	}

	// --- Search ---

	async searchItems(query: string): Promise<void> {
		await this.searchInput.clear();
		await this.searchInput.fill(query);
		await expect(this.searchInput).toHaveValue(query);
		if (query.length >= 3) {
			await this.page.waitForURL(
				(url) => url.searchParams.get('search') === query
			);
			await this.waitForTableLoad();
		}
	}

	async clearSearch(): Promise<void> {
		const clearButton = this.page.getByRole('button', {
			name: /clear search/i,
		});
		if (await clearButton.isVisible()) {
			await clearButton.click();
		} else {
			await this.searchInput.clear();
		}
		await expect(this.searchInput).toHaveValue('');
		await this.page.waitForURL((url) => !url.searchParams.has('search'));
		await this.waitForTableLoad();
	}

	// --- Table helpers ---

	getRow(name: string): Locator {
		return this.table.getByRole('row').filter({ hasText: name }).first();
	}

	getColumnHeaders(): Locator {
		return this.table.getByRole('columnheader');
	}

	async getTableRowCount(): Promise<number> {
		return this.table.locator('tbody tr').count();
	}

	async waitForTableLoad(): Promise<void> {
		await Promise.race([
			this.table.waitFor({ state: 'visible' }).catch(() => {}),
			this.emptyState.waitFor({ state: 'visible' }).catch(() => {}),
		]);
	}

	// --- Toast ---

	async waitForToast(message: string | RegExp): Promise<void> {
		const toast = this.page.locator('[data-sonner-toast]', {
			hasText: message,
		});
		await toast.waitFor({ state: 'visible' });
	}

	// --- Form validation ---

	getFieldError(fieldName: string): Locator {
		const formItem = this.formDialog.locator('[data-slot="form-item"]', {
			has: this.page.getByLabel(fieldName),
		});
		return formItem.locator('[data-slot="form-message"]');
	}
}
