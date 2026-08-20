// Librería de pruebas
import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { RESPONSE_INIT } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

// Página
import CollectionsPage from './collections.page';

// Providers
import type { CollectionApi } from '../../providers/collection.provider';
import { provideCollectionApiMock } from '../../providers/collection.mock';

// Modelos
import { createCollectionTeaser, type Collection, type CollectionTeaser } from '@models/collection.model';

// Mocks
import { onoffCollectionsMock, onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';

// Utilidades de test
import { clearAllMocks } from '@test-utils';

// El doble compartido resuelve el catálogo desde colecciones completas; acá la página solo consume el
// listado, así que el doble entrega teasers directamente y deja `getBySlug` fuera de juego.
class StubCatalogCollectionApi implements CollectionApi {
	constructor(private readonly teasers: readonly CollectionTeaser[]) {}

	public getBySlug(): Observable<Collection> {
		return throwError(() => new Error('StubCatalogCollectionApi: la página del catálogo no consulta por slug'));
	}

	public getAll(): Observable<CollectionTeaser[]> {
		return of([...this.teasers]);
	}
}

class FailingCollectionApi implements CollectionApi {
	public getBySlug(): Observable<Collection> {
		return throwError(() => new Error('sin catálogo'));
	}

	public getAll(): Observable<CollectionTeaser[]> {
		return throwError(() => new Error('sin catálogo'));
	}
}

const renderPage = (api: CollectionApi) =>
	render(CollectionsPage, {
		providers: [provideRouter([]), provideCollectionApiMock(api)],
	});

// Derivados del canon: el corpus no tiene títulos que empiecen con acento, que es justo lo que el orden
// tiene que resolver.
const [canonical] = onoffCollectionTeasersMock;
const withTitle = (title: string, slug: string): CollectionTeaser =>
	createCollectionTeaser({
		_id: `${canonical._id}-${slug}`,
		slug,
		title,
		description: canonical.description,
		imagery: canonical.imagery,
		tags: canonical.tags,
		config: canonical.config,
		mediaSources: canonical.mediaSources,
		count: canonical.count,
	});

describe('CollectionsPage', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	it('should render the catalogue heading', async () => {
		await renderPage(new StubCatalogCollectionApi(onoffCollectionTeasersMock));

		expect(screen.getByRole('heading', { level: 1, name: 'Colecciones' })).toBeInTheDocument();
	});

	it('should render one card per collection in the catalogue', async () => {
		await renderPage(new StubCatalogCollectionApi(onoffCollectionTeasersMock));

		expect(within(screen.getByTestId('collections')).getAllByRole('link')).toHaveLength(
			onoffCollectionTeasersMock.length,
		);
	});

	it('should link every card to the collection detail route', async () => {
		await renderPage(new StubCatalogCollectionApi(onoffCollectionTeasersMock));

		const hrefs = within(screen.getByTestId('collections'))
			.getAllByRole('link')
			.map((link) => link.getAttribute('href'));
		expect(hrefs).toEqual(expect.arrayContaining(onoffCollectionsMock.map(({ slug }) => `/collection/${slug}`)));
	});

	// El orden que trae la query compara por punto de código, así que manda `Ámbar` detrás de `Zoológico`.
	// Es el caso que justifica reordenar en la página en vez de confiar en la colación de la base.
	it('should order titles with accent folding, not by code point', async () => {
		const desordenadas = [
			withTitle('Zoológico', 'zoologico'),
			withTitle('Ámbar', 'ambar'),
			withTitle('Bruma', 'bruma'),
		];

		await renderPage(new StubCatalogCollectionApi(desordenadas));

		const hrefs = within(screen.getByTestId('collections'))
			.getAllByRole('link')
			.map((link) => link.getAttribute('href'));
		expect(hrefs).toEqual(['/collection/ambar', '/collection/bruma', '/collection/zoologico']);
	});

	it('should keep the heading when the catalogue comes back empty', async () => {
		await renderPage(new StubCatalogCollectionApi([]));

		expect(screen.getByRole('heading', { level: 1, name: 'Colecciones' })).toBeInTheDocument();
		expect(screen.queryByTestId('collections')).not.toBeInTheDocument();
	});

	// Un catálogo vacío resuelto no es un catálogo cargando. Sin este caso, la página se quedaba con los
	// esqueletos puestos y el servidor los serializaba en una ruta que pide ser indexada.
	it('should say the catalogue is empty instead of showing placeholders', async () => {
		const { container } = await renderPage(new StubCatalogCollectionApi([]));

		expect(screen.getByTestId('catalog-empty')).toBeInTheDocument();
		// eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- el esqueleto no expone rol ni texto: la ausencia solo se afirma por selector
		expect(container.querySelector('cuentoneta-collection-teaser-card-skeleton')).toBeNull();
	});

	// Un catálogo que falla no puede verse igual que uno vacío: sin el mensaje, la página miente diciendo
	// que no hay colecciones.
	it('should tell the reader when the catalogue fails to load', async () => {
		await renderPage(new FailingCollectionApi());

		expect(screen.getByTestId('catalog-error')).toBeInTheDocument();
		expect(screen.queryByTestId('collections')).not.toBeInTheDocument();
	});

	// El código de respuesta es lo que impide que el borde cachee un fallo transitorio como si fuera la
	// página: es la razón del effect, y por eso se afirma en vez de quedar solo enunciada en un comentario.
	describe('código de respuesta', () => {
		const renderWithResponseInit = (api: CollectionApi, responseInit: { status?: number }) =>
			render(CollectionsPage, {
				providers: [
					provideRouter([]),
					provideCollectionApiMock(api),
					{ provide: RESPONSE_INIT, useValue: responseInit },
				],
			});

		it('should respond 503 when the catalogue fails', async () => {
			const responseInit: { status?: number } = {};

			await renderWithResponseInit(new FailingCollectionApi(), responseInit);

			expect(responseInit.status).toBe(503);
		});

		it('should leave the status untouched when the catalogue resolves', async () => {
			const responseInit: { status?: number } = {};

			await renderWithResponseInit(new StubCatalogCollectionApi(onoffCollectionTeasersMock), responseInit);

			expect(responseInit.status).toBeUndefined();
		});
	});
});
