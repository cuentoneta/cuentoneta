/**
 * Tests e2e del sitemap (`/sitemap.xml`).
 *
 * Es la única capa que ve el documento completo con el repository real: el spec del servicio afirma
 * sobre entradas construidas a mano, así que no puede detectar que un tipo de contenido desapareció
 * del sitemap ni que el documento servido dejó de ser XML.
 *
 * Lo que se verifica:
 *  - A. Se sirve como XML.
 *  - B. Están las páginas estáticas y al menos una URL de cada tipo de contenido, y ninguna de las
 *       rutas retiradas.
 *  - C. Cada `<url>` respeta la secuencia que exige el esquema de sitemaps.org.
 *  - D. Ninguna ubicación aparece repetida.
 *  - E. Toda ficha de obra, autor o colección tiene un slug que el dominio puede construir: una que no
 *       lo tuviera anunciaría una URL que nunca se sirve.
 *  - F. Ninguna ficha de autor ni de colección publica un `lastmod` anterior a la revisión declarada de
 *       su página: la plantilla cambió ese día para todas, tengan o no obras más recientes.
 *
 * No es una validación contra el esquema publicado: no cubre cardinalidades, el tipo de dato de la
 * fecha ni los límites de tamaño del documento.
 */
import { expect } from '@playwright/test';

import { test } from '../_utils/test';

import { childElementSequences, locations, urlEntries } from '@testing/sitemap-xml';
import { isSlug } from '@models/slug.model';
import { PAGE_REVISED_ON, type RevisedPage } from '@api/modules/sitemap/sitemap.lastmod';

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
	const contentUrl = locs.find((loc) => loc.includes('/literary-work/'));
	const origin = new URL(contentUrl ?? '').origin;

	// Piso y no conteo exacto: el dataset del entorno de tests cambia con cada sincronización.
	expect(locs).toContain(origin);
	expect(locs).toContain(`${origin}/about`);
	expect(locs).toContain(`${origin}/dmca`);
	expect(locs).toContain(`${origin}/collection`);
	expect(locs).toContain(`${origin}/literary-work`);
	expect(locs).toContain(`${origin}/authors`);
	expect(locs.some((loc) => loc.includes('/literary-work/'))).toBe(true);
	expect(locs.some((loc) => loc.includes('/author/'))).toBe(true);
	expect(locs.some((loc) => loc.includes('/collection/'))).toBe(true);

	// Sin esto el caso pasaría con las rutas retiradas todavía adentro: anunciar una URL que responde
	// con un traslado permanente gasta rastreo en algo que ya se sabe que se movió.
	expect(locs.filter((loc) => loc.includes('/story/'))).toEqual([]);
	expect(locs.filter((loc) => loc.includes('/storylist/'))).toEqual([]);
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

test('sitemap — E: toda ficha publicada tiene un slug que el dominio puede construir', () => {
	const slugs = locations(xml)
		.map((loc) => new URL(loc).pathname.match(/^\/(?:literary-work|author|collection)\/([^/]+)$/)?.[1])
		.filter((slug): slug is string => slug !== undefined);

	expect(slugs.length).toBeGreaterThan(0);
	expect(slugs.filter((slug) => !isSlug(slug))).toEqual([]);
});

test('sitemap — F: ninguna ficha de autor ni de colección publica una fecha anterior a su revisión', () => {
	const revisedPages = urlEntries(xml).flatMap(({ loc, lastmod }) => {
		const { pathname } = new URL(loc);
		const page = (Object.keys(PAGE_REVISED_ON) as RevisedPage[]).find((type) => pathname.startsWith(`/${type}/`));
		return page ? [{ loc, lastmod, revisedOn: PAGE_REVISED_ON[page] }] : [];
	});

	expect(revisedPages.length).toBeGreaterThan(0);
	expect(revisedPages.filter(({ lastmod, revisedOn }) => !lastmod || lastmod < revisedOn)).toEqual([]);
});
