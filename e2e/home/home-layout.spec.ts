import { test, expect } from '@playwright/test';
import { setupHomePage, waitForElement, TEST_SELECTORS, CSS_CLASSES, EXPECTED_COUNTS, VIEWPORTS } from './home.utils';

test.describe('HomeComponent - Navigation and Links', () => {
	test.beforeEach(async ({ page }) => {
		await setupHomePage(page);
	});

	test('campaign carousel slide links should be valid', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CAROUSEL);

		const carousel = page.locator(TEST_SELECTORS.CAROUSEL);
		const links = carousel.locator('.slide.active a');
		if ((await links.count()) > 0) {
			const href = await links.first().getAttribute('href');
			expect(href).toBeTruthy();
		}
	});

	test('story card links should navigate with correct paths', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CARD);

		const firstCard = page.locator('[data-testid="card"]').first();
		const storyLink = firstCard.locator('a[href^="/story/"]');

		// Verify navigation
		const href = await storyLink.getAttribute('href');
		expect(href).toMatch(/\/story\/.+/);
	});

	test('author links should navigate correctly', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CARD);

		const firstCard = page.locator('[data-testid="card"]').first();
		const authorLink = firstCard.locator('a[href^="/author/"]');

		const href = await authorLink.getAttribute('href');
		expect(href).toMatch(/\/author\/.+/);
	});

	test('all navigation links should be accessible', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CARD);

		// Obtener todos los links de la página
		const links = page.locator('a[href]');
		const count = await links.count();

		expect(count).toBeGreaterThan(0);

		// Verificar que los primeros links son válidos
		const linkCount = Math.min(EXPECTED_COUNTS.MAX_LINKS_TO_VERIFY, count);
		for (let i = 0; i < linkCount; i++) {
			const href = await links.nth(i).getAttribute('href');
			expect(href).toBeTruthy();
		}
	});
});

test.describe('HomeComponent - Responsive Layout', () => {
	// Reset viewport to default after each test to ensure test isolation
	test.afterEach(async ({ page }) => {
		await page.setViewportSize(VIEWPORTS.DESKTOP);
	});

	test('mobile: should display single column layouts', async ({ page }) => {
		await page.setViewportSize(VIEWPORTS.MOBILE);
		await page.goto('/');

		await page.waitForSelector('main.content');

		// Check latest stories grid has CSS class for single column
		const latestGrid = page.locator('cuentoneta-latest-stories-card-deck section');
		const latestClass = await latestGrid.getAttribute('class');
		expect(latestClass).toContain('grid-cols-1');

		// Verify actual computed grid columns (should be single column on mobile)
		const computedColumns = await latestGrid.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);
		// Single column should have just one column value (not multiple)
		expect(computedColumns.split(' ').length).toBe(1);

		// Check featured collections grid
		const collectionsGrid = page.locator('section.grid').last();
		const collectionsClass = await collectionsGrid.getAttribute('class');
		expect(collectionsClass).toContain('grid-cols-1');
	});

	test('desktop: should display multi-column layouts', async ({ page }) => {
		await page.setViewportSize(VIEWPORTS.DESKTOP);
		await page.goto('/');

		await page.waitForSelector('main.content');

		// Grids should adapt to larger screens
		const latestGrid = page.locator('cuentoneta-latest-stories-card-deck section');
		await expect(latestGrid).toBeVisible();

		// Verify actual computed grid columns (should be multiple columns on desktop)
		const computedColumns = await latestGrid.evaluate((el) => window.getComputedStyle(el).gridTemplateColumns);
		// Multiple columns should have more than one column value
		expect(computedColumns.split(' ').length).toBeGreaterThan(1);

		const collectionsGrid = page.locator('section.grid').last();
		await expect(collectionsGrid).toBeVisible();
	});

	test('mobile: carousel should use correct height', async ({ page }) => {
		await page.setViewportSize(VIEWPORTS.MOBILE);
		await page.goto('/');

		await page.waitForSelector('main > section');

		const section = page.locator('main > section').first();
		const className = await section.getAttribute('class');
		expect(className).toContain(CSS_CLASSES.CAROUSEL_ASPECT_MOBILE);
	});

	test('desktop: carousel should use correct height', async ({ page }) => {
		await page.setViewportSize(VIEWPORTS.DESKTOP);
		await page.goto('/');

		await page.waitForSelector('main > section');

		const section = page.locator('main > section').first();
		const className = await section.getAttribute('class');
		expect(className).toContain(CSS_CLASSES.CAROUSEL_ASPECT_DESKTOP);
	});

	test('tablet: should use appropriate breakpoints', async ({ page }) => {
		await page.setViewportSize(VIEWPORTS.TABLET);
		await page.goto('/');

		await page.waitForSelector('main.content');

		// Should display multi-column at tablet size
		const latestGrid = page.locator('cuentoneta-latest-stories-card-deck section');
		await expect(latestGrid).toBeVisible();
	});
});

test.describe('HomeComponent - Loading States and Skeletons', () => {
	test.beforeEach(async ({ page }) => {
		await setupHomePage(page);
	});

	test('should show carousel section', async ({ page }) => {
		// The carousel section should always exist
		const section = page.locator('main > section').first();
		await expect(section).toBeVisible();
	});

	test('should show story card deck components', async ({ page }) => {
		// Story card decks should exist
		const latestDeck = page.locator('cuentoneta-latest-stories-card-deck');
		const mostReadDeck = page.locator('cuentoneta-most-read-stories-card-deck');

		await expect(latestDeck).toBeVisible();
		await expect(mostReadDeck).toBeVisible();
	});

	test('should show featured collections section', async ({ page }) => {
		// Featured collections section should exist
		const collectionsSection = page.locator('section').filter({ hasText: 'Colecciones' });
		await expect(collectionsSection).toBeVisible();
	});

	test('carousel section should have correct structure', async ({ page }) => {
		const section = page.locator('main > section').first();
		await expect(section).toBeVisible();

		// Check if it has the height classes
		const className = await section.getAttribute('class');
		expect(className).toContain(CSS_CLASSES.CAROUSEL_ASPECT_MOBILE);
	});

	test('story card decks should have correct grid structure', async ({ page }) => {
		const latestGrid = page.locator('cuentoneta-latest-stories-card-deck section');
		await expect(latestGrid).toBeVisible();

		const className = await latestGrid.getAttribute('class');
		expect(className).toContain('grid');
		expect(className).toContain('grid-cols-1');
	});

	test('all content should eventually load', async ({ page }) => {
		// El contenido principal debe ser visible
		const mainContent = page.locator(TEST_SELECTORS.MAIN_CONTENT);
		await expect(mainContent).toBeVisible();

		// Los mazos de tarjetas deben ser visibles
		const latestDeck = page.locator(TEST_SELECTORS.LATEST_DECK);
		await expect(latestDeck).toBeVisible();

		// Esperar a que las tarjetas se carguen
		await waitForElement(page, TEST_SELECTORS.CARD);
	});
});
