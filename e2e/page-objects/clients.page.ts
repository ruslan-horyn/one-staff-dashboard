import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

interface ClientFormData {
	name?: string;
	email?: string;
	phone?: string;
	address?: string;
}

/**
 * Clients Page Object - encapsulates clients page interactions
 * Uses semantic accessibility selectors following project patterns
 */
export class ClientsPage extends BasePage {
	// Page elements
	readonly heading: Locator;
	readonly addClientButton: Locator;
	readonly searchInput: Locator;
	readonly table: Locator;

	// Form dialog elements
	readonly formDialog: Locator;
	readonly formDialogTitle: Locator;
	readonly nameInput: Locator;
	readonly emailInput: Locator;
	readonly phoneInput: Locator;
	readonly addressInput: Locator;
	readonly submitButton: Locator;
	readonly cancelButton: Locator;

	// Delete dialog elements
	readonly deleteDialog: Locator;
	readonly confirmDeleteButton: Locator;
	readonly cancelDeleteButton: Locator;

	// Empty state
	readonly emptyStateTitle: Locator;

	constructor(page: Page) {
		super(page);

		// Page elements
		this.heading = page.getByRole('heading', { name: 'Clients', level: 1 });
		// Use first() as there are two buttons: toolbar and empty state
		this.addClientButton = page
			.getByRole('button', { name: /add client/i })
			.first();
		this.searchInput = page.getByPlaceholder('Search clients...');
		this.table = page.getByRole('table');

		// Form dialog elements
		this.formDialog = page.getByRole('dialog');
		this.formDialogTitle = this.formDialog.getByRole('heading');
		// Scope form inputs to dialog to avoid conflicts
		this.nameInput = this.formDialog.getByLabel('Name');
		this.emailInput = this.formDialog.getByLabel('Email');
		this.phoneInput = this.formDialog.getByLabel('Phone');
		this.addressInput = this.formDialog.getByLabel('Address');
		this.submitButton = this.formDialog.getByRole('button', {
			name: /add client|save changes/i,
		});
		this.cancelButton = this.formDialog.getByRole('button', {
			name: /cancel/i,
		});

		// Delete dialog elements
		this.deleteDialog = page.getByRole('alertdialog');
		this.confirmDeleteButton = this.deleteDialog.getByRole('button', {
			name: /^delete$/i,
		});
		this.cancelDeleteButton = this.deleteDialog.getByRole('button', {
			name: /cancel/i,
		});

		// Empty state
		this.emptyStateTitle = page.getByText('No clients found');
	}

	/**
	 * Navigate to the clients page
	 */
	async goto(): Promise<void> {
		await this.page.goto('/clients');
	}

	/**
	 * Check if the clients page is visible
	 */
	async isVisible(): Promise<boolean> {
		return this.heading.isVisible();
	}

	/**
	 * Open the create client dialog
	 */
	async openCreateDialog(): Promise<void> {
		await this.addClientButton.click();
		await this.formDialog.waitFor({ state: 'visible' });
	}

	/**
	 * Fill the client form fields
	 */
	async fillClientForm(data: ClientFormData): Promise<void> {
		if (data.name !== undefined) {
			await this.nameInput.fill(data.name);
		}
		if (data.email !== undefined) {
			await this.emailInput.fill(data.email);
		}
		if (data.phone !== undefined) {
			await this.phoneInput.fill(data.phone);
		}
		if (data.address !== undefined) {
			await this.addressInput.fill(data.address);
		}
	}

	/**
	 * Submit the form and wait for response
	 * Waits for either the dialog to close (success) or the button to re-enable (error)
	 */
	async submitForm(): Promise<void> {
		await this.submitButton.click();
		await Promise.any([
			this.formDialog.waitFor({ state: 'hidden' }),
			expect(this.submitButton).toBeEnabled(),
		]);
	}

