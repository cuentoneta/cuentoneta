/**
 * Flujo de la página de lectura hidratada: el hero, el bloque multimedia y las sugerencias del pie.
 *
 * `e2e/seo/read.spec.ts` mira esta misma ruta, pero mira el HTML que ve el crawler. Acá se ejercita lo
 * que sólo existe después de hidratar y en un navegador real: los bloques diferidos (`on idle` /
 * `on viewport`), la interacción de cambio de formato y la navegación entre páginas con sus query params.
 *
 * Las aserciones se derivan del DTO que entrega el API (`_utils/read-fixtures.ts`), no de prosa clavada:
 * el spec afirma que la página muestra la obra que el API dice que es.
 */
import { expect, test, type Page } from '@playwright/test';

import type { LiteraryWorkDto } from '@models/literary-work.dto';

import { fetchLiteraryWork } from './_utils/read-fixtures';
import { fetchCollectionCatalog, type CollectionCatalogEntry } from './_utils/collection-fixtures';
import { DESKTOP_VIEWPORT } from './_utils/viewports';
import { STABLE_SLUGS } from './_utils/seo-fixtures';

const ROUTE = `/literary-work/${STABLE_SLUGS.literaryWork}`;
const MEDIA_ROUTE = `/literary-work/${STABLE_SLUGS.literaryWorkWithMedia}`;

let status = 0;
let work: LiteraryWorkDto | undefined;
// Los casos de multimedia y de sugerencias anclan en la obra curada para eso: `el-fin` no declara
// recursos y su autor tiene una sola obra, así que ninguno de los dos frentes se puede afirmar sobre él.
let mediaWork: LiteraryWorkDto | undefined;
let stableCollection: CollectionCatalogEntry | undefined;

test.beforeAll(async ({ request }) => {
	status = (await request.get(ROUTE)).status();
	work = await fetchLiteraryWork(request, STABLE_SLUGS.literaryWork);
	mediaWork = await fetchLiteraryWork(request, STABLE_SLUGS.literaryWorkWithMedia);
	stableCollection = (await fetchCollectionCatalog(request)).find((entry) => entry.slug === STABLE_SLUGS.collection);
});

// Guardas como casos propios, no como `skip` silencioso: los e2e de esta ruta tienen historia de
// saltearse en verde cuando el dataset no acompaña, y un caso salteado en CI es cobertura que no existe.
test('read — la obra estable existe en el dataset y cumple el contrato', () => {
	expect(status, `"${ROUTE}" no responde 200: nada de esta suite verifica la página real`).toBe(200);
	expect(work, `el API no sirve "${STABLE_SLUGS.literaryWork}": no habría con qué comparar`).toBeDefined();
});

/** Abre una obra con su contenido ya resuelto: el recurso bloquea el SSR, así que el h1 llega con el documento. */
async function openWork(page: Page, route: string): Promise<void> {
	await page.setViewportSize(DESKTOP_VIEWPORT);
	await page.goto(route);
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
}

test('read — el hero presenta la obra que el API dice que es', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta la guarda de arriba; repetirla acá sería el mismo fallo dos veces
	test.skip(status !== 200, `"${ROUTE}" no responde 200 en el dataset`);
	// Separado del anterior: un motivo compuesto reporta siempre el primero, y el diagnóstico se pierde.
	// eslint-disable-next-line playwright/no-skipped-test -- ídem
	test.skip(!work, `el API no sirve "${STABLE_SLUGS.literaryWork}"`);

	await openWork(page, ROUTE);

	await expect(page.getByRole('heading', { level: 1 })).toHaveText(work?.title ?? '');

	// El enlace del autor se busca por su nombre accesible: es lo que un lector de pantalla anuncia, y
	// derivarlo del DTO descarta que la página muestre un autor que no es el de la obra.
	const author = work?.authors[0];
	const authorLink = page.getByRole('link', { name: author?.name ?? '' }).first();
	await expect(authorLink).toBeVisible();
	await expect(authorLink).toHaveAttribute('href', `/author/${author?.slug}`);

	await expect(page.getByText(`${work?.totalReadingTime} minutos de lectura`)).toBeVisible();
});

