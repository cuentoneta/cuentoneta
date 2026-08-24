import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { RESPONSE_INIT } from '@angular/core';
import { NEVER, Observable, of, throwError } from 'rxjs';

import { createCollectionTeaser, type Collection, type CollectionTeaser } from '@models/collection.model';
import { onoffCollectionsMock, onoffCollectionTeasersMock } from '@mocks/onoff-collections.mock';
import { clearAllMocks } from '@test-utils';

import type { CollectionApi } from '../../providers/collection.provider';
import { provideCollectionApiMock } from '../../providers/collection.mock';
import CollectionsPage from './collections.page';

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

// `NEVER` deja el recurso pendiente, que es la única forma de sostener el esqueleto a la vista.
class PendingCollectionApi implements CollectionApi {
	public getBySlug(): Observable<Collection> {
		return NEVER;
	}

	public getAll(): Observable<CollectionTeaser[]> {
		return NEVER;
	}
}

const renderPage = (api: CollectionApi) =>
	render(CollectionsPage, {
		providers: [provideRouter([]), provideCollectionApiMock(api)],
	});

// El corpus no tiene títulos con acento inicial, que es lo que el orden tiene que resolver.
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

const hrefsOf = (testId: string) =>
	within(screen.getByTestId(testId))
		.getAllByRole('link')
		.map((link) => link.getAttribute('href'));

describe('CollectionsPage', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	it('should headline the catalogue with how many collections it lists', async () => {
		await renderPage(new StubCatalogCollectionApi(onoffCollectionTeasersMock));

		expect(
			screen.getByRole('heading', { level: 1, name: `${onoffCollectionTeasersMock.length} Colecciones` }),
		).toBeInTheDocument();
	});

	it('should put the count in singular when the catalogue lists one collection', async () => {
		await renderPage(new StubCatalogCollectionApi([canonical]));

		expect(screen.getByRole('heading', { level: 1, name: '1 Colección' })).toBeInTheDocument();
	});

	it('should render one card per collection in the catalogue', async () => {
		await renderPage(new StubCatalogCollectionApi(onoffCollectionTeasersMock));

		expect(within(screen.getByTestId('collections')).getAllByRole('link')).toHaveLength(
			onoffCollectionTeasersMock.length,
		);
	});

	it('should link every card to the collection detail route', async () => {
		await renderPage(new StubCatalogCollectionApi(onoffCollectionTeasersMock));

		expect(hrefsOf('collections')).toEqual(
			expect.arrayContaining(onoffCollectionsMock.map(({ slug }) => `/collection/${slug}`)),
		);
	});

	// La colación de la base pondría `Ámbar` detrás de `Zoológico`.
	it('should order titles with accent folding, not by code point', async () => {
		const desordenadas = [
			withTitle('Zoológico', 'zoologico'),
			withTitle('Ámbar', 'ambar'),
			withTitle('Bruma', 'bruma'),
		];

		await renderPage(new StubCatalogCollectionApi(desordenadas));

		expect(hrefsOf('collections')).toEqual(['/collection/ambar', '/collection/bruma', '/collection/zoologico']);
	});

	it('should show placeholders while the catalogue is on its way', async () => {
		const { container } = await renderPage(new PendingCollectionApi());

		// eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- el esqueleto no expone rol ni texto: solo se lo puede contar por selector
		expect(container.querySelectorAll('cuentoneta-collection-teaser-card-skeleton').length).toBeGreaterThan(0);
		expect(screen.queryByTestId('catalog-empty')).not.toBeInTheDocument();
	});

	it('should keep the heading when the catalogue comes back empty', async () => {
		await renderPage(new StubCatalogCollectionApi([]));

		expect(screen.getByRole('heading', { level: 1, name: '0 Colecciones' })).toBeInTheDocument();
		expect(screen.queryByTestId('collections')).not.toBeInTheDocument();
	});

	it('should say the catalogue is empty instead of showing placeholders', async () => {
		const { container } = await renderPage(new StubCatalogCollectionApi([]));

		expect(screen.getByTestId('catalog-empty')).toBeInTheDocument();
		// eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- el esqueleto no expone rol ni texto: la ausencia solo se afirma por selector
		expect(container.querySelector('cuentoneta-collection-teaser-card-skeleton')).toBeNull();
	});

	it('should tell the reader when the catalogue fails to load', async () => {
		await renderPage(new FailingCollectionApi());

		expect(screen.getByTestId('catalog-error')).toBeInTheDocument();
		expect(screen.queryByTestId('collections')).not.toBeInTheDocument();
	});

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
