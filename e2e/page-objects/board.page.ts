import { expect, type Locator, type Page } from '@playwright/test';
import { BasePage } from './base.page';

export class BoardPage extends BasePage {
	readonly heading: Locator;
	readonly searchInput: Locator;
	readonly table: Locator;
	readonly emptyState: Locator;
	readonly assignDialog: Locator;
	readonly assignDialogTitle: Locator;

	constructor(page: Page) {
		super(page);
		this.heading = page.getByRole('heading', { name: 'Board', level: 1 });
		this.searchInput = page.getByTestId('search-input');
		this.table = page.getByRole('table');
		this.emptyState = page.getByText(/no .+ found/i);
		// Use data-slot="dialog-content" to target the main Assign Worker dialog
		// and avoid strict-mode conflict with Radix popover (role="dialog") from DateTimePicker
		this.assignDialog = page.locator('[data-slot="dialog-content"]').first();
		this.assignDialogTitle = this.assignDialog.getByRole('heading');
	}

	async goto(): Promise<void> {
		await this.page.goto('/board');
	}

	async isVisible(): Promise<boolean> {
		return this.heading.isVisible();
	}

	async waitForTableLoad(): Promise<void> {
		await Promise.race([
			this.table.waitFor({ state: 'visible' }).catch(() => {}),
			this.emptyState.waitFor({ state: 'visible' }).catch(() => {}),
		]);
	}

	async openAssignDialog(workerName: string): Promise<void> {
		await this.searchByName(workerName);
		const row = this.table
			.getByRole('row')
			.filter({ hasText: workerName })
			.first();
		await row.getByTestId('assign-worker').click();
		await this.assignDialog.waitFor({ state: 'visible' });
	}

	async searchByName(name: string): Promise<void> {
		const firstName = name.split(' ')[0]; // search by first name (3+ chars needed)
		if (firstName.length >= 3) {
			await this.searchInput.clear();
			await this.searchInput.fill(firstName);
			await this.page.waitForURL(
				(url) => url.searchParams.get('search') === firstName
			);
			await this.waitForTableLoad();
		}
	}

	async selectWorkLocation(locationName: string): Promise<void> {
		// shadcn Select - click combobox trigger, then click option
		await this.assignDialog.locator('[role="combobox"]').first().click();
		await this.page
			.getByRole('option', { name: new RegExp(locationName) })
			.click();
	}

	async selectPosition(positionName: string): Promise<void> {
		// Wait for position select to be enabled after location selected
		await expect(
			this.assignDialog.locator('[role="combobox"]').nth(1)
		).toBeEnabled({ timeout: 5000 });
		await this.assignDialog.locator('[role="combobox"]').nth(1).click();
		await this.page.getByRole('option', { name: positionName }).click();
	}

	async setStartDateTime(): Promise<void> {
		// Click DateTimePicker trigger button
		const datePickerBtn = this.assignDialog
			.locator('button[aria-haspopup="dialog"]')
			.first();
		await datePickerBtn.click();

		// Click a day in the calendar (tomorrow)
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		const dayLabel = tomorrow.getDate().toString();
		await this.page
			.locator('[role="gridcell"]')
			.filter({ hasNot: this.page.locator('[aria-disabled="true"]') })
			.getByText(dayLabel, { exact: true })
			.first()
			.click();

		// Click Apply to confirm
		await this.page.getByRole('button', { name: 'Apply' }).click();
	}

	async submitAssign(): Promise<void> {
		await this.assignDialog.getByTestId('submit-button').click();
	}

	async expandWorkerRow(workerName: string): Promise<void> {
		const row = this.table
			.getByRole('row')
			.filter({ hasText: workerName })
			.first();
		await row.getByRole('button', { name: /expand row/i }).click();
	}

	async waitForAssignmentPanel(): Promise<Locator> {
		const panel = this.page.getByTestId('assignment-panel');
		const noAssignments = this.page.getByText(
			/no assignments for this worker/i
		);

		await Promise.race([
			panel.waitFor({ state: 'visible' }).catch(() => {}),
			noAssignments.waitFor({ state: 'visible' }).catch(() => {}),
		]);

		return panel;
	}

	async waitForToast(message: string | RegExp): Promise<void> {
		const toast = this.page.locator('[data-sonner-toast]', {
			hasText: message,
		});
		await toast.waitFor({ state: 'visible' });
	}
}