// El 404 del SSR ya lo afirma la suite de indexado; acá se cubre lo que sólo el navegador ve: que el
// estado no encontrado ofrece una salida navegable y que la salida efectivamente navega.
test('read — una obra inexistente ofrece la vuelta al inicio', async ({ page }) => {
	await page.setViewportSize(DESKTOP_VIEWPORT);
	await page.goto('/literary-work/obra-inexistente-e2e');

	await expect(page.getByText('No encontramos esta obra')).toBeVisible();

	await page.getByRole('link', { name: 'Volver al inicio' }).click();
	// La raíz redirige a /home, así que es la URL en la que el lector efectivamente aterriza.
	await expect(page).toHaveURL(/\/home$/);
});

// El caso del cambio de formato afirma por el tipo del widget montado, así que dos recursos del mismo
// tipo pasarían un conteo y lo matarían igual: la propiedad que la curaduría debe sostener es de tipos
// distintos, y este derivador es el que consumen la guarda y los skips dependientes.
const distinctMediaTypes = (dto: LiteraryWorkDto | undefined): number =>
	new Set((dto?.mediaSources ?? []).map(({ type }) => type)).size;

// Guarda de curaduría, como caso propio: el cambio de formato sólo se puede afirmar si la obra curada
// ofrece formatos distintos, y ninguna otra puede buscarse porque el módulo no expone un listado. Si
// esto sale rojo, la acción es curar esa obra en development y staging.
test('read — la obra con multimedia ofrece más de un formato', () => {
	expect(mediaWork, `el API no sirve "${STABLE_SLUGS.literaryWorkWithMedia}"`).toBeDefined();
	expect(
		distinctMediaTypes(mediaWork),
		`"${STABLE_SLUGS.literaryWorkWithMedia}" necesita al menos dos recursos multimedia de tipos distintos en el dataset: sin ellos, el cambio de formato no se verifica en ningún lado`,
	).toBeGreaterThan(1);
});

/** Espera el bloque multimedia, que difiere en idle y no viaja en el HTML del servidor. */
async function settleMediaBlock(page: Page) {
	const block = page.getByRole('region', { name: /diferentes formatos/i });
	await expect(block.getByRole('group', { name: 'Formatos disponibles' })).toBeVisible();
	return block;
}

test('read — el bloque multimedia ofrece una opción por recurso', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta su guarda; repetirla acá sería el mismo fallo dos veces
	test.skip(!mediaWork, `"${MEDIA_ROUTE}" no está en el dataset`);
	// eslint-disable-next-line playwright/no-skipped-test -- ídem: la curaduría faltante la reporta su propia guarda
	test.skip(distinctMediaTypes(mediaWork) < 2, 'la obra curada no ofrece formatos distintos para elegir');

	await openWork(page, MEDIA_ROUTE);
	const block = await settleMediaBlock(page);

	// Una opción por recurso, contra el DTO: un grupo vacío o incompleto delataría un catálogo de widgets
	// que descarta formatos en silencio.
	await expect(block.getByRole('group', { name: 'Formatos disponibles' }).getByRole('button')).toHaveCount(
		mediaWork?.mediaSources.length ?? 0,
	);
});

test('read — cambiar de formato monta el widget del formato elegido', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta su guarda; repetirla acá sería el mismo fallo dos veces
	test.skip(!mediaWork, `"${MEDIA_ROUTE}" no está en el dataset`);
	// eslint-disable-next-line playwright/no-skipped-test -- ídem: la curaduría faltante la reporta su propia guarda
	test.skip(distinctMediaTypes(mediaWork) < 2, 'la obra curada no ofrece formatos distintos para elegir');

	await openWork(page, MEDIA_ROUTE);
	const block = await settleMediaBlock(page);
	const options = block.getByRole('group', { name: 'Formatos disponibles' }).getByRole('button');

	// Se afirma por el componente de widget montado, no por el contenido del proveedor: YouTube y
	// Spotify en CI son flaky, y qué widget se monta es exactamente lo que el selector decide. El tag
	// del elemento delata el formato sin esperar ninguna carga externa. La lista enumera los widgets del
	// catálogo (`media-widget-registry.ts`): uno nuevo se suma acá para que el caso lo alcance.
	const widgets = block.locator(
		'cuentoneta-youtube-video-widget, cuentoneta-spotify-audio-widget, cuentoneta-audio-recording-widget, cuentoneta-space-recording-widget',
	);
	const mountedWidget = () => widgets.first().evaluate((element) => element.tagName.toLowerCase());

	// Control positivo: hay exactamente un widget montado antes de elegir.
	await expect(widgets).toHaveCount(1);
	const widgetBefore = await mountedWidget();

	await options.nth(1).click();

	await expect
		.poll(mountedWidget, { message: 'el widget no cambió tras elegir el segundo formato' })
		.not.toBe(widgetBefore);
	await expect(widgets).toHaveCount(1);
});

