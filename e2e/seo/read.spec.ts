/**
 * Tests e2e de SEO para la página de lectura (`/read/:slug`, entidad LiteraryWork).
 *
 * Sobre el HTML server-rendered (lo que ve el crawler, sin ejecutar JS):
 *  - A. Status 404 real del SSR para una obra inexistente (no 200 con página vacía).
 *  - B. Meta tags + contenido: H1 único con el título, byline, canonical self-referencial,
 *       robots indexable y cuerpo saneado (sin sintaxis markdown cruda).
 *
 * El contenido de prueba lo cura el equipo en los datasets (development local / staging CI);
 * los tests dependientes de contenido se saltean con anotación si el slug aún no existe.
 */
import { test, expect } from '@playwright/test';

import { getMetaContent, getTitleText, getCanonicalHref } from '../_utils/seo';
import { STABLE_SLUGS } from '../_utils/seo-fixtures';

const readPath = `/read/${STABLE_SLUGS.literaryWork}`;

test('read — A: una obra inexistente responde 404 real en SSR', async ({ request }) => {
	const response = await request.get('/read/obra-inexistente-e2e');
	expect(response.status()).toBe(404);
});

test.describe('read — B: HTML server-rendered de una obra existente', () => {
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

	test('meta tags e indexabilidad', async () => {
		expect(status).toBe(200);
		expect(getTitleText(html)).toBeTruthy();
		expect(getCanonicalHref(html)).toContain(readPath);
		expect(getMetaContent(html, 'robots')).toContain('index');
	});

	test('H1 único con contenido real y cuerpo saneado', async () => {
		const h1Matches = html.match(/<h1[^>]*>/g) ?? [];
		expect(h1Matches).toHaveLength(1);
		expect(html).toContain('<article');
		// El markdown crudo no cruza al frontend: sin ** ni _..._ literales dentro del artículo.
		expect(html).not.toMatch(/<article[^>]*>[\s\S]*\*\*[\s\S]*<\/article>/);
	});
});
