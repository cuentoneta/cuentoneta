import { test, expect } from '@playwright/test';
import { setupHomePage, waitForElement, TEST_SELECTORS } from './home.utils';

test.describe('HomeComponent - Featured Collections Section', () => {
	test.beforeEach(async ({ page }) => {
		await setupHomePage(page);
	});

	test('should render "Colecciones" heading', async ({ page }) => {
		const heading = page.locator('h2:has-text("Colecciones")');
		await expect(heading).toBeVisible();
	});

	test('should have collections description text', async ({ page }) => {
		const deck = page.locator(TEST_SELECTORS.COLLECTION_DECK);
		await expect(deck).toBeVisible();

		// Check for description text - use specific class selector
		const description = deck.locator('.text-neutral-600:has-text("Historias agrupadas")');
		await expect(description).toBeVisible();
	});

	test('should display storylist cards section', async ({ page }) => {
		// The featured collections section should exist
		const collectionsSection = page.locator('section.grid').last();
		await expect(collectionsSection).toBeVisible();

		// Wait for cards or skeletons to appear
		const cardsInSection = collectionsSection.locator(
			'cuentoneta-collection-teaser, cuentoneta-collection-teaser-skeleton',
		);
		await expect(cardsInSection.first()).toBeVisible({ timeout: 10000 });

		const count = await cardsInSection.count();

		// Should have at least one card or skeleton
		expect(count).toBeGreaterThan(0);
	});

	test('storylist cards should be visible in collections section', async ({ page }) => {
		// Get the collections section specifically
		const collectionsSection = page.locator('section.grid').last();

		// Wait for storylist cards to appear
		const cards = collectionsSection.locator('cuentoneta-collection-teaser');
		await expect(cards.first()).toBeVisible({ timeout: 10000 });

		const count = await cards.count();

		// Should have at least one storylist card
		expect(count).toBeGreaterThan(0);
	});

	test('storylist cards should have title', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.COLLECTION_TEASER);

		const firstCard = page.locator('cuentoneta-collection-teaser').first();
		const title = firstCard.locator('[data-testid="collection-title"]');

		await expect(title).toBeVisible();
		const titleText = await title.innerText();
		expect(titleText.length).toBeGreaterThan(0);
	});

	test('storylist cards should have description', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.COLLECTION_TEASER);

		const firstCard = page.locator('cuentoneta-collection-teaser').first();
		const description = firstCard.locator('cuentoneta-portable-text-parser');

		await expect(description).toBeVisible();
	});

	test('storylist cards should have story count', async ({ page }) => {
		// Wait for cards to be visible
		const cards = page.locator('cuentoneta-collection-teaser');
		await expect(cards.first()).toBeVisible({ timeout: 10000 });

		const count = await cards.count();

		// Only test if cards exist
		if (count > 0) {
			const firstCard = cards.first();
			const footer = firstCard.locator('footer');

			await expect(footer).toBeVisible();
			await expect(footer).toContainText(/historias/i);
		}
	});

	test('should have responsive grid layout', async ({ page }) => {
		const section = page.locator('section.grid').last();
		await expect(section).toBeVisible();

		const className = await section.getAttribute('class');
		expect(className).toContain('grid-cols-1');
		expect(className).toContain('sm:grid-cols-2');
	});

	test('storylist card link should have correct href', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.COLLECTION_TEASER);

		const firstCard = page.locator('cuentoneta-collection-teaser').first();
		const link = firstCard.locator('a.navigation-link');

		await expect(link).toHaveAttribute('href', /\/storylist\/.+/);
	});
});
