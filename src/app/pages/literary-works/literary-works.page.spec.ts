import { render, screen, within } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { RESPONSE_INIT } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { restoreAllMocks, spyOn } from '@test-utils';

import LiteraryWorksPage from './literary-works.page';
import { AppRoutes } from '../../app.routes';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
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
		const { container } = await renderPage(stubbing([]));

		expect(screen.getByTestId('catalog-empty')).toBeInTheDocument();
		// eslint-disable-next-line testing-library/no-container, testing-library/no-node-access -- el esqueleto no expone rol ni texto: la ausencia solo se afirma por selector
		expect(container.querySelector('cuentoneta-literary-work-card-teaser-skeleton')).toBeNull();
	});

	it('should tell the reader when the catalogue fails to load', async () => {
		await renderPage(new FailingLiteraryWorkApi());

		expect(screen.getByTestId('catalog-error')).toBeInTheDocument();
		expect(screen.queryByTestId('literary-works')).not.toBeInTheDocument();
	});

	it('should point the canonical URL at its own route', async () => {
		const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');

		await renderPage();

		expect(canonicalSpy).toHaveBeenCalledWith(buildCanonicalUrl(AppRoutes.LiteraryWork));
	});

	// Ofrecer al indexado una página que todavía no lista nada gasta rastreo en una URL sin contenido.
	it('should opt out of indexing while it lists no work', async () => {
		const robotsSpy = spyOn(HeadMetadataDirective.prototype, 'setRobots');

		await renderPage();

		expect(robotsSpy).toHaveBeenCalledWith('noindex, follow');
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
