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

	// El generador de imágenes de Open Graph no lee del CMS igual que el resto y su caché es otra
	// decisión: se deja explícito para que la ausencia no se lea como un olvido.
	it('deja `/og` fuera de la caché de borde', () => {
		const cachedPaths = apiRoutes.routes.filter(({ handler }) => handler === readCacheHeaders).map(({ path }) => path);

		expect(cachedPaths).not.toContain('/og');
		expect(cachedPaths).not.toContain('/og/*');
	});
});
