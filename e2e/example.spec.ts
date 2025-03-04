import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
	await page.goto('/');

	// Expect h1 to contain a substring.
	expect(await page.locator('header').locator('h1').innerText()).toContain('La Cuentoneta');
});
