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
	onoffLiteraryWorksSingleSection,
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

// Una palabra del cuerpo saneado (sin tags) de la primera sección, derivada de la propia obra en vez
// de un texto clavado de una obra concreta.
const firstBodyWord = (literaryWork: LiteraryWork): string => {
	const bodyText = literaryWork.content[0].bodyHtml.replace(/<[^>]+>/g, ' ');
	const [word] = bodyText.match(/\p{L}{6,}/gu) ?? [];
	if (word === undefined) {
		throw new Error(`La primera sección de "${literaryWork.slug}" no tiene texto de cuerpo`);
	}
	return word;
};

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

	// Test de aceptación del AC principal (epic #1481): una obra de una sola sección ofrece al lector
	// las mismas affordances que la página Story (story.component.html) — título como encabezado
	// principal, byline de autoría, indicador de tiempo de lectura, control de compartir y el cuerpo
	// saneado legible. Se corre sobre el selector mono-sección (hoy todo el corpus) para declarar
	// explícitamente la intención de paridad, consolidando las aserciones antes dispersas.
	it.each(onoffLiteraryWorksSingleSection)(
		'ofrece las affordances de lectura de una Story para la obra mono-sección "$slug"',
		async (literaryWork) => {
			await setup(literaryWork);

			expect(await screen.findByRole('heading', { level: 1, name: literaryWork.title })).toBeTruthy();
			expect(screen.getByText(literaryWork.authors[0].name)).toBeTruthy();
			expect(screen.getByText(new RegExp(`${literaryWork.totalReadingTime} minutos de lectura`))).toBeTruthy();
			expect(screen.getByRole('button', { name: /compartir/i })).toBeTruthy();

			// Cuerpo saneado legible: una palabra del cuerpo de la propia obra (sin tags) aparece en el DOM.
			expect((await screen.findAllByText(new RegExp(firstBodyWord(literaryWork), 'i'))).length).toBeGreaterThan(0);
		},
	);

	it('renderiza el cuerpo malicioso saneado de forma inerte en el DOM', async () => {
		const { container } = await setup(literaryWorkWithMaliciousBody(representativeLiteraryWork));

		// La prosa benigna del cuerpo sí llega al lector...
		expect(await screen.findByText(/Final legible de la obra maliciosa/i)).toBeTruthy();

		// ...pero ningún vector sobrevive como elemento ejecutable ni como atributo de handler en el
		// DOM renderizado por [innerHTML]+bypassSecurityTrustHtml. Se consulta el `container` del render,
		// que acota la aserción al árbol de la página: la ausencia de estos tags/atributos no se expresa
		// por rol de ATL, de ahí el acceso directo al nodo. (No se
		// afirma ausencia de <img> a secas: la página renderiza la portada legítima; el handler malicioso
		// lo cubre el selector [onerror] de abajo.)
		/* eslint-disable testing-library/no-container, testing-library/no-node-access */
		expect(container.querySelector('script')).toBeNull();
		expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
		expect(container.querySelector('[onerror], [onclick], [onload], [onmouseover]')).toBeNull();
		/* eslint-enable testing-library/no-container, testing-library/no-node-access */
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

	it('should render the not-found state and mark the SSR response as 404', async () => {
		const responseInit: ResponseInit = {};
		await setup(representativeLiteraryWork, { api: new StubFailingLiteraryWorkApi(404), responseInit });

		expect(await screen.findByText(/no encontramos esta obra/i)).toBeTruthy();
		expect(responseInit.status).toBe(404);
	});

	// Un 200 acá lo cachearía el borde como si fuera contenido, sin purga que lo desaloje.
	it('should mark the SSR response as 503 when the failure is not a 404', async () => {
		const responseInit: ResponseInit = {};
		await setup(representativeLiteraryWork, { api: new StubFailingLiteraryWorkApi(500), responseInit });

		expect(await screen.findByText(/no encontramos esta obra/i)).toBeTruthy();
		expect(responseInit.status).toBe(503);
	});
});
