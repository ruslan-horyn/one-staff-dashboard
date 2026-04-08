import type { Locator, Page } from '@playwright/test';
import { CrudPage } from './crud-page';

interface ClientFormData {
	name?: string;
	email?: string;
	phone?: string;
	address?: string;
}

/**
 * Clients Page Object — extends CrudPage with client-specific form filling.
 * Backward-compatible with existing clients.spec.ts.
 */
export class ClientsPage extends CrudPage {
	readonly nameInput: Locator;
	readonly emailInput: Locator;
	readonly phoneInput: Locator;
	readonly addressInput: Locator;

	constructor(page: Page) {
		super(page, {
			heading: 'Clients',
			addButtonTestId: 'add-client',
			searchPlaceholder: 'Search clients...',
			route: '/clients',
		});

		this.nameInput = this.formDialog.getByLabel('Name');
		this.emailInput = this.formDialog.getByLabel('Email');
		this.phoneInput = this.formDialog.getByLabel('Phone');
		this.addressInput = this.formDialog.getByLabel('Address');
	}

	/**
	 * Fill the client form fields
	 */
	async fillClientForm(data: ClientFormData): Promise<void> {
		if (data.name !== undefined) await this.nameInput.fill(data.name);
		if (data.email !== undefined) await this.emailInput.fill(data.email);
		if (data.phone !== undefined) await this.phoneInput.fill(data.phone);
		if (data.address !== undefined) await this.addressInput.fill(data.address);
	}

	// --- Backward-compatible aliases ---

	/** Alias for addButton */
	get addClientButton(): Locator {
		return this.addButton;
	}

	/** Alias for emptyState */
	get emptyStateTitle(): Locator {
		return this.emptyState;
	}

	/** Alias for getRow */
	getClientRow(name: string): Locator {
		return this.getRow(name);
	}

	/** Alias for searchItems */
	async searchClients(query: string): Promise<void> {
		return this.searchItems(query);
	}

	/** Alias for editItem */
	async editClient(clientName: string): Promise<void> {
		return this.editItem(clientName);
	}

	/** Alias for deleteItem */
	async deleteClient(clientName: string): Promise<void> {
		return this.deleteItem(clientName);
	}

	/** Check if a client is visible in the table */
	async isClientVisible(name: string): Promise<boolean> {
		return this.getRow(name).isVisible();
	}

	// --- Extra UI helpers retained from original ---

	async closeFormDialogWithXButton(): Promise<void> {
		const closeButton = this.formDialog.getByRole('button', { name: /close/i });
		await closeButton.click();
		await this.formDialog.waitFor({ state: 'hidden' });
	}

	getSortButton(columnName: string): Locator {
		return this.table
			.getByRole('columnheader', { name: columnName })
			.getByRole('button');
	}

	async clickSort(columnName: string): Promise<void> {
		await this.getSortButton(columnName).click();
		await this.page.waitForTimeout(300);
	}

	get paginationContainer(): Locator {
		return this.page.locator('[data-testid="pagination"]');
	}

	async getPaginationInfo(): Promise<string | null> {
		return this.page.getByText(/Page \d+ of \d+/).textContent();
	}

	async goToNextPage(): Promise<void> {
		await this.page.getByRole('button', { name: /next/i }).click();
		await this.waitForTableLoad();
	}

	async goToPreviousPage(): Promise<void> {
		await this.page.getByRole('button', { name: /previous/i }).click();
		await this.waitForTableLoad();
	}

	async isNextPageEnabled(): Promise<boolean> {
		return this.page.getByRole('button', { name: /next/i }).isEnabled();
	}

	async isPreviousPageEnabled(): Promise<boolean> {
		return this.page.getByRole('button', { name: /previous/i }).isEnabled();
	}

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

	getToast(): Locator {
		return this.page.locator('[data-sonner-toast]');
	}

	async dismissToast(): Promise<void> {
		const closeButton = this.getToast().getByRole('button', { name: /close/i });
		if (await closeButton.isVisible()) await closeButton.click();
	}

	async hasValidationErrors(): Promise<boolean> {
		return (
			(await this.formDialog.locator('[data-slot="form-message"]').count()) > 0
		);
	}

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
