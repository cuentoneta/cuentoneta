import { expect, type Page, type Locator } from '@playwright/test';

/**
 * Utilidades de tests E2E para HomeComponent
 *
 * Estrategia de datos de prueba:
 * Estos tests utilizan intencionalmente datos reales del backend para validar
 * la integración completa entre el frontend y la API. Este enfoque:
 * - Valida escenarios reales con contenido actual
 * - Asegura que el contrato de la API se mantiene
 * - Prueba estados de carga y manejo de errores con condiciones de red reales
 *
 * Consideraciones:
 * - Los tests pueden fallar si los datos del backend cambian significativamente
 * - Requiere un servidor backend en ejecución
 *
 * Para tests unitarios aislados, considerar usar tests de componentes con datos mockeados.
 * Los casos extremos de red se prueban en home-edge-cases.spec.ts con mocking de rutas.
 */

// Test configuration constants
export const TEST_TIMEOUTS = {
	DEFAULT: 10000,
	SLOW_NETWORK: 15000,
	ELEMENT_WAIT: 10000,
} as const;

export const EXPECTED_COUNTS = {
	MAIN_SECTIONS: 4,
	// Verificamos las primeras 3 tarjetas para balancear cobertura vs velocidad.
	// Verificar todas las tarjetas ralentizaría los tests; 3 proporciona
	// confianza suficiente de que la estructura de datos es consistente.
	CARDS_TO_VERIFY: 3,
	MAX_LINKS_TO_VERIFY: 5, // Máximo de links de navegación a validar
	MAX_A11Y_LINKS_TO_CHECK: 10, // Máximo de links a verificar para accesibilidad
} as const;

export const TEST_SELECTORS = {
	CAROUSEL: 'cuentoneta-carousel',
	CAROUSEL_SKELETON: 'cuentoneta-carousel-skeleton',
	LATEST_DECK: 'cuentoneta-latest-stories-card-deck',
	MOST_READ_DECK: 'cuentoneta-most-read-stories-card-deck',
	COLLECTION_TEASER: 'cuentoneta-collection-teaser',
	COLLECTION_DECK: 'cuentoneta-collection-teasers-deck',
	CARD: '[data-testid="card"]',
	SKELETON: '[data-testid="skeleton"]',
	MAIN_CONTENT: 'main.content',
	FIRST_SECTION: 'main > section',
} as const;

export const CSS_CLASSES = {
	STORY_TITLE: '[data-testid="story-title"]',
	ORDER_NUMBER: '[data-testid="story-order"]',
	AUTHOR_NAME: '[data-testid="author-name"]',
	COLLECTION_TITLE: '[data-testid="collection-title"]',
	CAROUSEL_ASPECT_MOBILE: 'aspect-[540/220]',
	CAROUSEL_ASPECT_DESKTOP: 'sm:aspect-[1240/360]',
} as const;

export const VIEWPORTS = {
	MOBILE: { width: 375, height: 667 }, // iPhone SE
	TABLET: { width: 768, height: 1024 }, // iPad
	DESKTOP: { width: 1280, height: 720 }, // Standard desktop
} as const;

// Helper functions
export async function waitForElement(page: Page, selector: string, timeout = TEST_TIMEOUTS.ELEMENT_WAIT) {
	return await page.waitForSelector(selector, { timeout });
}

export async function waitForCards(page: Page, componentSelector: string) {
	return await waitForElement(page, `${componentSelector} [data-testid="card"]`);
}

export async function verifyStoryCardStructure(card: Locator) {
	// Author image
	await expect(card.locator('img[width="20"][height="20"]')).toBeVisible();
	// Author name
	await expect(card.locator('[data-testid="author-name"]')).toBeVisible();
	// Title
	await expect(card.locator('[data-testid="story-title"]')).toBeVisible();
	// Footer with reading time
	await expect(card.locator('footer')).toContainText(/minutos de lectura/);
}

// Common test setup
export async function setupHomePage(page: Page) {
	await page.goto('/');
	await page.waitForSelector('main.content');
}
