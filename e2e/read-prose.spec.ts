/**
 * Test e2e del tratamiento tipográfico de la prosa (`/read/:slug`).
 *
 * Es la única aserción de la suite que ve el CSS ya aplicado: las reglas de la prosa viven en una hoja
 * global (los nodos los emite el pipeline de Markdown y no llevan clases), así que ningún test unitario
 * puede afirmar que llegan a destino sin medir implementación.
 *
 * El contenido de prueba lo cura el equipo en los datasets (development local / staging CI); el caso se
 * saltea con anotación si el slug aún no existe.
 */
import { test, expect } from '@playwright/test';

import { STABLE_SLUGS } from './_utils/seo-fixtures';

const readPath = `/read/${STABLE_SLUGS.literaryWork}`;

test('read — los bloques de la prosa quedan separados entre sí', async ({ page, request }) => {
	const response = await request.get(readPath);
	// eslint-disable-next-line playwright/no-skipped-test -- skip condicional por contenido del dataset, no un test deshabilitado
	test.skip(response.status() === 404, `No existe literaryWork con slug "${STABLE_SLUGS.literaryWork}" en el dataset`);

	await page.goto(readPath);

	const blocks = page.locator('cuentoneta-literary-work-prose > * > *');
	await expect(blocks.nth(1)).toBeVisible();

	// El reset global declara `* { margin: 0 }`: sin la hoja de prosa, el separador entre hermanos no
	// existe y los párrafos quedan pegados. Se mide el segundo bloque porque el primero no lleva margen.
	const marginBlockStart = await blocks
		.nth(1)
		.evaluate((element) => globalThis.getComputedStyle(element).marginBlockStart);

	expect(marginBlockStart).not.toBe('0px');
});
