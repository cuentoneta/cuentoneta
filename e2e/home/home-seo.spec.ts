import { test, expect } from '@playwright/test';
import { setupHomePage } from './home.utils';

test.describe('HomeComponent - SEO and Meta Tags', () => {
	test.beforeEach(async ({ page }) => {
		await setupHomePage(page);
	});

	test('should have correct page title', async ({ page }) => {
		await expect(page).toHaveTitle('La Cuentoneta');
	});

	test('should have meta description', async ({ page }) => {
		const metaDescription = page.locator('meta[name="description"]');
		await expect(metaDescription).toHaveAttribute(
			'content',
			'Una iniciativa que busca fomentar y hacer accesible la lectura digital.',
		);
	});

	test('should have meta keywords', async ({ page }) => {
		const metaKeywords = page.locator('meta[name="keywords"]');
		const content = await metaKeywords.getAttribute('content');
		expect(content).toBeTruthy();
		expect(content).toContain('cuentos');
		expect(content).toContain('literatura');
	});

	test('should have canonical URL', async ({ page }) => {
		const canonical = page.locator('link[rel="canonical"]');
		await expect(canonical).toHaveAttribute('href', /.+/);
	});

	test('should have robots meta tag set to index, follow', async ({ page }) => {
		const robots = page.locator('meta[name="robots"]');
		await expect(robots).toHaveAttribute('content', 'index, follow');
	});

	test('should have Open Graph meta tags', async ({ page }) => {
		const ogTitle = page.locator('meta[property="og:title"]');
		await expect(ogTitle).toHaveAttribute('content', 'La Cuentoneta');

		const ogDescription = page.locator('meta[property="og:description"]');
		await expect(ogDescription).toBeAttached();
	});

	test('should have Twitter card meta tags', async ({ page }) => {
		const twitterTitle = page.locator('meta[name="twitter:title"]');
		await expect(twitterTitle).toHaveAttribute('content', 'La Cuentoneta');
	});
});
