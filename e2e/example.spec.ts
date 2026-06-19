import { test, expect } from '@playwright/test';

test('home: único H1 de contenido y marca en el header', async ({ page }) => {
	await page.goto('/');

	// La home debe tener exactamente un <h1> de contenido (sr-only). La marca del header
	// dejó de ser <h1> (ahora es un <span>), por lo que ya no duplica el encabezado.
	await expect(page.locator('h1')).toHaveCount(1);
	await expect(page.locator('h1')).toHaveText('Cuentos y relatos breves para leer en línea');

	// La marca sigue presente en el header y el <title> SEO contiene la marca.
	await expect(page.locator('header').getByText('La Cuentoneta').first()).toBeVisible();
	await expect(page).toHaveTitle(/La Cuentoneta/);

	// La home expone contenido indexable: la sección "Sobre La Cuentoneta" con texto sustantivo.
	await expect(page.getByRole('heading', { name: /Sobre La Cuentoneta/i })).toBeVisible();
	await expect(page.getByText(/proyecto abierto, comunitario y sin fines de lucro/i)).toBeVisible();

	// La home declara keywords relevantes en su meta tag.
	await expect(page.locator('meta[name="keywords"]')).toHaveAttribute('content', /relatos breves/);
});
