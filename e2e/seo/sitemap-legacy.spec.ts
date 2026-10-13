/**
 * Tests e2e del sitemap temporal de rutas viejas (`/sitemap-legacy.xml`).
 *
 * Existe para que el buscador vuelva a pedir las URLs viejas y vea su traslado, así que lo que importa
 * afirmar es que anuncia solo rutas viejas y que cada una lleva, con un 301, a una página que responde.
 *
 * Lo que se verifica:
 *  - A. Se sirve como XML.
 *  - B. Anuncia rutas viejas de obra y de colección, y ninguna otra.
 *  - C. Ninguna entrada lleva `lastmod`.
 *  - D. Ninguna ubicación aparece repetida.
 *  - E. Sobre una muestra, cada ruta responde 301 hacia una página que responde 200.
 *  - F. `robots.txt` declara los dos sitemaps.
 */
import { expect } from '@playwright/test';

import { test } from '../_utils/test';

import { childElementSequences, locations } from '@testing/sitemap-xml';

// Se pide por HTTP y se lee como texto: un segundo motor no ejercita nada distinto.
test.skip(({ browserName }) => browserName !== 'chromium');

let status: number;
let contentType: string | undefined;
let xml: string;

test.beforeAll(async ({ request }) => {
	const response = await request.get('/sitemap-legacy.xml');
	status = response.status();
	contentType = response.headers()['content-type'];
	xml = await response.text();
});

const pathOf = (loc: string) => new URL(loc).pathname;

// Cada ruta de la muestra cuesta una consulta a Sanity y un render SSR: la muestra cubre todas las
// colecciones, que son pocas, y una porción de obras espaciada a lo largo del documento.
function sample(): string[] {
	const literaryWorkSampleSize = 8;
	const paths = locations(xml).map(pathOf);
	const stories = paths.filter((path) => path.startsWith('/story/'));
	const step = Math.max(1, Math.floor(stories.length / literaryWorkSampleSize));
	// Las obras renombradas son las que no se trasladan tal cual: van siempre, porque son las únicas
	// cuyo destino depende de la tabla del middleware y no del slug pedido.
	const renamed = [
		'/story/un-dia-perfecto-para-el-pez-platano',
		'/story/un-dia-perfecto-para-el-pez-banana',
		'/story/IcyFox',
	];
	return [
		...stories.filter((_, index) => index % step === 0).slice(0, literaryWorkSampleSize),
		...renamed.filter((path) => paths.includes(path)),
		...paths.filter((path) => path.startsWith('/storylist/')),
	];
}

test('sitemap-legacy — A: se sirve como XML', () => {
	expect(status).toBe(200);
	expect(contentType).toContain('xml');
});

test('sitemap-legacy — B: anuncia rutas viejas de obra y de colección, y ninguna otra', () => {
	const paths = locations(xml).map(pathOf);

	// Piso y no conteo exacto: el dataset del entorno de tests cambia con cada sincronización.
	expect(paths.some((path) => path.startsWith('/story/'))).toBe(true);
	expect(paths.some((path) => path.startsWith('/storylist/'))).toBe(true);
	expect(paths.filter((path) => !/^\/(story|storylist)\/[^/]+$/.test(path))).toEqual([]);
});

test('sitemap-legacy — C: ninguna entrada lleva lastmod', () => {
	const sequences = childElementSequences(xml);

	expect(sequences.length).toBeGreaterThan(0);
	sequences.forEach((sequence) => expect(sequence).toEqual(['loc']));
});

test('sitemap-legacy — D: ninguna ubicación se repite', () => {
	const locs = locations(xml);

	expect(new Set(locs).size).toBe(locs.length);
});

test('sitemap-legacy — E: cada ruta de la muestra lleva con un 301 a una página que responde', async ({ request }) => {
	for (const path of sample()) {
		const section = path.startsWith('/storylist/') ? '/collection/' : '/literary-work/';
		const redirect = await request.get(path, { maxRedirects: 0 });
		const location = redirect.headers()['location'] ?? '';
		expect(redirect.status(), path).toBe(301);
		expect(location.startsWith(section), `${path} → ${location}`).toBe(true);

		const destination = await request.get(location, { maxRedirects: 0 });
		expect(destination.status(), `${path} → ${location}`).toBe(200);
	}
});

test('sitemap-legacy — F: robots.txt declara los dos sitemaps', async ({ request }) => {
	const robots = await (await request.get('/robots.txt')).text();
	const sitemaps = robots
		.split('\n')
		.filter((line) => line.startsWith('Sitemap:'))
		.map((line) => pathOf(line.replace('Sitemap:', '').trim()));

	expect(sitemaps).toEqual(['/sitemap.xml', '/sitemap-legacy.xml']);
});
