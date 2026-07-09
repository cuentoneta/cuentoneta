import { test, expect } from '@playwright/test';

test.describe('DMCA Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/dmca');
	});

	test('should render the DmcaComponent page', async ({ page }) => {
		const mainElement = page.locator('main');
		await expect(mainElement).toBeVisible();
	});

	test('should have all instances of "contacto@cuentoneta.ar" as clickable links', async ({ page }) => {
		const links = page.locator('a:has-text("contacto@cuentoneta.ar")');
		const elements = page.locator(':text("contacto@cuentoneta.ar")');

		const elementsCount = await elements.count();
		const linksCount = await links.count();

		expect(elementsCount).toEqual(linksCount);

		for (let i = 0; i < linksCount; i++) {
			const link = links.nth(i);
			await expect(link).toHaveAttribute('href', 'mailto:contacto@cuentoneta.ar');
			await expect(link).toBeVisible();
		}
	});
});
