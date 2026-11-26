import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { RESPONSE_INIT } from '@angular/core';
import type { Observable } from 'rxjs';
import { NEVER, of, throwError } from 'rxjs';
import { clearAllMocks, restoreAllMocks } from '@test-utils';

import LiteraryWorksPage from './literary-works.page';
import { LITERARY_WORKS_HOST } from './literary-works-host';
import type { LiteraryWorkApi } from '../../providers/literary-work.provider';
import { provideLiteraryWorkApiMock, StubLiteraryWorkApi } from '../../providers/literary-work.mock';
import type { LiteraryWork, LiteraryWorkCatalogEntry, LiteraryWorkTeaser } from '@models/literary-work.model';
import { type Catalog, createCatalog } from '@models/catalog.model';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { onoffLiteraryWorkCatalogEntriesMock } from '@mocks/onoff-literary-work-catalog-entries.mock';

class FailingLiteraryWorkApi implements LiteraryWorkApi {
	public getBySlug(): Observable<LiteraryWork> {
		return throwError(() => new Error('sin catálogo'));
	}

	public getTeasers(): Observable<LiteraryWorkTeaser[]> {
		return throwError(() => new Error('sin catálogo'));
	}

	public getCatalog(): Observable<Catalog<LiteraryWorkCatalogEntry>> {
		return throwError(() => new Error('sin catálogo'));
	}
}

// Retener la emisión es la única forma de sostener el estado de carga a la vista: el recurso queda
// pendiente y la página no llega a resolver ninguna de las otras tres ramas.
class PendingLiteraryWorkApi implements LiteraryWorkApi {
	public getBySlug(): Observable<LiteraryWork> {
		return NEVER;
	}

	public getTeasers(): Observable<LiteraryWorkTeaser[]> {
		return NEVER;
	}

	public getCatalog(): Observable<Catalog<LiteraryWorkCatalogEntry>> {
		return NEVER;
	}
}

const [canonicalWork] = onoffLiteraryWorksMock;
const [firstEntry, secondEntry] = onoffLiteraryWorkCatalogEntriesMock;

const stubbing = (catalogEntries: readonly LiteraryWorkCatalogEntry[]) =>
	new StubLiteraryWorkApi({ literaryWork: canonicalWork, catalogEntries });

// Una página de un catálogo mayor: lista algunas entradas de un total que las excede.
class StubPagedLiteraryWorkApi extends StubLiteraryWorkApi {
	constructor(
		private readonly entries: readonly LiteraryWorkCatalogEntry[],
		private readonly total: number,
	) {
		super({ literaryWork: canonicalWork });
	}

	public override getCatalog(): Observable<Catalog<LiteraryWorkCatalogEntry>> {
		return of(createCatalog(this.entries, this.total));
	}
}

// Cada tarjeta enlaza dos destinos —la obra y su autoría—; el del listado es el que lleva a la lectura.
const readingHrefs = () =>
	within(screen.getByTestId('literary-works'))
		.getAllByRole('link')
		.map((link) => link.getAttribute('href'))
		.filter((href) => href?.startsWith('/literary-work/'));

