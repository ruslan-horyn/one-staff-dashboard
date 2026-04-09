import type { Locator, Page } from '@playwright/test';
import { CrudPage } from './crud-page';

interface WorkerFormData {
	firstName?: string;
	lastName?: string;
	phone?: string;
}

export class WorkersPage extends CrudPage {
	readonly firstNameInput: Locator;
	readonly lastNameInput: Locator;
	readonly phoneInput: Locator;

	constructor(page: Page) {
		super(page, {
			heading: 'Workers',
			addButtonTestId: 'add-worker',
			searchPlaceholder: 'Search workers...',
			route: '/workers',
		});

		this.firstNameInput = this.formDialog.getByLabel('First Name');
		this.lastNameInput = this.formDialog.getByLabel('Last Name');
		this.phoneInput = this.formDialog.getByLabel('Phone');
	}

	async fillWorkerForm(data: WorkerFormData): Promise<void> {
		if (data.firstName !== undefined)
			await this.firstNameInput.fill(data.firstName);
		if (data.lastName !== undefined)
			await this.lastNameInput.fill(data.lastName);
		if (data.phone !== undefined) await this.phoneInput.fill(data.phone);
	}

	getFullName(data: { firstName: string; lastName: string }): string {
		return `${data.firstName} ${data.lastName}`;
	}
}
