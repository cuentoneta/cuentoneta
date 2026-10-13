/**
 * Tests e2e del sitemap temporal de rutas viejas (`/sitemap-legacy.xml`).
 *
 * Existe para que el buscador vuelva a pedir las URLs viejas y vea su traslado, así que lo que importa
 * afirmar es que anuncia solo rutas viejas y que cada una lleva, con un 301, a una página que responde.
 *
 * Lo que se verifica:
 *  - A. Se sirve como XML.
 *  - B. Anuncia rutas viejas de obra y de colección, y ninguna otra.
 *  - C. Cada entrada lleva como `lastmod` la fecha de la mudanza.
 *  - D. Ninguna ubicación aparece repetida.
 *  - E. Sobre una muestra, cada ruta responde 301 hacia una página que responde 200.
 *  - F. Cada obra renombrada lleva exactamente a su obra.
 *  - G. `robots.txt` declara los dos sitemaps.
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
	return [
		...stories.filter((_, index) => index % step === 0).slice(0, literaryWorkSampleSize),
		...paths.filter((path) => path.startsWith('/storylist/')),
	];
}

test('sitemap-legacy — A: se sirve como XML', () => {
	expect(status).toBe(200);
	expect(contentType).toContain('xml');
});

test('sitemap-legacy — B: anuncia rutas viejas de obra y de colección, y ninguna otra', () => {
	const paths = locations(xml).map(pathOf);

	expect(paths.some((path) => path.startsWith('/story/'))).toBe(true);
	expect(paths.some((path) => path.startsWith('/storylist/'))).toBe(true);
	expect(paths.filter((path) => !/^\/(story|storylist)\/[^/]+$/.test(path))).toEqual([]);
});

// El `lastmod` es la fecha en que las rutas viejas pasaron a redirigir: es lo que le dice al buscador que
// cambiaron después de su última visita. Otra fecha sería falsa, y una señal falsa le quita la confianza.
test('sitemap-legacy — C: cada entrada lleva como lastmod la fecha de la mudanza', () => {
	const sequences = childElementSequences(xml);
	const lastmods = [...xml.matchAll(/<lastmod>([^<]*)<\/lastmod>/g)].map(([, date]) => date);

	expect(sequences.length).toBeGreaterThan(0);
	sequences.forEach((sequence) => expect(sequence).toEqual(['loc', 'lastmod']));
	expect(new Set(lastmods)).toEqual(new Set(['2026-08-31']));
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

// Las obras renombradas son las únicas que no se trasladan tal cual. Se afirma el destino exacto, y no
// solo que responda: el slug viejo de una puede ser el vigente de otra, que también responde 200.
for (const [path, destination] of [
	['/story/un-dia-perfecto-para-el-pez-platano', '/literary-work/la-pelota'],
	['/story/un-dia-perfecto-para-el-pez-banana', '/literary-work/un-dia-perfecto-para-el-pez-platano'],
	['/story/IcyFox', '/literary-work/que-seria-yo-sin-ti'],
] as const) {
	test(`sitemap-legacy — F: la obra renombrada ${path} lleva a ${destination}, que responde`, async ({ request }) => {
		expect(locations(xml).map(pathOf)).toContain(path);

		const redirect = await request.get(path, { maxRedirects: 0 });
		expect(redirect.status()).toBe(301);
		expect(redirect.headers()['location']).toBe(destination);
		expect((await request.get(destination, { maxRedirects: 0 })).status()).toBe(200);
	});
}

test('sitemap-legacy — G: robots.txt declara los dos sitemaps', async ({ request }) => {
	const robots = await (await request.get('/robots.txt')).text();
	const sitemaps = robots
		.split('\n')
		.filter((line) => line.startsWith('Sitemap:'))
		.map((line) => pathOf(line.replace('Sitemap:', '').trim()));

	expect(sitemaps).toEqual(['/sitemap.xml', '/sitemap-legacy.xml']);
});
