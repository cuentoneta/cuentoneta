import { readCacheHeaders } from './_middleware/read-cache-headers.middleware';
import apiRoutes from './routes';

/**
 * La caché de borde se declara por módulo, y el olvido no se nota: un módulo nuevo sin registrar
 * sigue respondiendo bien y consultando a Sanity en cada visita. Este spec convierte esa decisión
 * en algo que hay que tomar — el conjunto va escrito acá y no derivado del propio registro, porque
 * derivarlo lo compararía consigo mismo.
 */
describe('apiRoutes', () => {
	it('sirve desde la caché de borde exactamente los módulos previstos', () => {
		const cached = apiRoutes.routes
			.filter(({ handler }) => handler === readCacheHeaders)
			.map(({ path }) => path)
			.sort();

		expect(cached).toEqual(
			[
				'/author',
				'/author/*',
				'/collection',
				'/collection/*',
				'/content',
				'/content/*',
				'/contributor',
				'/contributor/*',
				'/literary-work',
				'/literary-work/*',
				'/story',
				'/story/*',
				'/storylist',
				'/storylist/*',
			].sort(),
		);
	});

	// El conjunto correcto no alcanza: los handlers de los controllers no llaman `next()`, así que un
	// `readCacheHeaders` registrado después del montaje de su módulo no correría nunca. La caché se
	// apagaría con un reordenamiento inocente, y el conteo de paths seguiría dando lo mismo.
	it('registra la caché antes del controller de cada módulo', () => {
		// El controller de un módulo no se registra bajo el mismo path que su middleware: `app.route()`
		// aplana las rutas del sub-router (`/author/:slug`, `/author/`), así que la comparación es por
		// prefijo. Se afirma contra el *último* registro de caché del prefijo, que es el que tendría que
		// quedar tapado si alguien reordenara.
		const cacheEntries = apiRoutes.routes.filter(({ handler }) => handler === readCacheHeaders);
		expect(cacheEntries.length, 'no hay ninguna ruta cacheada: la aserción no verificaría nada').toBeGreaterThan(0);

		for (const prefix of new Set(cacheEntries.map(({ path }) => path.replace(/\/\*$/, '')))) {
			const isOfPrefix = (path: string) => path === prefix || path.startsWith(`${prefix}/`);
			const indexed = apiRoutes.routes.map((route, index) => ({ ...route, index }));
			const lastCacheIndex = Math.max(
				...indexed.filter(({ handler, path }) => handler === readCacheHeaders && isOfPrefix(path)).map((r) => r.index),
			);
			const firstControllerIndex = indexed.findIndex(
				({ handler, path }) => handler !== readCacheHeaders && isOfPrefix(path),
			);

			expect(
				firstControllerIndex,
				`"${prefix}" no monta ningún handler: la aserción de orden no verificaría nada`,
			).toBeGreaterThan(-1);
			expect(
				lastCacheIndex,
				`"${prefix}" monta su controller antes de la caché: el middleware no correría`,
			).toBeLessThan(firstControllerIndex);
		}
	});

	// El generador de imágenes de Open Graph no lee del CMS igual que el resto y su caché es otra
	// decisión: se deja explícito para que la ausencia no se lea como un olvido.
	it('deja `/og` fuera de la caché de borde', () => {
		const cachedPaths = apiRoutes.routes.filter(({ handler }) => handler === readCacheHeaders).map(({ path }) => path);

		expect(cachedPaths).not.toContain('/og');
		expect(cachedPaths).not.toContain('/og/*');
	});
});
