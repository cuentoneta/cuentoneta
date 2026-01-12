import { test, expect } from '@playwright/test';
import { setupHomePage, waitForElement, TEST_SELECTORS, EXPECTED_COUNTS } from './home.utils';

test.describe('HomeComponent - Accessibility', () => {
	test.beforeEach(async ({ page }) => {
		await setupHomePage(page);
	});

	test('all images should have alt text', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CARD);

		const images = page.locator('img');
		const count = await images.count();

		for (let i = 0; i < count; i++) {
			const alt = await images.nth(i).getAttribute('alt');
			expect(alt).toBeTruthy();
		}
	});

	test('headings should have proper hierarchy', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CARD);

		// Verificar encabezados h2
		const h2Headings = page.locator('h2');
		expect(await h2Headings.count()).toBeGreaterThan(0);

		// Verificar texto del encabezado para colecciones destacadas
		await expect(page.locator('h2:has-text("Colecciones")')).toBeVisible();
	});

	test('links should be keyboard accessible', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CARD);

		// Navegar con Tab al primer link
		await page.keyboard.press('Tab');
		const focusedElement = page.locator(':focus');
		await expect(focusedElement).toBeVisible();
	});

	test('interactive elements should have proper focus states', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CAROUSEL);

		// Verificar puntos del carrusel
		const dots = page.locator('.owl-dots .owl-dot');
		if ((await dots.count()) > 0) {
			await dots.first().focus();
			await expect(dots.first()).toBeFocused();
		}
	});

	test('semantic HTML elements should be used', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CARD);

		// Verificar elementos semánticos (usar first() para evitar violaciones de modo estricto)
		await expect(page.locator('main').first()).toBeVisible();
		await expect(page.locator('section').first()).toBeVisible();
		await expect(page.locator('article').first()).toBeVisible();
		await expect(page.locator('footer').first()).toBeVisible();
	});

	test('page should have lang attribute for accessibility', async ({ page }) => {
		const htmlLang = await page.locator('html').getAttribute('lang');
		expect(htmlLang).toBeTruthy();
	});

	test('links should have meaningful text content', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CARD);

		// Check that links have text content or aria-label
		const links = page.locator('a[href]');
		const count = Math.min(EXPECTED_COUNTS.MAX_A11Y_LINKS_TO_CHECK, await links.count());

		for (let i = 0; i < count; i++) {
			const link = links.nth(i);
			const text = await link.innerText();
			const ariaLabel = await link.getAttribute('aria-label');
			const hasImage = (await link.locator('img').count()) > 0;

			// Link should have text, aria-label, or contain an image with alt
			expect(text.trim().length > 0 || ariaLabel || hasImage).toBeTruthy();
		}
	});

	test('buttons and interactive elements should be focusable', async ({ page }) => {
		await waitForElement(page, TEST_SELECTORS.CARD);

		// Check that interactive elements can receive focus
		const interactiveElements = page.locator('a, button, [tabindex="0"]');
		const count = await interactiveElements.count();

		expect(count).toBeGreaterThan(0);

		// First interactive element should be focusable
		const firstElement = interactiveElements.first();
		await firstElement.focus();
		await expect(firstElement).toBeFocused();
	});
});
