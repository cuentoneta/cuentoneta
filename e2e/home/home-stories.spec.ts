import { test, expect } from '@playwright/test';
import { setupHomePage, waitForCards, verifyStoryCardStructure, EXPECTED_COUNTS } from './home.utils';

test.describe('HomeComponent - Latest Stories Card Deck Section', () => {
	test.beforeEach(async ({ page }) => {
		await setupHomePage(page);
	});

	test('should display latest stories card deck component', async ({ page }) => {
		const latestDeck = page.locator('cuentoneta-latest-stories-card-deck');
		await expect(latestDeck).toBeVisible();
	});

	test('should display latest story cards or skeletons', async ({ page }) => {
		const latestDeck = page.locator('cuentoneta-latest-stories-card-deck');
		await expect(latestDeck).toBeVisible();

		// Wait for either cards or skeletons to appear
		await page.waitForSelector(
			'cuentoneta-latest-stories-card-deck [data-testid="card"], cuentoneta-latest-stories-card-deck [data-testid="skeleton"]',
			{
				timeout: 10000,
			},
		);

		const cards = latestDeck.locator('[data-testid="card"]');
		const skeletons = latestDeck.locator('[data-testid="skeleton"]');

		const cardsCount = await cards.count();
		const skeletonsCount = await skeletons.count();

		// Should have at least one card or skeleton visible
		expect(cardsCount + skeletonsCount).toBeGreaterThan(0);
	});

	test('should display story cards after loading', async ({ page }) => {
		// Esperar las tarjetas reales (no skeletons)
		await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

		const latestDeck = page.locator('cuentoneta-latest-stories-card-deck');
		const cards = latestDeck.locator('[data-testid="card"]');
		expect(await cards.count()).toBeGreaterThan(0);
	});

	test('story cards should have correct structure', async ({ page }) => {
		await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

		const firstCard = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]').first();

		// Use shared helper to verify common card structure
		await verifyStoryCardStructure(firstCard);

		// Additional checks specific to latest stories
		const titleText = await firstCard.locator('[data-testid="story-title"]').innerText();
		expect(titleText.length).toBeGreaterThan(0);

		await expect(firstCard.locator('footer')).toContainText('Leer ->');
	});

	test('story cards should have order numbers', async ({ page }) => {
		await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

		const cards = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]');

		// Check first few cards have order numbers
		for (let i = 0; i < EXPECTED_COUNTS.CARDS_TO_VERIFY; i++) {
			const card = cards.nth(i);
			const orderNumber = card.locator('[data-testid="story-order"]');
			await expect(orderNumber).toBeVisible();

			const orderText = await orderNumber.innerText();
			expect(orderText).toMatch(/^0?[1-9]\.$/);
		}
	});

	test('should have responsive grid layout', async ({ page }) => {
		const section = page.locator('cuentoneta-latest-stories-card-deck section');
		await expect(section).toBeVisible();

		const className = await section.getAttribute('class');
		expect(className).toContain('grid-cols-1');
		expect(className).toContain('md:grid-cols-3');
	});

	test('story title link should have correct href', async ({ page }) => {
		await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

		const firstCard = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]').first();
		const storyLink = firstCard.locator('a[href^="/story/"]');

		await expect(storyLink).toHaveAttribute('href', /\/story\/.+/);
	});

	test('author link should have correct href', async ({ page }) => {
		await waitForCards(page, 'cuentoneta-latest-stories-card-deck');

		const firstCard = page.locator('cuentoneta-latest-stories-card-deck [data-testid="card"]').first();
		const authorLink = firstCard.locator('a[href^="/author/"]');

		await expect(authorLink).toHaveAttribute('href', /\/author\/.+/);
	});
});

test.describe('HomeComponent - Most Read Stories Card Deck Section', () => {
	test.beforeEach(async ({ page }) => {
		await setupHomePage(page);
	});

	test('should display most-read stories card deck component', async ({ page }) => {
		const mostReadDeck = page.locator('cuentoneta-most-read-stories-card-deck');
		await expect(mostReadDeck).toBeVisible();
	});

	test('should display most-read story cards', async ({ page }) => {
		await waitForCards(page, 'cuentoneta-most-read-stories-card-deck');

		const mostReadDeck = page.locator('cuentoneta-most-read-stories-card-deck');
		const cards = mostReadDeck.locator('[data-testid="card"]');

		expect(await cards.count()).toBeGreaterThan(0);
	});

	test('most-read cards should have correct structure', async ({ page }) => {
		await waitForCards(page, 'cuentoneta-most-read-stories-card-deck');

		const firstCard = page.locator('cuentoneta-most-read-stories-card-deck [data-testid="card"]').first();

		// Use shared helper to verify card structure (same as latest stories)
		await verifyStoryCardStructure(firstCard);
	});
});
