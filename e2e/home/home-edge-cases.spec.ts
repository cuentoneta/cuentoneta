import { test, expect } from '@playwright/test';
import {
	setupHomePage,
	waitForElement,
	waitForCards,
	TEST_SELECTORS,
	EXPECTED_COUNTS,
	TEST_TIMEOUTS,
} from './home.utils';

test.describe('HomeComponent - Content Integrity', () => {
	test.beforeEach(async ({ page }) => {
		await setupHomePage(page);
	});

	test('should load data successfully', async ({ page }) => {
		// Verificar que la página cargó exitosamente revisando componentes clave
		// Esto prueba indirectamente que la llamada a la API fue exitosa
		await waitForElement(page, TEST_SELECTORS.CARD);

		// Todos los componentes principales deben ser visibles, indicando carga exitosa de datos
		const latestDeck = page.locator(TEST_SELECTORS.LATEST_DECK);
		const mostReadDeck = page.locator(TEST_SELECTORS.MOST_READ_DECK);
		const collectionsSection = page.locator('section').filter({ hasText: 'Colecciones' });

		await expect(latestDeck).toBeVisible();
		await expect(mostReadDeck).toBeVisible();
		await expect(collectionsSection).toBeVisible();
	});

	test('should display latest stories', async ({ page }) => {
		await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

		const latestCards = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]');
		expect(await latestCards.count()).toBeGreaterThan(0);
	});

	test('should display most-read stories', async ({ page }) => {
		await waitForCards(page, 'cuentoneta-most-read-stories-card-deck');

		const mostReadCards = page.locator('cuentoneta-most-read-stories-card-deck [data-testid="card"]');
		expect(await mostReadCards.count()).toBeGreaterThan(0);
	});

	test('should display featured collections in grid section', async ({ page }) => {
		// Get cards specifically from the collections grid section
		const collectionsSection = page.locator('section.grid').last();
		const cards = collectionsSection.locator('cuentoneta-collection-teaser');

		// Wait for at least one card to be visible
		await expect(cards.first()).toBeVisible({ timeout: 10000 });

		const count = await cards.count();

		// Should have at least one storylist card
		expect(count).toBeGreaterThan(0);
	});

	test('all sections should be present', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CARD);

		const sections = page.locator(`${TEST_SELECTORS.MAIN_CONTENT} > section`);
		expect(await sections.count()).toBe(EXPECTED_COUNTS.MAIN_SECTIONS);
	});

	test('story cards should have consistent data structure', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CARD);

		const cards = page.locator('[data-testid="card"]');

		// Check first cards for consistency
		for (let i = 0; i < EXPECTED_COUNTS.CARDS_TO_VERIFY; i++) {
			const card = cards.nth(i);

			// Each card should have these elements
			await expect(card.locator('img[width="20"]')).toBeVisible(); // Author image
			await expect(card.locator('[data-testid="author-name"]')).toBeVisible(); // Author name
			await expect(card.locator('[data-testid="story-title"]')).toBeVisible(); // Title
			await expect(card.locator('footer')).toBeVisible(); // Footer with reading time
		}
	});
});

test.describe('HomeComponent - Edge Cases', () => {
	// Nested describe for tests requiring route mocking
	test.describe('Network and Data Edge Cases', () => {
		// Override beforeEach to avoid immediate navigation
		test.beforeEach(async ({ page }) => {});

		test('should handle slow network gracefully', async ({ page }) => {
			// Configure route before navigation
			await page.route('**/api/content/landing-page', async (route) => {
				await new Promise((resolve) => setTimeout(resolve, 1000));
				await route.continue();
			});

			// Navigate with route configured
			await page.goto('/', { waitUntil: 'domcontentloaded' });

			await expect(page.locator(TEST_SELECTORS.MAIN_CONTENT)).toBeVisible();
			const cards = page.locator(TEST_SELECTORS.CARD);
			await expect(cards.first()).toBeVisible({
				timeout: TEST_TIMEOUTS.SLOW_NETWORK,
			});
		});

		test('should handle empty campaign array gracefully', async ({ page }) => {
			// Configure route before navigation
			await page.route('**/api/content/landing-page', async (route) => {
				const response = await route.fetch();
				const data = await response.json();
				data.campaigns = [];
				await route.fulfill({ json: data });
			});

			await page.goto('/', { waitUntil: 'domcontentloaded' });

			const carousel = page.locator(TEST_SELECTORS.CAROUSEL);
			const carouselSlides = carousel.locator('.slide');
			expect(await carouselSlides.count()).toBe(0);

			await expect(page.locator(TEST_SELECTORS.LATEST_DECK)).toBeVisible();
			const cards = page.locator(`${TEST_SELECTORS.LATEST_DECK} ${TEST_SELECTORS.CARD}`);
			await expect(cards.first()).toBeVisible();
		});

		test('should handle API 500 error gracefully', async ({ page }) => {
			// Mock API to return 500 error
			await page.route('**/api/content/landing-page', async (route) => {
				await route.fulfill({
					status: 500,
					contentType: 'application/json',
					body: JSON.stringify({ error: 'Internal Server Error' }),
				});
			});

			await page.goto('/', { waitUntil: 'domcontentloaded' });

			// Page should still render main content structure
			await expect(page.locator(TEST_SELECTORS.MAIN_CONTENT)).toBeVisible();

			// Component decks should be visible (showing loading or empty state)
			await expect(page.locator(TEST_SELECTORS.LATEST_DECK)).toBeVisible();
			await expect(page.locator(TEST_SELECTORS.MOST_READ_DECK)).toBeVisible();
		});

		test('should handle network failure gracefully', async ({ page }) => {
			// Mock network failure
			await page.route('**/api/content/landing-page', async (route) => {
				await route.abort('failed');
			});

			await page.goto('/', { waitUntil: 'domcontentloaded' });

			// Page should still render main content structure even with network failure
			await expect(page.locator(TEST_SELECTORS.MAIN_CONTENT)).toBeVisible();
		});
	});

	// Other edge cases use root beforeEach
	test('should handle missing storylist tags gracefully', async ({ page }) => {
		await page.goto('/');
		await page.waitForSelector('main.content');

		// Wait for cards to be visible
		const cards = page.locator('cuentoneta-collection-teaser');
		await expect(cards.first()).toBeVisible({ timeout: 10000 });

		const count = await cards.count();

		// Cards should be displayed even if tags are not visible
		expect(count).toBeGreaterThan(0);

		// Verify card structure is in place even without tags
		const firstCard = cards.first();
		await expect(firstCard.locator('[data-testid="collection-title"]')).toBeVisible(); // Title should be visible
	});
});