	/**
	 * Search for clients
	 * Note: Search requires minimum 3 characters to trigger
	 */
	async searchClients(query: string): Promise<void> {
		// Clear first to reset any previous search
		await this.searchInput.clear();
		await this.searchInput.fill(query);
		// Wait for input to have the value
		await expect(this.searchInput).toHaveValue(query);
		// Only wait for URL update if query meets minimum (3 chars)
		if (query.length >= 3) {
			await this.page.waitForURL(
				(url) => url.searchParams.get('search') === query
			);
			// Wait for table to reload
			await this.waitForTableLoad();
		}
	}

	/**
	 * Clear search input
	 */
	async clearSearch(): Promise<void> {
		// Click the clear button if visible, otherwise clear manually
		const clearButton = this.page.getByRole('button', {
			name: /clear search/i,
		});
		if (await clearButton.isVisible()) {
			await clearButton.click();
		} else {
			await this.searchInput.clear();
		}
		// Wait for input to be empty
		await expect(this.searchInput).toHaveValue('');
		// Wait for URL to not have search param
		await this.page.waitForURL((url) => !url.searchParams.has('search'));
		// Wait for table to reload
		await this.waitForTableLoad();
	}

	/**
	 * Open the row actions dropdown for a specific client
	 * Uses .first() to handle cases where multiple clients have the same name
	 */
	async openRowActions(clientName: string): Promise<void> {
		const actionsButton = this.page
			.getByRole('button', {
				name: `Actions for ${clientName}`,
			})
			.first();
		await actionsButton.click();
	}

	/**
	 * Open edit dialog for a client
	 */
	async editClient(clientName: string): Promise<void> {
		await this.openRowActions(clientName);
		await this.page.getByRole('menuitem', { name: /edit/i }).click();
		await this.formDialog.waitFor({ state: 'visible' });
	}

	/**
	 * Open delete dialog for a client
	 */
	async deleteClient(clientName: string): Promise<void> {
		await this.openRowActions(clientName);
		await this.page.getByRole('menuitem', { name: /delete/i }).click();
		await this.deleteDialog.waitFor({ state: 'visible' });
	}

	/**
	 * Confirm deletion in the delete dialog
	 */
	async confirmDelete(): Promise<void> {
		await this.confirmDeleteButton.click();
	}

	/**
	 * Cancel deletion in the delete dialog
	 */
	async cancelDelete(): Promise<void> {
		await this.cancelDeleteButton.click();
	}

	/**
	 * Get a table row by client name
	 * Uses .first() to handle cases where multiple clients have the same name
	 */
	getClientRow(clientName: string): Locator {
		return this.table.getByRole('row').filter({ hasText: clientName }).first();
	}

	/**
	 * Check if a client is visible in the table
	 */
	async isClientVisible(clientName: string): Promise<boolean> {
		const row = this.getClientRow(clientName);
		return row.isVisible();
	}

	/**
	 * Wait for the table to be loaded
	 */
	async waitForTableLoad(): Promise<void> {
		// Wait for either the table or empty state to be visible
		await Promise.race([
			this.table.waitFor({ state: 'visible' }).catch(() => {}),
			this.emptyStateTitle.waitFor({ state: 'visible' }).catch(() => {}),
		]);
	}

	/**
	 * Get the form validation error message for a field
	 */
	getFieldError(fieldName: string): Locator {
		// FormMessage uses data-slot="form-message" and text-destructive class
		const formItem = this.formDialog.locator('[data-slot="form-item"]', {
			has: this.page.getByLabel(fieldName),
		});
		return formItem.locator('[data-slot="form-message"]');
	}

	/**
	 * Wait for toast message (Sonner toast component)
	 */
	async waitForToast(message: string | RegExp): Promise<void> {
		// Target Sonner toast specifically using its data attribute
		const toast = this.page.locator('[data-sonner-toast]', {
			hasText: message,
		});
		await toast.waitFor({ state: 'visible' });
	}

