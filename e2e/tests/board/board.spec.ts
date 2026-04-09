import { expect, test } from '@playwright/test';
import {
	BoardPage,
	ClientsPage,
	LocationsPage,
	WorkersPage,
} from '../../page-objects';
import {
	createClientTestData,
	createLocationTestData,
	createWorkerTestData,
} from '../../setup/test-data';

/**
 * Board E2E Tests
 *
 * Tests cover:
 * - Page rendering (heading, search, table/empty state)
 * - Open assign dialog for a worker
 * - Assign worker to a position (location → position → start date → submit)
 * - Expand worker row to see assignments
 */

test.describe('Board', () => {
	let boardPage: BoardPage;
	let testWorkerName: string;
	let testLocationName: string;
	let testPositionName: string;
	let testClientName: string;

	test.beforeAll(async ({ browser }) => {
		test.setTimeout(120000);
		const page = await browser.newPage();

		// 1. Create client
		const clientsPage = new ClientsPage(page);
		await clientsPage.goto();
		await clientsPage.waitForTableLoad();
		const clientData = createClientTestData();
		await clientsPage.openCreateDialog();
		await clientsPage.fillClientForm(clientData);
		await clientsPage.submitForm();
		await expect(clientsPage.formDialog).toBeHidden();
		testClientName = clientData.name;

		// 2. Create location
		const locationsPage = new LocationsPage(page);
		await locationsPage.goto();
		await locationsPage.waitForTableLoad();
		const locationData = createLocationTestData();
		await locationsPage.openCreateDialog();
		await locationsPage.fillLocationForm({
			clientName: testClientName,
			name: locationData.name,
			address: locationData.address,
		});
		await locationsPage.submitForm();
		await expect(locationsPage.formDialog).toBeHidden();
		await locationsPage.waitForToast(/location created/i);
		testLocationName = locationData.name;

		// 3. Add position to location
		await locationsPage.searchItems(testLocationName);
		await locationsPage.expandRow(testLocationName);
		testPositionName = `TestPos-${Date.now()}`;
		await locationsPage.addPosition(testPositionName);
		// Wait for position to appear
		await expect(page.getByText(testPositionName)).toBeVisible({
			timeout: 10000,
		});

		// 4. Create worker
		const workersPage = new WorkersPage(page);
		await workersPage.goto();
		await workersPage.waitForTableLoad();
		const workerData = createWorkerTestData();
		await workersPage.openCreateDialog();
		await workersPage.fillWorkerForm(workerData);
		await workersPage.submitForm();
		await expect(workersPage.formDialog).toBeHidden();
		await workersPage.waitForToast(/worker created/i);
		testWorkerName = workersPage.getFullName(workerData);

		await page.close();
	});

	test.beforeEach(async ({ page }) => {
		boardPage = new BoardPage(page);
		await boardPage.goto();
		await boardPage.waitForTableLoad();
	});

	test.describe('Page Rendering', () => {
		test('should display Board heading', async () => {
			await expect(boardPage.heading).toBeVisible();
			await expect(boardPage.heading).toHaveText('Board');
		});

		test('should show search input', async () => {
			await expect(boardPage.searchInput).toBeVisible();
			await expect(boardPage.searchInput).toHaveAttribute(
				'placeholder',
				'Search workers...'
			);
		});

		test('should show table or empty state', async () => {
			const tableVisible = await boardPage.table.isVisible();
			const emptyStateVisible = await boardPage.emptyState.isVisible();

			expect(tableVisible || emptyStateVisible).toBeTruthy();
		});
	});

	test.describe('Assign Worker', () => {
		test('should open assign dialog', async () => {
			await boardPage.openAssignDialog(testWorkerName);

			await expect(boardPage.assignDialog).toBeVisible();
			await expect(boardPage.assignDialogTitle).toContainText('Assign Worker');
		});

		test('should assign worker to position', async () => {
			await boardPage.openAssignDialog(testWorkerName);

			await boardPage.selectWorkLocation(testLocationName);
			await boardPage.selectPosition(testPositionName);
			await boardPage.setStartDateTime();
			await boardPage.submitAssign();

			// Dialog should close and a success toast should appear
			await expect(boardPage.assignDialog).toBeHidden({ timeout: 10000 });
			await boardPage.waitForToast(/assigned/i);
		});
	});

	test.describe('Expand Row', () => {
		test('should expand worker row to see assignments', async () => {
			await boardPage.searchByName(testWorkerName);
			await boardPage.expandWorkerRow(testWorkerName);

			// Assignment panel should be visible — either assignments or "No assignments" text
			const assignmentPanel = await boardPage.waitForAssignmentPanel();
			const noAssignments = boardPage.page.getByText(
				/no assignments for this worker/i
			);

			const panelVisible = await assignmentPanel.isVisible();
			const noAssignmentsVisible = await noAssignments.isVisible();
			expect(panelVisible || noAssignmentsVisible).toBeTruthy();
		});
	});
});
