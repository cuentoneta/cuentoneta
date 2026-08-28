/**
 * Las URLs indexadas se mudaron: obra y colección tienen rutas nuevas, y las viejas responden con un
 * traslado permanente. Lo que se afirma acá es que ese traslado viaja en la respuesta HTTP: un
 * crawler que no ejecuta JavaScript solo ve el 301, y es el 301 lo que traslada lo indexado.
 *
 * Se afirma además que el destino responde: un 301 hacia una URL que no existe pierde lo mismo que
 * no redirigir.
 */
import { test, expect } from '@playwright/test';

import { STABLE_SLUGS } from '../_utils/seo-fixtures';

// Una redirección HTTP no ejercita nada distinto en un segundo motor, y el gate es el más caro.
test.skip(({ browserName }) => browserName !== 'chromium');

const LISTINGS = [
	{ from: '/story', to: '/literary-work' },
	{ from: '/storylist', to: '/collection' },
] as const;

const DETAILS = [
	{ from: `/story/${STABLE_SLUGS.literaryWork}`, to: `/read/${STABLE_SLUGS.literaryWork}` },
	{ from: `/storylist/${STABLE_SLUGS.collection}`, to: `/collection/${STABLE_SLUGS.collection}` },
] as const;

for (const { from, to } of LISTINGS) {
	test(`legacy-redirects — el listado viejo ${from} responde 301 permanente a ${to}`, async ({ request }) => {
		const response = await request.get(from, { maxRedirects: 0 });

		expect(response.status()).toBe(301);
		expect(response.headers()['location']).toBe(to);
	});
}

// La instancia real declara `strict: false`, así que la barra final entra por la ruta sin slug. Se
// afirma acá y no solo en el spec del handler, que reconstruye su propio Hono: si alguien pasara la
// instancia a `strict: true`, esta variante caería en el detalle y aquel spec seguiría verde.
for (const { from, to } of LISTINGS) {
	test(`legacy-redirects — ${from} con barra final no cae en el detalle`, async ({ request }) => {
		const response = await request.get(`${from}/`, { maxRedirects: 0 });

		expect(response.status()).toBe(301);
		expect(response.headers()['location']).toBe(to);
	});
}

for (const { from, to } of DETAILS) {
	test(`legacy-redirects — el detalle viejo ${from} responde 301 permanente a ${to}`, async ({ request }) => {
		const response = await request.get(from, { maxRedirects: 0 });

		expect(response.status()).toBe(301);
		expect(response.headers()['location']).toBe(to);
	});

	test(`legacy-redirects — el destino de ${from} responde 200 sin volver a redirigir`, async ({ request }) => {
		const response = await request.get(to, { maxRedirects: 0 });

		expect(response.status()).toBe(200);
		expect(response.headers()['location']).toBeUndefined();
	});
}
