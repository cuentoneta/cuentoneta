import { test, expect } from '@playwright/test';

/**
 * Tests de rendimiento para HomeComponent
 *
 * Estos tests validan que la página cumple con los presupuestos de rendimiento
 * basados en Core Web Vitals y métricas de carga.
 *
 * Umbrales basados en recomendaciones de Google:
 * - LCP (Largest Contentful Paint): < 2.5s (bueno), < 4s (necesita mejora)
 * - FCP (First Contentful Paint): < 1.8s (bueno), < 3s (necesita mejora)
 * - CLS (Cumulative Layout Shift): < 0.1 (bueno), < 0.25 (necesita mejora)
 */

// Presupuestos de rendimiento (en milisegundos, excepto CLS)
const PERFORMANCE_BUDGETS = {
	LOAD_TIME: 5000, // Tiempo total de carga
	LCP: 4000, // Largest Contentful Paint (umbral permisivo para CI)
	FCP: 3000, // First Contentful Paint
	DOM_CONTENT_LOADED: 5000, // DOMContentLoaded
} as const;

test.describe('HomeComponent - Performance', () => {
	test('página debe cargar dentro del presupuesto de tiempo', async ({ page }) => {
		const startTime = Date.now();

		await page.goto('/');
		await page.waitForLoadState('load');

		const loadTime = Date.now() - startTime;

		expect(loadTime).toBeLessThan(PERFORMANCE_BUDGETS.LOAD_TIME);
	});

	test('DOMContentLoaded debe ocurrir dentro del presupuesto', async ({ page }) => {
		await page.goto('/');

		const timing = await page.evaluate(() => {
			const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
			return {
				domContentLoaded: nav.domContentLoadedEventEnd - nav.startTime,
				loadEvent: nav.loadEventEnd - nav.startTime,
			};
		});

		expect(timing.domContentLoaded).toBeLessThan(PERFORMANCE_BUDGETS.DOM_CONTENT_LOADED);
	});

	test('LCP debe estar dentro del umbral aceptable', async ({ page }) => {
		await page.goto('/');

		// Esperar a que el contenido principal sea visible
		await page.waitForSelector('main.content');

		const lcp = await page.evaluate(() => {
			return new Promise<number>((resolve) => {
				// Si ya hay entradas LCP, usar la última
				const existingEntries = performance.getEntriesByType('largest-contentful-paint');
				if (existingEntries.length > 0) {
					resolve(existingEntries[existingEntries.length - 1].startTime);
					return;
				}

				// Si no, observar nuevas entradas
				new PerformanceObserver((list) => {
					const entries = list.getEntries();
					if (entries.length > 0) {
						resolve(entries[entries.length - 1].startTime);
					}
				}).observe({ type: 'largest-contentful-paint', buffered: true });

				// Timeout de seguridad
				setTimeout(() => resolve(PERFORMANCE_BUDGETS.LCP + 1), 5000);
			});
		});

		expect(lcp).toBeLessThan(PERFORMANCE_BUDGETS.LCP);
	});

	test('FCP debe estar dentro del umbral aceptable', async ({ page }) => {
		await page.goto('/');

		const fcp = await page.evaluate(() => {
			const entries = performance.getEntriesByType('paint');
			const fcpEntry = entries.find((entry) => entry.name === 'first-contentful-paint');
			return fcpEntry ? fcpEntry.startTime : null;
		});

		expect(fcp).not.toBeNull();
		expect(fcp).toBeLessThan(PERFORMANCE_BUDGETS.FCP);
	});

	test('no debe haber errores de JavaScript en la consola', async ({ page }) => {
		const errors: string[] = [];

		page.on('pageerror', (error) => {
			errors.push(error.message);
		});

		await page.goto('/');
		await page.waitForLoadState('networkidle');

		expect(errors).toHaveLength(0);
	});

	test('recursos críticos deben cargarse eficientemente', async ({ page }) => {
		const resourceTimings: { name: string; duration: number }[] = [];

		await page.goto('/');
		await page.waitForLoadState('load');

		const resources = await page.evaluate(() => {
			const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
			return entries
				.filter((entry) => entry.initiatorType === 'script' || entry.initiatorType === 'css')
				.map((entry) => ({
					name: entry.name.split('/').pop() || entry.name,
					duration: entry.duration,
				}));
		});

		// Verificar que no hay recursos que tarden más de 2 segundos
		const slowResources = resources.filter((r) => r.duration > 2000);
		expect(slowResources).toHaveLength(0);
	});
});
