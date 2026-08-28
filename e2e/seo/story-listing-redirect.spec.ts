/**
 * El listado de obras se mudó de `/story` a `/literary-work`. Lo que se afirma acá es que la mudanza
 * viaja en la respuesta HTTP: un crawler que no ejecuta JavaScript solo ve el 301, y es el 301 lo que
 * traslada lo que la ruta vieja tenga indexado.
 */
import { test, expect } from '@playwright/test';

import { STABLE_SLUGS } from '../_utils/seo-fixtures';

// Una redirección HTTP no ejercita nada distinto en un segundo motor, y el gate es el más caro.
test.skip(({ browserName }) => browserName !== 'chromium');

test('story-listing — el listado viejo responde 301 permanente al nuevo', async ({ request }) => {
	const response = await request.get('/story', { maxRedirects: 0 });

	expect(response.status()).toBe(301);
	expect(response.headers()['location']).toBe('/literary-work');
});

// La instancia real declara `strict: false`, así que la barra final entra por la misma ruta. Se
// afirma acá y no solo en el spec del handler, que reconstruye su propio Hono: si alguien pasara la
// instancia a `strict: true`, esta variante caería en el estático y aquel spec seguiría verde.
test('story-listing — el listado viejo con barra final también redirige', async ({ request }) => {
	const response = await request.get('/story/', { maxRedirects: 0 });

	expect(response.status()).toBe(301);
	expect(response.headers()['location']).toBe('/literary-work');
});

// El detalle de una obra tiene su propio traslado, en otro tren. Lo que se protege es que esta
// redirección no se lo lleve puesto: el día que el detalle redirija, tiene que ir a su obra y no al
// listado. Se afirma el destino y no el estado, que es lo único cierto de las dos puntas — hoy el
// detalle ya no tiene ruta y responde 404, y cuando gane su 301 responderá 301.
test('story-listing — el detalle de una obra no cae en la redirección del listado', async ({ request }) => {
	const response = await request.get(`/story/${STABLE_SLUGS.story}`, { maxRedirects: 0 });

	expect(response.headers()['location']).not.toBe('/literary-work');
});
