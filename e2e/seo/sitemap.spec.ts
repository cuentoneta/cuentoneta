/**
 * Tests e2e del sitemap (`/sitemap.xml`).
 *
 * Es la única capa que ve el documento completo con el repository real: el spec del servicio afirma
 * sobre entradas construidas a mano, así que no puede detectar que un tipo de contenido desapareció
 * del sitemap ni que el documento servido dejó de ser XML.
 *
 * Lo que se verifica:
 *  - A. Se sirve como XML.
 *  - B. Están las páginas estáticas y al menos una URL de cada tipo de contenido.
 *  - C. Cada `<url>` respeta la secuencia que exige el esquema de sitemaps.org.
 *  - D. Ninguna ubicación aparece repetida.
 *
 * No es una validación contra el esquema publicado: no cubre cardinalidades, el tipo de dato de la
 * fecha ni los límites de tamaño del documento.
 */
import { test, expect } from '@playwright/test';

import { childElementSequences, locations } from '@testing/sitemap-xml';

// El sitemap no se renderiza: se pide por HTTP y se lee como texto. Correrlo en los dos proyectos
// pagaría el doble en el gate más caro sin ejercitar nada distinto.
test.skip(({ browserName }) => browserName !== 'chromium');

let status: number;
let contentType: string | undefined;
let xml: string;

test.beforeAll(async ({ request }) => {
	const response = await request.get('/sitemap.xml');
	status = response.status();
	contentType = response.headers()['content-type'];
	xml = await response.text();
});

test('sitemap — A: se sirve como XML', () => {
	expect(status).toBe(200);
	expect(contentType).toContain('xml');
});

test('sitemap — B: cubre las páginas estáticas y los tres tipos de contenido', () => {
	const locs = locations(xml);
	// El origen sale de una URL de contenido y no de la primera entrada: derivarlo del orden volvería
	// la aserción de la raíz una tautología.
	const contentUrl = locs.find((loc) => loc.includes('/story/'));
	const origin = new URL(contentUrl ?? '').origin;

	// Piso y no conteo exacto: el dataset del entorno de tests cambia con cada sincronización.
	expect(locs).toContain(origin);
	expect(locs).toContain(`${origin}/about`);
	expect(locs).toContain(`${origin}/dmca`);
	expect(locs).toContain(`${origin}/collection`);
	expect(locs).toContain(`${origin}/literary-work`);
	expect(locs.some((loc) => loc.includes('/story/'))).toBe(true);
	expect(locs.some((loc) => loc.includes('/author/'))).toBe(true);
	expect(locs.some((loc) => loc.includes('/storylist/'))).toBe(true);
});

test('sitemap — C: cada entrada respeta la secuencia del esquema', () => {
	const sequences = childElementSequences(xml);

	expect(sequences.length).toBeGreaterThan(0);
	sequences.forEach((sequence) => expect(['loc,lastmod', 'loc']).toContain(sequence.join(',')));
});

test('sitemap — D: ninguna ubicación se repite', () => {
	const locs = locations(xml);

	expect(new Set(locs).size).toBe(locs.length);
});
