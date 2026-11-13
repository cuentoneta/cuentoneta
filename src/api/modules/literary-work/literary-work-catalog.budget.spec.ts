import { onoffLiteraryWorkCatalogMock } from '@mocks/onoff-literary-work-catalog.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { createLiteraryWorkController } from './literary-work.controller';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';

// El tope que Angular aplica en SSR al cuerpo de una respuesta de HttpClient (su default privado,
// `DEFAULT_SSR_MAX_RESPONSE_BODY_SIZE`, espejado acá). Pasado el tope, el catálogo sale con 503.
const SSR_RESPONSE_BODY_LIMIT = 1024 * 1024;

// Cuántas obras tiene que poder listar el catálogo sin paginar, con margen: unas tres veces las
// publicadas al fijar el número. Si el catálogo se acerca, el e2e del listado lo avisa antes.
const DECLARED_CATALOG_CAPACITY = 2500;

describe('presupuesto de bytes del listado por defecto', () => {
	const controller = createLiteraryWorkController(
		new InMemoryLiteraryWorkRepository([], onoffLiteraryWorkTeasersMock, onoffLiteraryWorkCatalogMock),
	);
	const encoder = new TextEncoder();

	// La entrada más pesada del corpus, multiplicada por la capacidad declarada, tiene que dejar la mitad
	// del tope libre. Un campo nuevo en la vista que la ensanche lo bastante rompe este caso.
	it('should keep the declared capacity of the catalog under half the SSR response limit', async () => {
		const entries: unknown[] = await (await controller.request('/')).json();
		const maxEntryBytes = Math.max(...entries.map((entry) => encoder.encode(JSON.stringify(entry)).length + 1));

		expect(entries.length).toBeGreaterThan(0);
		expect(DECLARED_CATALOG_CAPACITY * maxEntryBytes).toBeLessThanOrEqual(SSR_RESPONSE_BODY_LIMIT / 2);
	});

	// El guard de que el default no vuelva a ser la vista de tarjeta: sobre el mismo corpus, el listado
	// sin vista tiene que pesar menos que el que se pide como teaser.
	it('should answer the default listing lighter than the teaser view', async () => {
		const byDefault = await (await controller.request('/')).arrayBuffer();
		const teasers = await (await controller.request('/?view=teaser')).arrayBuffer();

		expect(byDefault.byteLength).toBeLessThan(teasers.byteLength);
	});
});
