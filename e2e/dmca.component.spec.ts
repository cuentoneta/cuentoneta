import { test, expect } from '@playwright/test';

test.describe('DMCA Component', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/dmca'); // Asegúrate de que esta ruta sea correcta para tu aplicación
	});

	test('should render the DmcaComponent page', async ({ page }) => {
		const mainElement = await page.locator('main');
		await expect(mainElement).toBeVisible();
	});

	test('should have all instances of "contacto@cuentoneta.ar" as clickable links', async ({ page }) => {
		const links = await page.locator('a:has-text("contacto@cuentoneta.ar")');
		const elements = await page.locator(':text("contacto@cuentoneta.ar")');

		const elementsCount = await elements.count();
		const linksCount = await elements.count();

		// Verifica que haya al menos un enlace
		expect(elementsCount).toEqual(linksCount);

		// Verifica que cada enlace sea clickeable y tenga el atributo href correcto
		for (let i = 0; i < linksCount; i++) {
			const link = links.nth(i);
			await expect(link).toHaveAttribute('href', 'mailto:contacto@cuentoneta.ar');
			await expect(link).toBeVisible();
		}
	});
});
