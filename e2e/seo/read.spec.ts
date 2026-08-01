/**
 * Tests e2e de SEO para la página de lectura (`/read/:slug`, entidad LiteraryWork).
 *
 * Sobre el HTML server-rendered (lo que ve el crawler, sin ejecutar JS):
 *  - A. Status 404 real del SSR para una obra inexistente (no 200 con página vacía).
 *  - B. Meta tags + contenido: H1 único con el título, canonical self-referencial, robots
 *       `noindex` (opt-out temporal de indexación) y cuerpo saneado (sin sintaxis markdown cruda).
 *  - C. Sin JSON-LD de obra: al ser noindex no se emiten los bloques page-scoped `Article`/`BreadcrumbList`.
 *
 * El contenido de prueba lo cura el equipo en los datasets (development local / staging CI);
 * los tests dependientes de contenido se saltean con anotación si el slug aún no existe.
 */
import { test, expect } from '@playwright/test';

import { parseJsonLdBlocks, getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import { STABLE_SLUGS, SCHEMA_IDS } from '../_utils/seo-fixtures';

const readPath = `/read/${STABLE_SLUGS.literaryWork}`;

test('read — A: una obra inexistente responde 404 real en SSR', async ({ request }) => {
	const response = await request.get('/read/obra-inexistente-e2e');
	expect(response.status()).toBe(404);
});

test.describe('read — HTML server-rendered de una obra existente', () => {
	let status: number;
	let html: string;

	test.beforeAll(async ({ request }) => {
		const response = await request.get(readPath);
		status = response.status();
		html = await response.text();
	});

	test.beforeEach(() => {
		// Contenido curado a mano en el dataset: si todavía no existe, se saltea con señal clara
		// en vez de fallar el gate.
		// eslint-disable-next-line playwright/no-skipped-test -- skip condicional por contenido del dataset, no un test deshabilitado
		test.skip(status === 404, `No existe literaryWork con slug "${STABLE_SLUGS.literaryWork}" en el dataset`);
	});

	test('B: meta tags y opt-out de indexación', async () => {
		expect(status).toBe(200);
		expect(getTitleText(html)).toBeTruthy();
		expect(getCanonicalHref(html)).toContain(readPath);
		// Opt-out temporal: la página se sirve noindex. `noindex` contiene el substring `index`, así que
		// se afirma el literal completo `noindex`, no `toContain('index')` (que pasaría con ambos valores).
		expect(getMetaContent(html, 'robots')).toContain('noindex');
	});

	test('B: H1 único con contenido real y cuerpo saneado', async () => {
		const h1Matches = html.match(/<h1[^>]*>/g) ?? [];
		expect(h1Matches).toHaveLength(1);
		expect(html).toContain('<article');
		// El markdown crudo no cruza al frontend: sin ** literales dentro del artículo.
		expect(html).not.toMatch(/<article[^>]*>[\s\S]*\*\*[\s\S]*<\/article>/);
	});

	test('C: sin JSON-LD de obra (página no indexable)', () => {
		const blocks = parseJsonLdBlocks(html);
		// Opt-out temporal: la ReadStructuredDataDirective queda aparcada, así que el HTML
		// server-rendered no trae los bloques page-scoped Article/BreadcrumbList de la obra.
		expect(blocks.has(SCHEMA_IDS.article)).toBe(false);
		expect(blocks.has(SCHEMA_IDS.breadcrumbRead)).toBe(false);
	});
});
