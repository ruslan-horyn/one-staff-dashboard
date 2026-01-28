import { expect, test } from '@playwright/test';
import { ClientsPage } from '../../page-objects';
import {
	createClientTestData,
	createMaxLengthClientTestData,
	createMinimalClientTestData,
	invalidEmailFormats,
	invalidPhoneFormats,
	validationTestData,
} from '../../setup/test-data';

/**
 * Client Management E2E Tests (US-003)
 *
 * Tests cover the PRD acceptance criteria:
 * - AC1: View list of clients with pagination
 * - AC2: Create new client with form validation
 * - AC3: Edit existing client
 * - AC4: Delete client with confirmation
 * - AC5: Search clients
 */

test.describe('Client Management', () => {
	let clientsPage: ClientsPage;

	test.beforeEach(async ({ page }) => {
		clientsPage = new ClientsPage(page);
		await clientsPage.goto();
		await clientsPage.waitForTableLoad();
	});

	test.describe('Page Rendering', () => {
		test('should display clients page with header', async () => {
			await expect(clientsPage.heading).toBeVisible();
			await expect(clientsPage.heading).toHaveText('Clients');
		});

		test('should show Add Client button', async () => {
			await expect(clientsPage.addClientButton).toBeVisible();
			await expect(clientsPage.addClientButton).toHaveText(/add client/i);
		});

		test('should show search input', async () => {
			await expect(clientsPage.searchInput).toBeVisible();
			await expect(clientsPage.searchInput).toHaveAttribute(
				'placeholder',
				'Search clients...'
			);
		});

		test('should show data table or empty state', async () => {
			const tableVisible = await clientsPage.table.isVisible();
			const emptyStateVisible = await clientsPage.emptyStateTitle.isVisible();

			// Either table or empty state should be visible
			expect(tableVisible || emptyStateVisible).toBeTruthy();

			if (tableVisible) {
				// Verify column headers
				const headers = clientsPage.getColumnHeaders();
				await expect(headers.filter({ hasText: 'Name' })).toBeVisible();
				await expect(headers.filter({ hasText: 'Email' })).toBeVisible();
				await expect(headers.filter({ hasText: 'Phone' })).toBeVisible();
				await expect(headers.filter({ hasText: 'Address' })).toBeVisible();
			}
		});
	});

	test.describe('Create Client', () => {
		test('should open create dialog when Add Client clicked', async () => {
			await clientsPage.openCreateDialog();

			await expect(clientsPage.formDialog).toBeVisible();
			await expect(clientsPage.formDialogTitle).toHaveText('Add Client');
		});

		test('should create new client with valid data', async () => {
			const newClient = createClientTestData();

			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm(newClient);
			await clientsPage.submitForm();

			// Wait for dialog to close
			await expect(clientsPage.formDialog).toBeHidden();

			// Wait for success toast
			await clientsPage.waitForToast(/client created/i);

			// Verify client appears in table (longer timeout for CI with remote DB)
			await expect(clientsPage.getClientRow(newClient.name)).toBeVisible({
				timeout: 10000,
			});
		});

		test('should show validation errors for empty required fields', async () => {
			await clientsPage.openCreateDialog();

			// Try to submit empty form
			await clientsPage.submitForm();

			// Dialog should still be open (form not submitted)
			await expect(clientsPage.formDialog).toBeVisible();

			// Name field should show validation error
			await expect(clientsPage.getFieldError('Name')).toBeVisible();
		});

		test('should show validation error for invalid email', async () => {
			await clientsPage.openCreateDialog();

			// Fill form with invalid email
			await clientsPage.fillClientForm({
				name: 'Test Client',
				email: validationTestData.invalidEmail,
				phone: '+48123456789',
				address: 'Test Address',
			});
			await clientsPage.submitForm();

			// Dialog should still be open
			await expect(clientsPage.formDialog).toBeVisible();
		});

		test('should close dialog on Cancel', async () => {
			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm({ name: 'Test' });

			await clientsPage.closeFormDialog();

			await expect(clientsPage.formDialog).toBeHidden();
		});
	});

	test.describe('Edit Client', () => {
		test('should open edit dialog with pre-filled data', async () => {
			// Get first client name from the table
			const firstRow = clientsPage.table.locator('tbody tr').first();
			const clientName = await firstRow.locator('td').first().textContent();

			test.skip(!clientName, 'No clients exist to edit');

			// Open edit dialog
			await clientsPage.editClient(clientName!);

			// Verify dialog opened with Edit title
			await expect(clientsPage.formDialog).toBeVisible();
			await expect(clientsPage.formDialogTitle).toHaveText('Edit Client');

			// Verify name is pre-filled
			await expect(clientsPage.nameInput).toHaveValue(clientName!);
		});

		test('should update client successfully', async () => {
			// Get first client name from the table
			const firstRow = clientsPage.table.locator('tbody tr').first();
			const clientName = await firstRow.locator('td').first().textContent();

			test.skip(!clientName, 'No clients exist to edit');

			const updatedName = `Updated ${Date.now()}`;

			// Edit the client
			await clientsPage.editClient(clientName!);
			await clientsPage.fillClientForm({ name: updatedName });
			await clientsPage.submitForm();

			// Wait for success
			await expect(clientsPage.formDialog).toBeHidden();
			await clientsPage.waitForToast(/client updated/i);

			// Verify updated client appears in table
			await expect(clientsPage.getClientRow(updatedName)).toBeVisible();
		});
	});

	test.describe('Delete Client', () => {
		test('should open delete confirmation dialog', async () => {
			// Get first client name from the table
			const firstRow = clientsPage.table.locator('tbody tr').first();
			const clientName = await firstRow.locator('td').first().textContent();

			test.skip(!clientName, 'No clients exist to delete');

			// Open delete dialog
			await clientsPage.deleteClient(clientName!);

			// Verify delete dialog opened
			await expect(clientsPage.deleteDialog).toBeVisible();
			await expect(
				clientsPage.deleteDialog.getByText(/are you sure/i)
			).toBeVisible();
		});

		test('should delete client on confirm', async ({ page }) => {
			// Get last client name from the table (to avoid deleting important data)
			const lastRow = clientsPage.table.locator('tbody tr').last();
			const clientName = await lastRow.locator('td').first().textContent();

			test.skip(!clientName, 'No clients exist to delete');

			// Delete the client and wait for data refresh
			await clientsPage.deleteClient(clientName!);

			// Wait for delete action to complete by monitoring the response
			const responsePromise = page.waitForResponse(
				(resp) => resp.url().includes('/clients') && resp.status() === 200
			);
			await clientsPage.confirmDelete();
			await responsePromise;

			// Wait for success indicators
			await expect(clientsPage.deleteDialog).toBeHidden();
			await clientsPage.waitForToast(/client deleted/i);

			// Verify client is removed from table
			const matchingRows = clientsPage.table
				.getByRole('row')
				.filter({ hasText: clientName! });
			await expect(matchingRows).toHaveCount(0);
		});

		test('should cancel deletion on cancel', async () => {
			// Get first client name from the table
			const firstRow = clientsPage.table.locator('tbody tr').first();
			const clientName = await firstRow.locator('td').first().textContent();

			test.skip(!clientName, 'No clients exist to test cancel');

			// Open delete dialog and cancel
			await clientsPage.deleteClient(clientName!);
			await clientsPage.cancelDelete();

			// Dialog should close
			await expect(clientsPage.deleteDialog).toBeHidden();

			// Client should still be visible
			await expect(clientsPage.getClientRow(clientName!)).toBeVisible();
		});
	});

	test.describe('Search', () => {
		test('should filter clients by search query', async () => {
			// Create a client first to ensure we have something to search for
			const newClient = createClientTestData();
			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm(newClient);
			await clientsPage.submitForm();
			await expect(clientsPage.formDialog).toBeHidden();
			await clientsPage.waitForToast(/client created/i);

			// Search for the newly created client
			await clientsPage.searchClients(newClient.name);

			// Verify client is visible in search results
			await expect(clientsPage.getClientRow(newClient.name)).toBeVisible();
		});

		test('should show empty state when no results', async () => {
			// Search for something that doesn't exist
			await clientsPage.searchClients('NonExistentClientXYZ123');

			// Wait for empty state
			await expect(clientsPage.emptyStateTitle).toBeVisible();
		});
	});

	test.describe('Accessibility', () => {
		test('should have proper form labels', async () => {
			await clientsPage.openCreateDialog();

			await expect(clientsPage.nameInput).toHaveAccessibleName('Name');
			await expect(clientsPage.emailInput).toHaveAccessibleName('Email');
			await expect(clientsPage.phoneInput).toHaveAccessibleName('Phone');
			await expect(clientsPage.addressInput).toHaveAccessibleName('Address');
		});

		test('should have accessible Add Client button', async () => {
			await expect(clientsPage.addClientButton).toHaveAccessibleName(
				/add client/i
			);
		});

		test('should support keyboard navigation in dialog', async ({ page }) => {
			await clientsPage.openCreateDialog();

			// First form field should be focusable
			await clientsPage.nameInput.focus();
			await expect(clientsPage.nameInput).toBeFocused();

			// Tab through form fields
			await page.keyboard.press('Tab');
			await expect(clientsPage.emailInput).toBeFocused();

			await page.keyboard.press('Tab');
			await expect(clientsPage.phoneInput).toBeFocused();
		});

		test('should close dialog with Escape key', async ({ page }) => {
			await clientsPage.openCreateDialog();
			await page.keyboard.press('Escape');

			await expect(clientsPage.formDialog).toBeHidden();
		});
	});

	test.describe('Form Validation Edge Cases', () => {
		test('should accept name at maximum length (255 chars)', async () => {
			const maxData = createMaxLengthClientTestData();

			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm(maxData);
			await clientsPage.submitForm();

			await expect(clientsPage.formDialog).toBeHidden();
			await clientsPage.waitForToast(/client created/i);
		});

		test('should reject name exceeding maximum length', async () => {
			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm({
				name: 'A'.repeat(256), // Over 255 limit
				email: 'test@test.com',
				phone: '+48123456789',
				address: 'Test Address',
			});
			await clientsPage.submitForm();

			await expect(clientsPage.formDialog).toBeVisible();
			await expect(await clientsPage.hasValidationErrors()).toBe(true);
		});

		test('should reject various invalid email formats', async () => {
			for (const invalidEmail of invalidEmailFormats.slice(0, 3)) {
				await clientsPage.openCreateDialog();
				await clientsPage.fillClientForm({
					name: 'Test Client',
					email: invalidEmail,
					phone: '+48123456789',
					address: 'Test Address',
				});
				await clientsPage.submitForm();

				await expect(clientsPage.formDialog).toBeVisible();
				await clientsPage.closeFormDialog();
			}
		});

		test('should reject invalid phone formats', async () => {
			for (const invalidPhone of invalidPhoneFormats) {
				await clientsPage.openCreateDialog();
				await clientsPage.fillClientForm({
					name: 'Test Client',
					email: `test-${Date.now()}@test.com`,
					phone: invalidPhone,
					address: 'Test Address',
				});
				await clientsPage.submitForm();

				await expect(clientsPage.formDialog).toBeVisible();
				await clientsPage.closeFormDialog();
			}
		});

		test('should reject whitespace-only values in required fields', async () => {
			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm({
				name: '   ',
				email: 'test@test.com',
				phone: '+48123456789',
				address: '   ',
			});
			await clientsPage.submitForm();

			await expect(clientsPage.formDialog).toBeVisible();
			await expect(await clientsPage.hasValidationErrors()).toBe(true);
		});

		test('should reject address exceeding maximum length (500 chars)', async () => {
			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm({
				name: 'Test Client',
				email: 'test@test.com',
				phone: '+48123456789',
				address: 'A'.repeat(501), // Over 500 limit
			});
			await clientsPage.submitForm();

			await expect(clientsPage.formDialog).toBeVisible();
			await expect(await clientsPage.hasValidationErrors()).toBe(true);
		});
	});

	test.describe('CRUD Extended Scenarios', () => {
		test('should create client with minimum required fields', async () => {
			const minData = createMinimalClientTestData();

			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm(minData);
			await clientsPage.submitForm();

			await expect(clientsPage.formDialog).toBeHidden();
			await clientsPage.waitForToast(/client created/i);
			await expect(clientsPage.getClientRow(minData.name)).toBeVisible();
		});

		test('should edit client changing only one field', async () => {
			const firstRow = clientsPage.table.locator('tbody tr').first();
			const clientName = await firstRow.locator('td').first().textContent();

			test.skip(!clientName, 'No clients exist to edit');

			const newAddress = `Updated Address ${Date.now()}`;

			await clientsPage.editClient(clientName!);

			// Clear and fill only address
			await clientsPage.addressInput.clear();
			await clientsPage.addressInput.fill(newAddress);
			await clientsPage.submitForm();

			await expect(clientsPage.formDialog).toBeHidden();
			await clientsPage.waitForToast(/client updated/i);
		});

		test('should show error for duplicate email', async () => {
			// First create a client with a unique email
			const uniqueEmail = `duplicate-test-${Date.now()}@example.com`;
			const firstClient = {
				name: `First Client ${Date.now()}`,
				email: uniqueEmail,
				phone: '+48111222333',
				address: 'First Client Address',
			};

			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm(firstClient);
			await clientsPage.submitForm();

			await expect(clientsPage.formDialog).toBeHidden();
			await clientsPage.waitForToast(/client created/i);

			// Now try to create another client with the same email
			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm({
				name: `Duplicate Test ${Date.now()}`,
				email: uniqueEmail,
				phone: '+48999888777',
				address: 'Duplicate Test Address',
			});
			await clientsPage.submitForm();

			// Should show error toast for duplicate
			await clientsPage.waitForToast(/already exists|duplicate/i);
		});
	});

	test.describe('Search and Filtering', () => {
		test('should search by partial name match', async () => {
			const firstRow = clientsPage.table.locator('tbody tr').first();
			const clientName = await firstRow.locator('td').first().textContent();

			test.skip(!clientName, 'No clients exist to search');

			// Search with partial name (first 5 characters)
			const partialName = clientName!.substring(0, 5);
			await clientsPage.searchClients(partialName);

			// Original client should still be visible
			await expect(clientsPage.getClientRow(clientName!)).toBeVisible();
		});

		test('should search case insensitively', async () => {
			const firstRow = clientsPage.table.locator('tbody tr').first();
			const clientName = await firstRow.locator('td').first().textContent();

			test.skip(!clientName, 'No clients exist to search');

			// Search with uppercase
			await clientsPage.searchClients(clientName!.toUpperCase());
			await expect(clientsPage.getClientRow(clientName!)).toBeVisible();

			// Search with lowercase
			await clientsPage.clearSearch();
			await clientsPage.searchClients(clientName!.toLowerCase());
			await expect(clientsPage.getClientRow(clientName!)).toBeVisible();
		});

		test('should search by email domain', async () => {
			const firstRow = clientsPage.table.locator('tbody tr').first();
			const emailCell = firstRow.locator('td').nth(1);
			const email = await emailCell.textContent();

			test.skip(!email || !email.includes('@'), 'No valid email to search');

			// Search by domain part
			const domain = email!.split('@')[1];
			await clientsPage.searchClients(domain);

			// Table should have results
			const rowCount = await clientsPage.getTableRowCount();
			expect(rowCount).toBeGreaterThan(0);
		});

		test('should clear search and restore full list', async () => {
			// Search for something specific that won't exist
			await clientsPage.searchClients('NonExistentXYZ');
			await expect(clientsPage.emptyStateTitle).toBeVisible();

			// Clear search
			await clientsPage.clearSearch();
			await clientsPage.waitForTableLoad();

			// Verify list is restored (has results)
			// Note: Don't compare exact counts due to parallel test data mutations
			const finalCount = await clientsPage.getTableRowCount();
			expect(finalCount).toBeGreaterThan(0);
		});
	});

	test.describe('Dialog Interactions', () => {
		test('should close form dialog with Cancel button', async () => {
			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm({ name: 'Test Data' });

			await clientsPage.closeFormDialog();

			await expect(clientsPage.formDialog).toBeHidden();
		});

		test('should close form dialog with Escape key', async ({ page }) => {
			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm({ name: 'Test Data' });

			await page.keyboard.press('Escape');

			await expect(clientsPage.formDialog).toBeHidden();
		});

		test('should close delete dialog with Cancel', async () => {
			const firstRow = clientsPage.table.locator('tbody tr').first();
			const clientName = await firstRow.locator('td').first().textContent();

			test.skip(!clientName, 'No clients exist to test');

			await clientsPage.deleteClient(clientName!);
			await expect(clientsPage.deleteDialog).toBeVisible();

			await clientsPage.cancelDelete();
			await expect(clientsPage.deleteDialog).toBeHidden();
		});

		test('should close delete dialog with Escape key', async ({ page }) => {
			const firstRow = clientsPage.table.locator('tbody tr').first();
			const clientName = await firstRow.locator('td').first().textContent();

			test.skip(!clientName, 'No clients exist to test');

			await clientsPage.deleteClient(clientName!);
			await expect(clientsPage.deleteDialog).toBeVisible();

			await page.keyboard.press('Escape');
			await expect(clientsPage.deleteDialog).toBeHidden();
		});

		test('should not submit form on rapid multiple clicks', async () => {
			const newClient = createClientTestData();

			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm(newClient);

			// Get the submit button and rapidly click it using Promise.all to click simultaneously
			// This simulates rapid clicking better than sequential awaits
			const submitButton = clientsPage.submitButton;

			// Click multiple times without waiting for each to complete
			// Using force: true allows clicking even if element becomes disabled
			await Promise.all([
				submitButton.click({ force: true }).catch(() => {}),
				submitButton.click({ force: true }).catch(() => {}),
				submitButton.click({ force: true }).catch(() => {}),
			]);

			// Wait for the dialog to close (first click should succeed)
			await expect(clientsPage.formDialog).toBeHidden();
			await clientsPage.waitForToast(/client created/i);

			// Verify only one instance exists
			const rows = clientsPage.table.locator('tbody tr', {
				hasText: newClient.name,
			});
			await expect(rows).toHaveCount(1);
		});
	});

	test.describe('Data Persistence', () => {
		test('should persist created client after page refresh', async ({
			page,
		}) => {
			const newClient = createClientTestData();

			// Create client
			await clientsPage.openCreateDialog();
			await clientsPage.fillClientForm(newClient);
			await clientsPage.submitForm();
			await expect(clientsPage.formDialog).toBeHidden();
			await clientsPage.waitForToast(/client created/i);

			// Refresh page
			await page.reload();
			await clientsPage.waitForTableLoad();

			// Verify client still exists
			await expect(clientsPage.getClientRow(newClient.name)).toBeVisible();
		});

		test('should persist updated client after page refresh', async ({
			page,
		}) => {
			const firstRow = clientsPage.table.locator('tbody tr').first();
			const clientName = await firstRow.locator('td').first().textContent();

			test.skip(!clientName, 'No clients exist to edit');

			const updatedName = `Refreshed ${Date.now()}`;

			// Update client
			await clientsPage.editClient(clientName!);
			await clientsPage.fillClientForm({ name: updatedName });
			await clientsPage.submitForm();
			await expect(clientsPage.formDialog).toBeHidden();

			// Refresh page
			await page.reload();
			await clientsPage.waitForTableLoad();

			// Verify updated client exists
			await expect(clientsPage.getClientRow(updatedName)).toBeVisible();
		});

		test('should persist search state in URL', async ({ page }) => {
			const searchQuery = 'TestSearch';

			await clientsPage.searchClients(searchQuery);

			// Check URL contains search param
			const url = page.url();
			expect(url).toContain('search');

			// Refresh and verify search is preserved
			await page.reload();
			await clientsPage.waitForTableLoad();

			await expect(clientsPage.searchInput).toHaveValue(searchQuery);
		});
	});

	test.describe('Accessibility Extended', () => {
		test('should trap focus within form dialog', async ({ page }) => {
			await clientsPage.openCreateDialog();

			// Tab through all focusable elements
			const focusableCount = 10; // Approximate number of focusable elements
			for (let i = 0; i < focusableCount; i++) {
				await page.keyboard.press('Tab');
			}

			// Focus should cycle back to dialog elements, not escape
			const isWithinDialog = await clientsPage.formDialog
				.locator(':focus')
				.count();
			expect(isWithinDialog).toBeGreaterThan(0);
		});

		test('should announce form errors to screen reader', async () => {
			await clientsPage.openCreateDialog();
			await clientsPage.submitForm();

			// Error messages should have appropriate ARIA
			const errorMessage = clientsPage.getFieldError('Name');
			await expect(errorMessage).toBeVisible();

			// Check error message is associated with input via aria-describedby
			// The input should reference the error message id
			const nameInput = clientsPage.nameInput;
			await expect(nameInput).toHaveAttribute('aria-invalid', 'true');

			// Verify error message element exists and is associated
			const ariaDescribedBy = await nameInput.getAttribute('aria-describedby');
			expect(ariaDescribedBy).toBeTruthy();
			// The error message id should be in aria-describedby
			const errorMessageId = await errorMessage.getAttribute('id');
			expect(ariaDescribedBy).toContain(errorMessageId);
		});

		test('should have proper focus management after dialog close', async ({
			page,
		}) => {
			await clientsPage.openCreateDialog();
			await page.keyboard.press('Escape');

			// Focus should return to the trigger button
			await expect(clientsPage.addClientButton).toBeFocused();
		});

		test('should support keyboard-only table navigation', async ({ page }) => {
			// Focus on the table area
			await clientsPage.table.focus();

			// Tab should move through interactive elements in the table
			await page.keyboard.press('Tab');

			const activeElement = page.locator(':focus');
			await expect(activeElement).toBeVisible();
		});

		test('should have accessible delete confirmation', async () => {
			const firstRow = clientsPage.table.locator('tbody tr').first();
			const clientName = await firstRow.locator('td').first().textContent();

			test.skip(!clientName, 'No clients exist to test');

			await clientsPage.deleteClient(clientName!);

			// Delete dialog should be an alertdialog
			await expect(clientsPage.deleteDialog).toHaveRole('alertdialog');

			// Should have descriptive content
			await expect(
				clientsPage.deleteDialog.getByText(/are you sure/i)
			).toBeVisible();

			await clientsPage.cancelDelete();
		});
	});
});
