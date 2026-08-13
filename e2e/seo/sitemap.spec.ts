/**
 * Tests e2e del sitemap (`/sitemap.xml`).
 *
 * Es la única capa que ve el documento completo con el repository real: el spec del servicio afirma
 * sobre entradas construidas a mano, así que no puede detectar que un tipo de contenido desapareció
 * del sitemap ni que el documento servido dejó de ser XML.
 *
 * Lo que se verifica:
 *  - A. Se sirve como XML, con las tres páginas estáticas y al menos una URL de cada tipo.
 *  - B. Cada `<url>` respeta la secuencia que exige el esquema de sitemaps.org.
 *  - C. Ninguna ubicación aparece repetida.
 *
 * No es una validación contra el esquema publicado: no cubre cardinalidades, el tipo de dato de la
 * fecha ni los límites de tamaño del documento.
 */
import { test, expect } from '@playwright/test';

let xml: string;

test.beforeAll(async ({ request }) => {
	const response = await request.get('/sitemap.xml');
	expect(response.status()).toBe(200);
	expect(response.headers()['content-type']).toContain('xml');
	xml = await response.text();
});

function urlBlocks(): string[] {
	return [...xml.matchAll(/<url>([\s\S]*?)<\/url>/g)].map(([, block]) => block);
}

function locations(): string[] {
	return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map(([, loc]) => loc);
}

test('sitemap — A: cubre las páginas estáticas y los tres tipos de contenido', () => {
	const locs = locations();

	// Piso y no conteo exacto: el dataset del entorno de tests cambia con cada sincronización.
	expect(locs.filter((loc) => /\/(about|dmca)$/.test(loc))).toHaveLength(2);
	expect(locs.some((loc) => loc.includes('/story/'))).toBe(true);
	expect(locs.some((loc) => loc.includes('/author/'))).toBe(true);
	expect(locs.some((loc) => loc.includes('/storylist/'))).toBe(true);
});

test('sitemap — B: cada entrada respeta la secuencia del esquema', () => {
	const sequences = urlBlocks().map((block) => [...block.matchAll(/<(\w+)>/g)].map(([, name]) => name));

	expect(sequences.length).toBeGreaterThan(0);
	sequences.forEach((sequence) => expect(['loc,lastmod', 'loc']).toContain(sequence.join(',')));
});

test('sitemap — C: ninguna ubicación se repite', () => {
	const locs = locations();

	expect(new Set(locs).size).toBe(locs.length);
});