/**
 * Scrollea hasta el pie y espera las sugerencias, que difieren por viewport.
 *
 * El heading va como string y no como patrón: interpolar un nombre de autor o un título de colección en
 * una expresión regular reinterpreta su puntuación como sintaxis, y el nombre lo decide la curaduría.
 */
async function settleSuggestions(page: Page, heading: string) {
	await page.locator('cuentoneta-reading-suggestions').scrollIntoViewIfNeeded();
	await expect(page.getByRole('heading', { name: heading })).toBeVisible();
}

// Ancla en la obra curada y no en la estable: el autor de `el-fin` tiene una sola obra publicada, así
// que sus sugerencias por autor salen vacías y el caso no afirmaría nada.
test('read — sin contexto, el pie sugiere más obras del autor', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- la ausencia del fixture ya la reporta su guarda; repetirla acá sería el mismo fallo dos veces
	test.skip(!mediaWork, `"${MEDIA_ROUTE}" no está en el dataset`);

	await openWork(page, MEDIA_ROUTE);
	await settleSuggestions(page, `Más obras de ${mediaWork?.authors[0]?.name}`);

	// Los enlaces de lectura se acotan por prefijo: el bloque ofrece además el acceso a la página del
	// autor ("ver más"), que es parte del diseño y se afirma aparte.
	const readingLinks = page.locator('cuentoneta-reading-suggestions').locator('a[href^="/literary-work/"]');

	// Control positivo: sin él, una lista vacía dejaría la exclusión de abajo cumpliéndose en vacío.
	await expect(
		readingLinks.first(),
		'no hay sugerencias: la curaduría pendiente es que el autor de la obra curada tenga otra obra publicada',
	).toBeVisible();

	const destinations = await readingLinks.evaluateAll((links) => links.map((link) => link.getAttribute('href') ?? ''));
	expect(
		destinations.some((href) => href.startsWith(MEDIA_ROUTE)),
		'la obra que se está leyendo se sugiere a sí misma',
	).toBe(false);

	// Las sugerencias arrastran el contexto de autor: navegar entre ellas no lo pierde.
	expect(
		destinations.every((href) => href.includes('navigation=author')),
		`sugerencias sin contexto: ${destinations}`,
	).toBe(true);

	const authorAccess = page
		.locator('cuentoneta-reading-suggestions')
		.locator(`a[href^="/author/${mediaWork?.authors[0]?.slug}"]`);
	await expect(authorAccess.first()).toBeVisible();
});

// El único cableado que ningún unitario ve: la tarjeta de la colección EMITE los query params de contexto
// y la página los CONSUME. Entrar directo con la URL armada probaría la mitad de consumo, que el spec
// unitario ya cubre.
test('read — llegar desde una colección cambia la fuente de las sugerencias', async ({ page }) => {
	// eslint-disable-next-line playwright/no-skipped-test -- el catálogo sin la colección estable ya lo reportan los e2e de colección
	test.skip(!stableCollection, `el catálogo no trae "${STABLE_SLUGS.collection}"`);

	await page.setViewportSize(DESKTOP_VIEWPORT);
	await page.goto(`/collection/${STABLE_SLUGS.collection}`);
	await expect(page.locator('main h1')).toBeVisible();

	await page.getByTestId('literary-works').locator('a[href^="/literary-work/"]').first().click();

	await expect(page).toHaveURL(/navigation=collection/);
	await settleSuggestions(page, `Más obras de ${stableCollection?.title}`);
});
