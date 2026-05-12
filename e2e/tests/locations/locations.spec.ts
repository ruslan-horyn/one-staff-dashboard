import { expect, test } from '@playwright/test';
import { ClientsPage, LocationsPage } from '../../page-objects';
import {
	createClientTestData,
	createLocationTestData,
	createMinimalLocationTestData,
} from '../../setup/test-data';

/**
 * Work Locations E2E Tests (US-004)
 *
 * Tests cover:
 * - AC1: View list of work locations with pagination
 * - AC2: Create new location with form validation (requires client)
 * - AC3: Edit existing location
 * - AC4: Delete location with confirmation
 * - AC5: Search locations
 * - AC6: Inline positions management
 */

test.describe('Work Locations Management', () => {
	let locationsPage: LocationsPage;
	let testClientName: string;

	test.beforeAll(async ({ browser }) => {
		// Create a client once for all location tests that need a client selector
		const page = await browser.newPage();
		const clientsPage = new ClientsPage(page);
		await clientsPage.goto();
		await clientsPage.waitForTableLoad();
		const clientData = createClientTestData();
		testClientName = clientData.name;
		await clientsPage.openCreateDialog();
		await clientsPage.fillClientForm(clientData);
		await clientsPage.submitForm();
		await expect(clientsPage.formDialog).toBeHidden();
		await page.close();
	});

	test.beforeEach(async ({ page }) => {
		locationsPage = new LocationsPage(page);
		await locationsPage.goto();
		await locationsPage.waitForTableLoad();
	});

	test.describe('Page Rendering', () => {
		test('should display work locations page with header', async () => {
			await expect(locationsPage.heading).toBeVisible();
			await expect(locationsPage.heading).toHaveText('Work Locations');
		});

		test('should show Add Location button', async () => {
			await expect(locationsPage.addButton).toBeVisible();
			await expect(locationsPage.addButton).toHaveText(/add location/i);
		});

		test('should show search input', async () => {
			await expect(locationsPage.searchInput).toBeVisible();
			await expect(locationsPage.searchInput).toHaveAttribute(
				'placeholder',
				'Search locations...'
			);
		});

		test('should show data table or empty state', async () => {
			const tableVisible = await locationsPage.table.isVisible();
			const emptyStateVisible = await locationsPage.emptyState.isVisible();

			expect(tableVisible || emptyStateVisible).toBeTruthy();

			if (tableVisible) {
				const headers = locationsPage.getColumnHeaders();
				await expect(headers.filter({ hasText: 'Name' })).toBeVisible();
				await expect(headers.filter({ hasText: 'Client' })).toBeVisible();
				await expect(headers.filter({ hasText: 'Address' })).toBeVisible();
			}
		});
	});

	test.describe('Create Location', () => {
		test('should open create dialog when Add Location clicked', async () => {
			await locationsPage.openCreateDialog();

			await expect(locationsPage.formDialog).toBeVisible();
			await expect(locationsPage.formDialogTitle).toHaveText(
				'Add Work Location'
			);
		});

		test('should create new location with valid data', async () => {
			const locationData = createLocationTestData();

			await locationsPage.openCreateDialog();
			await locationsPage.fillLocationForm({
				clientName: testClientName,
				name: locationData.name,
				address: locationData.address,
				email: locationData.email,
				phone: locationData.phone,
			});
			await locationsPage.submitForm();

			await expect(locationsPage.formDialog).toBeHidden();
			await locationsPage.waitForToast(/location created/i);

			// Search to ensure the row is visible (table may be paginated)
			await locationsPage.searchItems(locationData.name);
			await expect(locationsPage.getRow(locationData.name)).toBeVisible({
				timeout: 10000,
			});
		});

		test('should create location with minimal required fields', async () => {
			const minData = createMinimalLocationTestData();

			await locationsPage.openCreateDialog();
			await locationsPage.fillLocationForm({
				clientName: testClientName,
				name: minData.name,
				address: minData.address,
			});
			await locationsPage.submitForm();

			await expect(locationsPage.formDialog).toBeHidden();
			await locationsPage.waitForToast(/location created/i);

			// Search to ensure the row is visible (table may be paginated)
			await locationsPage.searchItems(minData.name);
			await expect(locationsPage.getRow(minData.name)).toBeVisible({
				timeout: 10000,
			});
		});

		test('should show validation errors for empty required fields', async () => {
			await locationsPage.openCreateDialog();

			// Submit empty form
			await locationsPage.submitForm();

			// Dialog should stay open
			await expect(locationsPage.formDialog).toBeVisible();

			// Name field should show validation error
			await expect(locationsPage.getFieldError('Name')).toBeVisible();
		});

		test('should close dialog on Cancel', async () => {
			await locationsPage.openCreateDialog();
			await locationsPage.fillLocationForm({ name: 'Test Location' });

			await locationsPage.closeFormDialog();

			await expect(locationsPage.formDialog).toBeHidden();
		});
	});

	test.describe('Edit Location', () => {
		test('should open edit dialog with pre-filled data', async () => {
			// Create a location to edit
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

			// Search to ensure the row is on the current page (table may be paginated)
			await locationsPage.searchItems(locationData.name);

			// Edit the location
			await locationsPage.editItem(locationData.name);

			await expect(locationsPage.formDialog).toBeVisible();
			await expect(locationsPage.formDialogTitle).toHaveText(
				'Edit Work Location'
			);
			await expect(locationsPage.nameInput).toHaveValue(locationData.name);
		});

		test('should update location name successfully', async () => {
			// Create location to edit
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

			// Search to ensure the row is on the current page (table may be paginated)
			await locationsPage.searchItems(locationData.name);

			const updatedName = `Updated Loc ${Date.now()}`;

			await locationsPage.editItem(locationData.name);
			await locationsPage.nameInput.clear();
			await locationsPage.nameInput.fill(updatedName);
			await locationsPage.submitForm();

			await expect(locationsPage.formDialog).toBeHidden();
			await locationsPage.waitForToast(/location updated/i);

			// Search for the updated name to ensure it's visible after pagination
			await locationsPage.searchItems(updatedName);
			await expect(locationsPage.getRow(updatedName)).toBeVisible({
				timeout: 10000,
			});
		});
	});

	test.describe('Delete Location', () => {
		test('should open delete confirmation dialog', async () => {
			// Create location to delete
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

			// Search to ensure the row is on the current page (table may be paginated)
			await locationsPage.searchItems(locationData.name);

			await locationsPage.deleteItem(locationData.name);

			await expect(locationsPage.deleteDialog).toBeVisible();
			await expect(
				locationsPage.deleteDialog.getByTestId('delete-confirmation-message')
			).toBeVisible();
		});

		test('should delete location on confirm', async ({ page }) => {
			// Create location to delete
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

			// Search to ensure the row is on the current page (table may be paginated)
			await locationsPage.searchItems(locationData.name);

			await locationsPage.deleteItem(locationData.name);

			const responsePromise = page.waitForResponse(
				(resp) => resp.url().includes('/locations') && resp.status() === 200
			);
			await locationsPage.confirmDelete();
			await responsePromise;

			await expect(locationsPage.deleteDialog).toBeHidden();
			await locationsPage.waitForToast(/location deleted/i);

			// Wait for table to refresh after deletion
			await locationsPage.waitForTableLoad();

			const matchingRows = locationsPage.table
				.getByRole('row')
				.filter({ hasText: locationData.name });
			await expect(matchingRows).toHaveCount(0, { timeout: 10000 });
		});

		test('should cancel deletion on cancel', async () => {
			// Create location to test cancel on
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

			// Search to ensure the row is on the current page (table may be paginated)
			await locationsPage.searchItems(locationData.name);

			await locationsPage.deleteItem(locationData.name);
			await locationsPage.cancelDelete();

			await expect(locationsPage.deleteDialog).toBeHidden();
			await expect(locationsPage.getRow(locationData.name)).toBeVisible();
		});
	});

	test.describe('Search', () => {
		test('should filter locations by search query', async () => {
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

			await locationsPage.searchItems(locationData.name);

			await expect(locationsPage.getRow(locationData.name)).toBeVisible();
		});

		test('should show empty state when no results', async () => {
			await locationsPage.searchItems('NonExistentLocationXYZ999');

			await expect(locationsPage.emptyState).toBeVisible();
		});
	});

	test.describe('Positions Inline', () => {
		test('should expand row and show positions panel', async () => {
			// Create a location
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

			// Search to ensure the row is on the current page (table may be paginated)
			await locationsPage.searchItems(locationData.name);

			// Expand the row
			await locationsPage.expandRow(locationData.name);

			// Position list should appear — "Add Position" button visible
			await expect(
				locationsPage.page.getByTestId('add-position-button')
			).toBeVisible({ timeout: 5000 });
		});

		test('should add a position to a location', async () => {
			// Create a location
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

			// Search to ensure the row is on the current page (table may be paginated)
			await locationsPage.searchItems(locationData.name);

			// Expand row and add a position
			await locationsPage.expandRow(locationData.name);
			const positionName = `Pos-${Date.now()}`;
			await locationsPage.addPosition(positionName);

			// Position should appear in the list
			await locationsPage.waitForToast(/position created/i);
			await expect(
				locationsPage.page
					.getByTestId('position-item')
					.filter({ hasText: positionName })
			).toBeVisible({
				timeout: 10000,
			});
		});
	});
});