describe('LiteraryWorksPage', () => {
	beforeEach(() => clearAllMocks());

	afterEach(() => restoreAllMocks());

	const renderPage = (api: LiteraryWorkApi = stubbing(onoffLiteraryWorkCatalogEntriesMock)) =>
		render(LiteraryWorksPage, { providers: [provideRouter([]), provideLiteraryWorkApiMock(api)] });

	it('should headline the catalogue with how many works it lists', async () => {
		await renderPage();

		expect(
			screen.getByRole('heading', { level: 1, name: `${onoffLiteraryWorkCatalogEntriesMock.length} Obras` }),
		).toBeInTheDocument();
	});

	it('should put the count in singular when the catalogue lists one work', async () => {
		await renderPage(stubbing([firstEntry]));

		expect(screen.getByRole('heading', { level: 1, name: '1 Obra' })).toBeInTheDocument();
	});

	// El sobre transporta el total justamente para esto: con paginación, las entradas listadas son una página.
	it('should headline the catalogue with its total, not with the entries it lists', async () => {
		await renderPage(new StubPagedLiteraryWorkApi([firstEntry, secondEntry], 5));

		expect(screen.getByRole('heading', { level: 1, name: '5 Obras' })).toBeInTheDocument();
		expect(within(screen.getByTestId('literary-works')).getAllByRole('row')).toHaveLength(2);
	});

	it('should send every work of the catalogue to its reading page', async () => {
		await renderPage();

		const hrefs = readingHrefs();
		expect(hrefs).toHaveLength(onoffLiteraryWorkCatalogEntriesMock.length);
		onoffLiteraryWorkCatalogEntriesMock.forEach(({ slug }) => {
			expect(hrefs).toContain(`/literary-work/${slug}`);
		});
	});

	// El orden es el del catálogo y nadie más lo decide: el doble lo sirve al revés del orden por slug, así
	// que una página que volviera a reordenar en el cliente no puede pasar.
	it('should list the works in the order the catalogue serves them', async () => {
		const reversed = [...onoffLiteraryWorkCatalogEntriesMock].reverse();

		await renderPage(stubbing(reversed));

		expect(readingHrefs()).toEqual(reversed.map(({ slug }) => `/literary-work/${slug}`));
	});

	it('should say the catalogue is empty instead of showing placeholders', async () => {
		await renderPage(stubbing([]));

		expect(screen.getByTestId('catalog-empty')).toBeInTheDocument();
		expect(screen.queryByTestId('skeleton')).not.toBeInTheDocument();
	});

	it('should stand in for the catalogue while it loads, and for nothing else', async () => {
		await renderPage(new PendingLiteraryWorkApi());

		expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
		expect(screen.queryByTestId('literary-works')).not.toBeInTheDocument();
		expect(screen.queryByTestId('catalog-empty')).not.toBeInTheDocument();
		expect(screen.queryByTestId('catalog-error')).not.toBeInTheDocument();
	});

	// La fila de carga y la fila resuelta comparten la tabla, así que tienen que declarar las mismas
	// celdas: una fila corta desalinea las columnas y mueve el encabezado al resolver.
	it('should give the placeholder row the same cells a resolved row carries', async () => {
		await renderPage(new PendingLiteraryWorkApi());

		const [placeholder] = screen.getAllByTestId('skeleton');
		expect(within(placeholder).getAllByRole('cell')).toHaveLength(3);
	});

	// Anunciar un conteo mientras carga o tras un fallo afirmaría que no hay obras.
	it('should withhold the count until the catalogue resolves', async () => {
		await renderPage(new PendingLiteraryWorkApi());

		expect(screen.getByRole('heading', { level: 1, name: 'Obras' })).toBeInTheDocument();
	});

	// La tabla es el andamio de las dos ramas, así que su encabezado se sirve desde el primer render.
	it('should keep the column headers while the catalogue loads', async () => {
		await renderPage(new PendingLiteraryWorkApi());

		['Título', 'Autor', 'Tiempo de lectura'].forEach((name) => {
			expect(screen.getByRole('columnheader', { name })).toBeInTheDocument();
		});
	});

	it('should send every author of the catalogue to their profile', async () => {
		await renderPage();

		const hrefs = within(screen.getByTestId('literary-works'))
			.getAllByRole('link')
			.map((link) => link.getAttribute('href'));
		onoffLiteraryWorkCatalogEntriesMock.forEach(({ authors }) => {
			authors.forEach(({ slug }) => {
				expect(hrefs).toContain(`/author/${slug}`);
			});
		});
	});

	it('should list the reading time of every work', async () => {
		await renderPage();

		const listing = within(screen.getByTestId('literary-works'));
		onoffLiteraryWorkCatalogEntriesMock.forEach(({ totalReadingTime }) => {
			expect(listing.getAllByText(`${totalReadingTime} min`).length).toBeGreaterThan(0);
		});
	});

	it('should tell the reader when the catalogue fails to load', async () => {
		await renderPage(new FailingLiteraryWorkApi());

		expect(screen.getByTestId('catalog-error')).toBeInTheDocument();
		expect(screen.queryByTestId('literary-works')).not.toBeInTheDocument();
		expect(screen.getByRole('heading', { level: 1, name: 'Obras' })).toBeInTheDocument();
	});

	// La directiva de datos estructurados lee el catálogo por este token: es el contrato que le permite
	// emitir el ItemList sin volver a resolverlo.
	it('should expose the catalogue it lists through its host token', async () => {
		const { fixture } = await renderPage();

		const host = fixture.debugElement.injector.get(LITERARY_WORKS_HOST);
		expect(host.entries().map(({ slug }) => `/literary-work/${slug}`)).toEqual(readingHrefs());
	});

	describe('código de respuesta', () => {
		const renderWithResponseInit = (api: LiteraryWorkApi, responseInit: { status?: number }) =>
			render(LiteraryWorksPage, {
				providers: [
					provideRouter([]),
					provideLiteraryWorkApiMock(api),
					{ provide: RESPONSE_INIT, useValue: responseInit },
				],
			});

		it('should respond 503 when the catalogue fails', async () => {
			const responseInit: { status?: number } = {};

			await renderWithResponseInit(new FailingLiteraryWorkApi(), responseInit);

			expect(responseInit.status).toBe(503);
		});

		it('should leave the status untouched when the catalogue resolves', async () => {
			const responseInit: { status?: number } = {};

			await renderWithResponseInit(stubbing(onoffLiteraryWorkCatalogEntriesMock), responseInit);

			expect(responseInit.status).toBeUndefined();
		});
	});
});
