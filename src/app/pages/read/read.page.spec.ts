// Core
import { RESPONSE_INIT } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

// 3rd party modules
import { render, screen } from '@testing-library/angular';
import { throwError, type Observable } from 'rxjs';

// Models
import { createLiteraryWork, type LiteraryWork } from '@models/literary-work.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createMarkdown } from '@models/markdown.model';
import { deriveSectionReadingTime } from '@models/reading-time.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import {
	onoffLiteraryWorksMock,
	onoffLiteraryWorksWithEditorialNote,
	onoffLiteraryWorksWithoutEditorialNote,
	onoffLiteraryWorksWithSectionTitles,
} from '@mocks/onoff-literary-works.mock';
import { provideLiteraryWorkApiMock, StubLiteraryWorkApi } from '../../providers/literary-work.mock';
import type { LiteraryWorkApi } from '../../providers/literary-work-api.interface';
import ReadPage from './read.page';

class StubFailingLiteraryWorkApi implements LiteraryWorkApi {
	constructor(private readonly status: number) {}

	public getBySlug(): Observable<LiteraryWork> {
		return throwError(() => new HttpErrorResponse({ status: this.status, statusText: 'error' }));
	}
}

// Obra representativa del canon para los casos que solo necesitan una obra cualquiera (su slug, o el
// camino de error): se toma de la colección, no por import directo de un mock específico.
const [representativeLiteraryWork] = onoffLiteraryWorksMock;

// Payload que combina varios vectores XSS con prosa benigna alrededor. Se procesa por el mismo
// pipeline de dominio que el corpus, así el bodyHtml es realmente SanitizedHtml — no un string
// clavado — y el test ejercita la cadena real pipeline → SanitizedHtml → [innerHTML]+bypass.
const MALICIOUS_MARKDOWN = [
	'Comienzo legible de la obra maliciosa.',
	'',
	'<script>window.__xssExecuted = true;</script>',
	'',
	'<img src=x onerror="window.__xssExecuted = true">',
	'',
	'[enlace trampa](javascript:window.__xssExecuted=true)',
	'',
	'Final legible de la obra maliciosa.',
].join('\n');

// Deriva del canon una obra cuya única sección tiene un cuerpo malicioso saneado, reusando el resto
// de la metadata de una obra real (sin hand-authorear un mock nuevo).
const literaryWorkWithMaliciousBody = (base: LiteraryWork): LiteraryWork => {
	const body = createMarkdown(MALICIOUS_MARKDOWN);
	return createLiteraryWork({
		_id: `${base._id}-xss`,
		slug: `${base.slug}-xss`,
		title: base.title,
		authors: [...base.authors],
		coverImage: base.coverImage,
		content: [
			createLiteraryWorkSection({
				position: 0,
				bodyHtml: markdownToSanitizedHtml(body),
				readingTime: deriveSectionReadingTime(body),
			}),
		],
		mediaSources: [...base.mediaSources],
		resources: [...base.resources],
		tags: [...base.tags],
		originalPublication: base.originalPublication,
		publishedAt: base.publishedAt,
	});
};