	/**
	 * Close form dialog by clicking cancel
	 */
	async closeFormDialog(): Promise<void> {
		await this.cancelButton.click();
		await this.formDialog.waitFor({ state: 'hidden' });
	}

	/**
	 * Get all column headers
	 */
	getColumnHeaders(): Locator {
		return this.table.getByRole('columnheader');
	}

	/**
	 * Get sort button in a column header
	 */
	getSortButton(columnName: string): Locator {
		return this.table
			.getByRole('columnheader', { name: columnName })
			.getByRole('button');
	}

	/**
	 * Click to sort by column
	 */
	async clickSort(columnName: string): Promise<void> {
		await this.getSortButton(columnName).click();
		// Wait for table to reload with sorted data
		await this.page.waitForTimeout(300);
	}

	/**
	 * Get pagination container
	 */
	get paginationContainer(): Locator {
		return this.page.locator('[data-testid="pagination"]');
	}

	/**
	 * Get pagination info text (e.g., "Page 1 of 5")
	 */
	async getPaginationInfo(): Promise<string | null> {
		const info = this.page.getByText(/Page \d+ of \d+/);
		return info.textContent();
	}

	/**
	 * Navigate to next page
	 */
	async goToNextPage(): Promise<void> {
		const nextButton = this.page.getByRole('button', { name: /next/i });
		await nextButton.click();
		await this.waitForTableLoad();
	}

	/**
	 * Navigate to previous page
	 */
	async goToPreviousPage(): Promise<void> {
		const prevButton = this.page.getByRole('button', { name: /previous/i });
		await prevButton.click();
		await this.waitForTableLoad();
	}

	/**
	 * Check if next page button is enabled
	 */
	async isNextPageEnabled(): Promise<boolean> {
		const nextButton = this.page.getByRole('button', { name: /next/i });
		return nextButton.isEnabled();
	}

	/**
	 * Check if previous page button is enabled
	 */
	async isPreviousPageEnabled(): Promise<boolean> {
		const prevButton = this.page.getByRole('button', { name: /previous/i });
		return prevButton.isEnabled();
	}

	/**
	 * Get all client names from current page
	 */
	async getClientNames(): Promise<string[]> {
		const rows = this.table.locator('tbody tr');
		const count = await rows.count();
		const names: string[] = [];
		for (let i = 0; i < count; i++) {
			const name = await rows.nth(i).locator('td').first().textContent();
			if (name) names.push(name);
		}
		return names;
	}

	/**
	 * Get toast element
	 */
	getToast(): Locator {
		return this.page.locator('[data-sonner-toast]');
	}

	/**
	 * Dismiss toast by clicking close button
	 */
	async dismissToast(): Promise<void> {
		const closeButton = this.getToast().getByRole('button', { name: /close/i });
		if (await closeButton.isVisible()) {
			await closeButton.click();
		}
	}

	/**
	 * Close form dialog by clicking X button
	 */
	async closeFormDialogWithXButton(): Promise<void> {
		const closeButton = this.formDialog.getByRole('button', { name: /close/i });
		await closeButton.click();
		await this.formDialog.waitFor({ state: 'hidden' });
	}

	/**
	 * Get total row count in current table
	 */
	async getTableRowCount(): Promise<number> {
		const rows = this.table.locator('tbody tr');
		return rows.count();
	}

	/**
	 * Check if form dialog has validation errors
	 */
	async hasValidationErrors(): Promise<boolean> {
		const errors = this.formDialog.locator('[data-slot="form-message"]');
		const count = await errors.count();
		return count > 0;
	}

	/**
	 * Get all visible validation error messages
	 */
	async getValidationErrors(): Promise<string[]> {
		const errors = this.formDialog.locator('[data-slot="form-message"]');
		const count = await errors.count();
		const messages: string[] = [];
		for (let i = 0; i < count; i++) {
			const text = await errors.nth(i).textContent();
			if (text) messages.push(text);
		}
		return messages;
	}
}
