import { expect, test } from '@playwright/test';
import { WorkersPage } from '../../page-objects';
import { createWorkerTestData } from '../../setup/test-data';

/**
 * Workers E2E Tests (US-005)
 *
 * Tests cover:
 * - AC1: View list of workers with pagination
 * - AC2: Create new worker with form validation
 * - AC3: Edit existing worker
 * - AC4: Delete worker with confirmation
 * - AC5: Search workers
 */

test.describe('Workers Management', () => {
	let workersPage: WorkersPage;

	test.beforeEach(async ({ page }) => {
		workersPage = new WorkersPage(page);
		await workersPage.goto();
		await workersPage.waitForTableLoad();
	});

	test.describe('Page Rendering', () => {
		test('should display workers page with header', async () => {
			await expect(workersPage.heading).toBeVisible();
			await expect(workersPage.heading).toHaveText('Workers');
		});

		test('should show Add Worker button', async () => {
			await expect(workersPage.addButton).toBeVisible();
			await expect(workersPage.addButton).toHaveText(/add worker/i);
		});

		test('should show search input', async () => {
			await expect(workersPage.searchInput).toBeVisible();
			await expect(workersPage.searchInput).toHaveAttribute(
				'placeholder',
				'Search workers...'
			);
		});

		test('should show data table or empty state', async () => {
			const tableVisible = await workersPage.table.isVisible();
			const emptyStateVisible = await workersPage.emptyState.isVisible();

			expect(tableVisible || emptyStateVisible).toBeTruthy();

			if (tableVisible) {
				const headers = workersPage.getColumnHeaders();
				await expect(headers.filter({ hasText: 'Full Name' })).toBeVisible();
				await expect(headers.filter({ hasText: 'Phone' })).toBeVisible();
			}
		});
	});

	test.describe('Create Worker', () => {
		test('should open create dialog when Add Worker clicked', async () => {
			await workersPage.openCreateDialog();

			await expect(workersPage.formDialog).toBeVisible();
			await expect(workersPage.formDialogTitle).toHaveText('Add Worker');
		});

		test('should create new worker with valid data', async () => {
			const workerData = createWorkerTestData();

			await workersPage.openCreateDialog();
			await workersPage.fillWorkerForm(workerData);
			await workersPage.submitForm();

			await expect(workersPage.formDialog).toBeHidden();
			await workersPage.waitForToast(/worker created/i);

			const fullName = workersPage.getFullName(workerData);
			// Search to ensure the row is visible (table may be paginated)
			await workersPage.searchItems(workerData.firstName);
			await expect(workersPage.getRow(fullName)).toBeVisible({
				timeout: 10000,
			});
		});

		test('should show validation errors for empty required fields', async () => {
			await workersPage.openCreateDialog();

			// Submit empty form
			await workersPage.submitForm();

			// Dialog should stay open
			await expect(workersPage.formDialog).toBeVisible();

			// First Name field should show validation error
			await expect(workersPage.getFieldError('First Name')).toBeVisible();
		});

		test('should close dialog on Cancel', async () => {
			await workersPage.openCreateDialog();
			await workersPage.fillWorkerForm({ firstName: 'Test' });

			await workersPage.closeFormDialog();

			await expect(workersPage.formDialog).toBeHidden();
		});
	});

	test.describe('Edit Worker', () => {
		test('should open edit dialog with pre-filled data', async () => {
			// Create a worker to edit
			const workerData = createWorkerTestData();
			await workersPage.openCreateDialog();
			await workersPage.fillWorkerForm(workerData);
			await workersPage.submitForm();
			await expect(workersPage.formDialog).toBeHidden();
			await workersPage.waitForToast(/worker created/i);

			const fullName = workersPage.getFullName(workerData);

			// Search to ensure the row is visible (table may be paginated)
			await workersPage.searchItems(workerData.firstName);

			// Open edit dialog
			await workersPage.editItem(fullName);

			await expect(workersPage.formDialog).toBeVisible();
			await expect(workersPage.formDialogTitle).toHaveText('Edit Worker');
			await expect(workersPage.firstNameInput).toHaveValue(
				workerData.firstName
			);
		});

		test('should update worker first name successfully', async () => {
			// Create a worker to update
			const workerData = createWorkerTestData();
			await workersPage.openCreateDialog();
			await workersPage.fillWorkerForm(workerData);
			await workersPage.submitForm();
			await expect(workersPage.formDialog).toBeHidden();
			await workersPage.waitForToast(/worker created/i);

			const fullName = workersPage.getFullName(workerData);
			const updatedFirstName = `Updated-${Date.now()}`;

			// Search to ensure the row is visible (table may be paginated)
			await workersPage.searchItems(workerData.firstName);
			await workersPage.editItem(fullName);
			await workersPage.firstNameInput.clear();
			await workersPage.firstNameInput.fill(updatedFirstName);
			await workersPage.submitForm();

			await expect(workersPage.formDialog).toBeHidden();
			await workersPage.waitForToast(/worker updated/i);

			// Search for the updated name to ensure it's visible after pagination
			await workersPage.searchItems(updatedFirstName);
			const updatedFullName = `${updatedFirstName} ${workerData.lastName}`;
			await expect(workersPage.getRow(updatedFullName)).toBeVisible({
				timeout: 10000,
			});
		});
	});

	test.describe('Delete Worker', () => {
		test('should open delete confirmation dialog', async () => {
			// Create a worker to delete
			const workerData = createWorkerTestData();
			await workersPage.openCreateDialog();
			await workersPage.fillWorkerForm(workerData);
			await workersPage.submitForm();
			await expect(workersPage.formDialog).toBeHidden();
			await workersPage.waitForToast(/worker created/i);

			const fullName = workersPage.getFullName(workerData);

			// Search to ensure the row is on the current page (table may be paginated)
			await workersPage.searchItems(workerData.firstName);
			await workersPage.deleteItem(fullName);

			await expect(workersPage.deleteDialog).toBeVisible();
			await expect(
				workersPage.deleteDialog.getByText(/are you sure/i)
			).toBeVisible();
		});

		test('should delete worker on confirm', async ({ page }) => {
			// Create a worker to delete
			const workerData = createWorkerTestData();
			await workersPage.openCreateDialog();
			await workersPage.fillWorkerForm(workerData);
			await workersPage.submitForm();
			await expect(workersPage.formDialog).toBeHidden();
			await workersPage.waitForToast(/worker created/i);

			const fullName = workersPage.getFullName(workerData);

			// Search to ensure the row is on the current page (table may be paginated)
			await workersPage.searchItems(workerData.firstName);
			await workersPage.deleteItem(fullName);

			const responsePromise = page.waitForResponse(
				(resp) => resp.url().includes('/workers') && resp.status() === 200
			);
			await workersPage.confirmDelete();
			await responsePromise;

			await expect(workersPage.deleteDialog).toBeHidden();
			await workersPage.waitForToast(/worker deleted/i);

			// Wait for table to refresh after deletion
			await workersPage.waitForTableLoad();

			const matchingRows = workersPage.table
				.getByRole('row')
				.filter({ hasText: fullName });
			await expect(matchingRows).toHaveCount(0, { timeout: 10000 });
		});

		test('should cancel deletion on cancel', async () => {
			// Create a worker to test cancel
			const workerData = createWorkerTestData();
			await workersPage.openCreateDialog();
			await workersPage.fillWorkerForm(workerData);
			await workersPage.submitForm();
			await expect(workersPage.formDialog).toBeHidden();
			await workersPage.waitForToast(/worker created/i);

			const fullName = workersPage.getFullName(workerData);

			// Search to ensure the row is on the current page (table may be paginated)
			await workersPage.searchItems(workerData.firstName);
			await workersPage.deleteItem(fullName);
			await workersPage.cancelDelete();

			await expect(workersPage.deleteDialog).toBeHidden();
			await expect(workersPage.getRow(fullName)).toBeVisible();
		});
	});

	test.describe('Search', () => {
		test('should filter workers by name', async () => {
			const workerData = createWorkerTestData();
			await workersPage.openCreateDialog();
			await workersPage.fillWorkerForm(workerData);
			await workersPage.submitForm();
			await expect(workersPage.formDialog).toBeHidden();
			await workersPage.waitForToast(/worker created/i);

			const fullName = workersPage.getFullName(workerData);
			// Search by first name only (search runs per-column, not on combined full name)
			await workersPage.searchItems(workerData.firstName);

			await expect(workersPage.getRow(fullName)).toBeVisible();
		});

		test('should show empty state when no results', async () => {
			await workersPage.searchItems('NonExistentWorkerXYZ999');

			await expect(workersPage.emptyState).toBeVisible();
		});
	});
});
