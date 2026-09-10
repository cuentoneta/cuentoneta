import { render, screen, within } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { provideRouter } from '@angular/router';
import { RESPONSE_INIT } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

import CollectionsPage from './collections.page';

import type { CollectionApi } from '../../providers/collection.provider';
import { provideCollectionApiMock } from '../../providers/collection.mock';

import type { Collection, CollectionTeaser } from '@models/collection.model';
import type { Tag } from '@models/tag.model';

import {
	onoffCollectionsMock,
	onoffCollectionTeasersMock,
	onoffCollectionTeasersWithNonAsciiInitialMock,
} from '@mocks/onoff-collections.mock';
import { colaborativaTagMock, ensayoTagMock, tragediaTagMock } from '@mocks/onoff-tags.mock';

import { clearAllMocks } from '@test-utils';

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

const [canonical] = onoffCollectionTeasersMock;

const hrefsOf = (container: HTMLElement) =>
	within(container)
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

		expect(hrefsOf(screen.getByTestId('collections'))).toEqual(
			expect.arrayContaining(onoffCollectionsMock.map(({ slug }) => `/collection/${slug}`)),
		);
	});

	// El catálogo llega como lo ordena la base, por punto de código, que manda los títulos acentuados
	// detrás de todo el alfabeto. La colación española los devuelve a su lugar.
	it('should order titles with accent folding, not by code point', async () => {
		const byCodePoint = [...onoffCollectionTeasersMock].sort((one, other) => (one.title < other.title ? -1 : 1));
		const [withNonAsciiInitial] = onoffCollectionTeasersWithNonAsciiInitialMock;

		await renderPage(new StubCatalogCollectionApi(byCodePoint));

		// El orden relativo, y no la primera posición: que la acentuada quede primera es cierto por el
		// elenco de hoy, y una colección que empezara con "A" lo volvería falso sin que la página falle.
		const byCollation = [...byCodePoint].sort((one, other) => one.title.localeCompare(other.title, 'es'));
		const nextByCollation = byCollation[byCollation.findIndex(({ slug }) => slug === withNonAsciiInitial.slug) + 1];

		expect(byCodePoint.at(-1)?.slug).toBe(withNonAsciiInitial.slug);
		const hrefs = hrefsOf(screen.getByTestId('collections'));
		expect(hrefs.indexOf(`/collection/${withNonAsciiInitial.slug}`)).toBeLessThan(
			hrefs.indexOf(`/collection/${nextByCollation.slug}`),
		);
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

	describe('filtros', () => {
		const catalogue = onoffCollectionTeasersMock;

		// Las etiquetas del elenco se reparten para que haya facetas de conteos distintos y grupos que no
		// conviven, así que todo lo que estos casos esperan se deriva del catálogo en vez de escribirse:
		// enriquecerlo mueve los números sin volver falso ningún caso.
		const carrying = (...tags: readonly Tag[]) =>
			catalogue.filter((collection) =>
				tags.every((tag) => collection.tags.some((candidate) => candidate.slug === tag.slug)),
			);

		const facetFor = (tag: Tag, over: readonly CollectionTeaser[] = catalogue) => {
			const count = over.filter((collection) =>
				collection.tags.some((candidate) => candidate.slug === tag.slug),
			).length;
			return `${tag.title} (${count})`;
		};

		const headingFor = (collections: readonly CollectionTeaser[]) =>
			`${collections.length} ${collections.length === 1 ? 'Colección' : 'Colecciones'}`;

		const renderCatalogue = () => renderPage(new StubCatalogCollectionApi(catalogue));

		it('should count each facet over the catalogue', async () => {
			await renderCatalogue();

			const filters = within(screen.getByTestId('filters'));
			expect(filters.getByLabelText(facetFor(colaborativaTagMock))).toBeInTheDocument();
			expect(filters.getByLabelText(facetFor(ensayoTagMock))).toBeInTheDocument();
		});

		it('should narrow the listing to the collections carrying the chosen tag', async () => {
			await renderCatalogue();

			await userEvent.click(screen.getByLabelText(facetFor(colaborativaTagMock)));

			const withChosenTag = carrying(colaborativaTagMock);
			expect(hrefsOf(screen.getByTestId('collections'))).toHaveLength(withChosenTag.length);
			expect(screen.getByRole('heading', { level: 1, name: headingFor(withChosenTag) })).toBeInTheDocument();
		});

		it('should drop the facets that no longer apply and recount the rest', async () => {
			const withChosenTag = carrying(colaborativaTagMock);
			// `ensayo` la llevan colecciones de los dos lados del filtro, así que su conteo tiene que bajar;
			// `tragedia` no convive con `colaborativa` y su faceta tiene que desaparecer. Sin la primera
			// condición el caso pasaría con una página que no recontara nada.
			expect(facetFor(ensayoTagMock, withChosenTag)).not.toBe(facetFor(ensayoTagMock));

			await renderCatalogue();
			await userEvent.click(screen.getByLabelText(facetFor(colaborativaTagMock)));

			expect(screen.getByLabelText(facetFor(ensayoTagMock, withChosenTag))).toBeInTheDocument();
			expect(screen.queryByLabelText(facetFor(tragediaTagMock))).not.toBeInTheDocument();
		});

		it('should offer a chip that removes the filter it names', async () => {
			await renderCatalogue();
			await userEvent.click(screen.getByLabelText(facetFor(colaborativaTagMock)));

			await userEvent.click(screen.getByRole('button', { name: `Quitar el filtro ${colaborativaTagMock.title}` }));

			expect(screen.getByRole('heading', { level: 1, name: headingFor(catalogue) })).toBeInTheDocument();
		});

		it('should collapse the category group without dropping the filters in effect', async () => {
			await renderCatalogue();
			await userEvent.click(screen.getByLabelText(facetFor(colaborativaTagMock)));

			await userEvent.click(screen.getByRole('button', { name: /Categoría/ }));

			const withChosenTag = carrying(colaborativaTagMock);
			expect(screen.getByRole('button', { name: /Categoría/ })).toHaveAttribute('aria-expanded', 'false');
			expect(screen.queryByLabelText(facetFor(colaborativaTagMock, withChosenTag))).not.toBeInTheDocument();
			expect(screen.getByRole('heading', { level: 1, name: headingFor(withChosenTag) })).toBeInTheDocument();
			expect(screen.getByTestId('active-filters')).toBeInTheDocument();
		});

		it('should clear every filter at once', async () => {
			await renderCatalogue();
			await userEvent.click(screen.getByLabelText(facetFor(colaborativaTagMock)));

			await userEvent.click(screen.getByRole('button', { name: 'Limpiar filtros' }));

			expect(screen.getByRole('heading', { level: 1, name: headingFor(catalogue) })).toBeInTheDocument();
			expect(screen.queryByTestId('active-filters')).not.toBeInTheDocument();
		});

		// Toda faceta ofrecida tiene al menos una colección detrás: por eso la página no tiene estado de
		// «ninguna coincide» — sería inalcanzable.
		it('should never let a combination of offered facets empty the listing', async () => {
			await renderCatalogue();
			const withChosenTag = carrying(colaborativaTagMock);
			await userEvent.click(screen.getByLabelText(facetFor(colaborativaTagMock)));

			await userEvent.click(screen.getByLabelText(facetFor(ensayoTagMock, withChosenTag)));

			const withBothTags = carrying(colaborativaTagMock, ensayoTagMock);
			expect(withBothTags).not.toHaveLength(0);
			expect(hrefsOf(screen.getByTestId('collections'))).toHaveLength(withBothTags.length);
			expect(screen.getByRole('heading', { level: 1, name: headingFor(withBothTags) })).toBeInTheDocument();
		});
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
