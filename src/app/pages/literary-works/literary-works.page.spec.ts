import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { RESPONSE_INIT } from '@angular/core';
import { NEVER, Observable, throwError } from 'rxjs';
import { clearAllMocks, restoreAllMocks } from '@test-utils';

import LiteraryWorksPage from './literary-works.page';
import { LITERARY_WORKS_HOST } from './literary-works-host';
import type { LiteraryWorkApi } from '../../providers/literary-work.provider';
import { provideLiteraryWorkApiMock, StubLiteraryWorkApi } from '../../providers/literary-work.mock';
import type { LiteraryWork, LiteraryWorkTeaser } from '@models/literary-work.model';
import { createSlug } from '@models/slug.model';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';

class FailingLiteraryWorkApi implements LiteraryWorkApi {
	public getBySlug(): Observable<LiteraryWork> {
		return throwError(() => new Error('sin catálogo'));
	}

	public getTeasers(): Observable<LiteraryWorkTeaser[]> {
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
}

const [canonicalWork] = onoffLiteraryWorksMock;
const [canonicalTeaser] = onoffLiteraryWorkTeasersMock;

const stubbing = (teasers: readonly LiteraryWorkTeaser[]) => new StubLiteraryWorkApi(canonicalWork, teasers);

const withTitle = (title: string, slug: string): LiteraryWorkTeaser => ({
	...canonicalTeaser,
	title,
	slug: createSlug(slug),
});

// Cada tarjeta enlaza dos destinos —la obra y su autoría—; el del listado es el que lleva a la lectura.
const readingHrefs = () =>
	within(screen.getByTestId('literary-works'))
		.getAllByRole('link')
		.map((link) => link.getAttribute('href'))
		.filter((href) => href?.startsWith('/read/'));

describe('LiteraryWorksPage', () => {
	beforeEach(() => clearAllMocks());

	afterEach(() => restoreAllMocks());

	const renderPage = (api: LiteraryWorkApi = stubbing(onoffLiteraryWorkTeasersMock)) =>
		render(LiteraryWorksPage, { providers: [provideRouter([]), provideLiteraryWorkApiMock(api)] });

	it('should headline the catalogue with how many works it lists', async () => {
		await renderPage();

		expect(
			screen.getByRole('heading', { level: 1, name: `${onoffLiteraryWorkTeasersMock.length} Obras` }),
		).toBeInTheDocument();
	});

	it('should put the count in singular when the catalogue lists one work', async () => {
		await renderPage(stubbing([canonicalTeaser]));

		expect(screen.getByRole('heading', { level: 1, name: '1 Obra' })).toBeInTheDocument();
	});

	it('should send every work of the catalogue to its reading page', async () => {
		await renderPage();

		const hrefs = readingHrefs();
		expect(hrefs).toHaveLength(onoffLiteraryWorkTeasersMock.length);
		onoffLiteraryWorkTeasersMock.forEach(({ slug }) => {
			expect(hrefs).toContain(`/read/${slug}`);
		});
	});

	// La colación de la query pondría `Ámbar` detrás de `Zoológico`.
	it('should order titles with accent folding, not by code point', async () => {
		const desordenadas = [
			withTitle('Zoológico', 'zoologico'),
			withTitle('Ámbar', 'ambar'),
			withTitle('Bruma', 'bruma'),
		];

		await renderPage(stubbing(desordenadas));

		expect(readingHrefs()).toEqual(['/read/ambar', '/read/bruma', '/read/zoologico']);
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
		onoffLiteraryWorkTeasersMock.forEach(({ authors }) => {
			authors.forEach(({ slug }) => {
				expect(hrefs).toContain(`/author/${slug}`);
			});
		});
	});

	it('should list the reading time of every work', async () => {
		await renderPage();

		const listing = within(screen.getByTestId('literary-works'));
		onoffLiteraryWorkTeasersMock.forEach(({ totalReadingTime }) => {
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
		expect(host.literaryWorks().map(({ slug }) => `/read/${slug}`)).toEqual(readingHrefs());
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

			await renderWithResponseInit(stubbing(onoffLiteraryWorkTeasersMock), responseInit);

			expect(responseInit.status).toBeUndefined();
		});
	});
});
