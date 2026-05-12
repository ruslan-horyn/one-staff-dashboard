import type { Locator, Page } from '@playwright/test';
import { CrudPage } from './crud-page';

interface LocationFormData {
	clientName?: string;
	name?: string;
	address?: string;
	email?: string;
	phone?: string;
}

export class LocationsPage extends CrudPage {
	readonly clientSelect: Locator;
	readonly nameInput: Locator;
	readonly addressInput: Locator;
	readonly emailInput: Locator;
	readonly phoneInput: Locator;

	constructor(page: Page) {
		super(page, {
			heading: 'Work Locations',
			addButtonTestId: 'add-location',
			searchPlaceholder: 'Search locations...',
			route: '/locations',
		});

		this.clientSelect = this.formDialog.getByLabel('Client');
		this.nameInput = this.formDialog.getByLabel('Name');
		this.addressInput = this.formDialog.getByLabel('Address');
		this.emailInput = this.formDialog.getByLabel('Email (Optional)');
		this.phoneInput = this.formDialog.getByLabel('Phone (Optional)');
	}

	async fillLocationForm(data: LocationFormData): Promise<void> {
		if (data.clientName !== undefined) {
			await this.clientSelect.selectOption({ label: data.clientName });
		}
		if (data.name !== undefined) await this.nameInput.fill(data.name);
		if (data.address !== undefined) await this.addressInput.fill(data.address);
		if (data.email !== undefined) await this.emailInput.fill(data.email);
		if (data.phone !== undefined) await this.phoneInput.fill(data.phone);
	}

	getExpandButton(locationName: string): Locator {
		return this.getRow(locationName).getByTestId('expand-row-button');
	}

	async expandRow(locationName: string): Promise<void> {
		await this.getExpandButton(locationName).click();
	}

	async addPosition(positionName: string): Promise<void> {
		const addBtn = this.page.getByTestId('add-position-button');
		await addBtn.click();
		await this.page.getByTestId('position-name-input').fill(positionName);
		await this.page.getByTestId('save-position').click();
	}
}