// NOTA (#1471): `ReadPage` es hoy un walking skeleton (#1853); estos tests cubren su render y sus
// estados mínimos. Al implementar la ReadPage V3 completa en #1471 se expanden y robustecen
// (variantes de media, sección "Más cuentos", layout V3), reemplazando estos casos transitorios.
describe('ReadPage', () => {
	const setup = async (
		literaryWork: LiteraryWork,
		options: { api?: LiteraryWorkApi; responseInit?: ResponseInit } = {},
	) => {
		return await render(ReadPage, {
			providers: [
				provideLiteraryWorkApiMock(options.api ?? new StubLiteraryWorkApi(literaryWork)),
				...(options.responseInit ? [{ provide: RESPONSE_INIT, useValue: options.responseInit }] : []),
			],
			inputs: { slug: literaryWork.slug },
		});
	};

	it.each(onoffLiteraryWorksMock)(
		'renderiza el H1, el byline y la barra de lectura de "$slug"',
		async (literaryWork) => {
			await setup(literaryWork);

			expect(await screen.findByRole('heading', { level: 1, name: literaryWork.title })).toBeTruthy();
			expect(screen.getByText(literaryWork.authors[0].name)).toBeTruthy();
			expect(screen.getByText(new RegExp(`${literaryWork.totalReadingTime} minutos de lectura`))).toBeTruthy();
			expect(screen.getByRole('button', { name: /compartir/i })).toBeTruthy();
		},
	);

	it('renderiza el cuerpo saneado de la obra', async () => {
		await setup(representativeLiteraryWork);

		// Una palabra del cuerpo saneado (sin tags) de la propia obra, para verificar que el bodyHtml
		// se renderiza — derivada de la obra, no un texto clavado de una obra concreta.
		const bodyText = representativeLiteraryWork.content[0].bodyHtml.replace(/<[^>]+>/g, ' ');
		const [bodyWord] = bodyText.match(/\p{L}{6,}/gu) ?? [];
		if (bodyWord === undefined) {
			throw new Error(`La primera sección de "${representativeLiteraryWork.slug}" no tiene texto de cuerpo`);
		}

		expect((await screen.findAllByText(new RegExp(bodyWord, 'i'))).length).toBeGreaterThan(0);
	});

	it('renderiza el cuerpo malicioso saneado de forma inerte en el DOM', async () => {
		const { container } = await setup(literaryWorkWithMaliciousBody(representativeLiteraryWork));

		// La prosa benigna del cuerpo sí llega al lector...
		expect(await screen.findByText(/Final legible de la obra maliciosa/i)).toBeTruthy();

		// ...pero ningún vector sobrevive como elemento ejecutable ni como atributo de handler en el
		// DOM renderizado por [innerHTML]+bypassSecurityTrustHtml. querySelector es la vía de verificar
		// ausencia de tags/atributos que ATL no expone por rol.
		// (No se afirma ausencia de <img> a secas: la página sí renderiza la portada legítima; el
		// atributo de handler malicioso lo cubre el selector [onerror] de abajo.)
		expect(container.querySelector('script')).toBeNull();
		expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
		expect(container.querySelector('[onerror], [onclick], [onload], [onmouseover]')).toBeNull();
	});

	it.each(onoffLiteraryWorksWithSectionTitles)(
		'renderiza el título de sección de "$slug" con su ancla',
		async (literaryWork) => {
			await setup(literaryWork);

			const titledSection = literaryWork.content.find((section) => section.title !== undefined);
			const sectionTitle = titledSection?.title;
			if (sectionTitle === undefined) {
				throw new Error(
					`"${literaryWork.slug}" está en onoffLiteraryWorksWithSectionTitles pero no tiene sección con título`,
				);
			}

			const heading = await screen.findByRole('heading', { level: 2, name: sectionTitle.value });
			expect(heading.getAttribute('id')).toBe(sectionTitle.toAnchor());
		},
	);

	it.each(onoffLiteraryWorksWithEditorialNote)(
		'renderiza la nota editorial de "$slug" bajo su propio encabezado',
		async (literaryWork) => {
			await setup(literaryWork);

			expect(await screen.findByRole('heading', { level: 2, name: 'Nota editorial' })).toBeTruthy();

			const noteText = (literaryWork.editorialNote ?? '').replace(/<[^>]+>/g, ' ');
			const [noteWord] = noteText.match(/\p{L}{6,}/gu) ?? [];
			if (noteWord === undefined) {
				throw new Error(`La nota editorial de "${literaryWork.slug}" no tiene texto`);
			}

			expect(screen.getAllByText(new RegExp(noteWord, 'i')).length).toBeGreaterThan(0);

			// La nota se pinta dentro del bloque del Design System, no suelta en la página: sin esto el
			// caso pasaría igual con el HTML volcado directamente en el template.
			expect(screen.getByTestId('editorial-note')).toBeTruthy();
			// La nota no transporta atribución, así que el pie de la figura no debe existir.
			expect(screen.queryByTestId('reference')).toBeNull();
		},
	);

	it.each(onoffLiteraryWorksWithoutEditorialNote)(
		'omite el bloque de nota editorial en "$slug", que no la tiene',
		async (literaryWork) => {
			await setup(literaryWork);

			expect(await screen.findByRole('heading', { level: 1, name: literaryWork.title })).toBeTruthy();
			expect(screen.queryByRole('heading', { level: 2, name: 'Nota editorial' })).toBeNull();
		},
	);

	it('renderiza el estado not-found y marca la respuesta SSR como 404', async () => {
		const responseInit: ResponseInit = {};
		await setup(representativeLiteraryWork, { api: new StubFailingLiteraryWorkApi(404), responseInit });

		expect(await screen.findByText(/no encontramos esta obra/i)).toBeTruthy();
		expect(responseInit.status).toBe(404);
	});

	it('no marca la respuesta SSR para errores que no son 404', async () => {
		const responseInit: ResponseInit = {};
		await setup(representativeLiteraryWork, { api: new StubFailingLiteraryWorkApi(500), responseInit });

		expect(await screen.findByText(/no encontramos esta obra/i)).toBeTruthy();
		expect(responseInit.status).toBeUndefined();
	});
});
