// Core
import { RESPONSE_INIT } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { renderDeferBlocks } from '@testing/defer-blocks';

// 3rd party modules
import { render, screen, within } from '@testing-library/angular';
import { restoreAllMocks, spyOn } from '@test-utils';
import { of, Subject, throwError, type Observable } from 'rxjs';

// Models
import { createLiteraryWork, type LiteraryWork, type LiteraryWorkTeaser } from '@models/literary-work.model';
import { createLiteraryWorkSection } from '@models/literary-work-section.model';
import { createMarkdown } from '@models/markdown.model';
import { deriveSectionReadingTime } from '@models/reading-time.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import {
	onoffLiteraryWorksMock,
	onoffLiteraryWorksSingleSection,
	onoffLiteraryWorksWithEditorialNote,
	onoffLiteraryWorksWithEpigraphs,
	onoffLiteraryWorksWithoutEditorialNote,
	onoffLiteraryWorksWithMultipleMediaSources,
	onoffLiteraryWorksWithoutMediaSources,
	onoffLiteraryWorksWithSectionTitles,
} from '@mocks/onoff-literary-works.mock';
import { provideLiteraryWorkApiMock, StubLiteraryWorkApi } from '../../providers/literary-work.mock';
import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';
import { provideCollectionApiMock, StubCollectionApi } from '../../providers/collection.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { provideRouter } from '@angular/router';
import type { LiteraryWorkApi } from '../../providers/literary-work.provider';
import { HeadMetadataDirective } from '../../directives/head-metadata.directive';
import { buildCanonicalUrl } from '@app-utils/build-canonical-url.util';
import { AppRoutes } from '../../app.routes';
import ReadPage from './read.page';

class StubFailingLiteraryWorkApi implements LiteraryWorkApi {
	constructor(private readonly status: number) {}

	public getBySlug(): Observable<LiteraryWork> {
		return throwError(() => new HttpErrorResponse({ status: this.status, statusText: 'error' }));
	}

	public getTeasers(): Observable<LiteraryWorkTeaser[]> {
		return throwError(() => new HttpErrorResponse({ status: this.status, statusText: 'error' }));
	}
}

// Sustituye el timing del entorno, no el dato: el test decide cuándo llega la obra, que es lo único que
// permite observar el estado intermedio. Los stubs emiten sincrónico y el skeleton nunca alcanza a verse.
class ControllableLiteraryWorkApi implements LiteraryWorkApi {
	private readonly work = new Subject<LiteraryWork>();

	public getBySlug(): Observable<LiteraryWork> {
		return this.work.asObservable();
	}

	// El control es sobre la obra que se lee: las sugerencias del pie llegan resueltas del corpus,
	// para que el estado intermedio que estos casos observan sea el de la obra y no el del bloque.
	public getTeasers(): Observable<LiteraryWorkTeaser[]> {
		return of([...onoffLiteraryWorkTeasersMock]);
	}

	public emit(literaryWork: LiteraryWork): void {
		this.work.next(literaryWork);
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

// La página pinta con el mismo bloque del Design System la nota editorial y cada epígrafe, así que el
// testid no alcanza para elegir uno: se lo identifica por una palabra de su propio texto.
const editorialNoteBlockContaining = (blocks: readonly HTMLElement[], word: string): HTMLElement => {
	const block = blocks.find((candidate) => new RegExp(word, 'i').test(candidate.textContent ?? ''));
	if (block === undefined) {
		throw new Error(`Ningún bloque de nota editorial contiene "${word}"`);
	}
	return block;
};

// Payload que combina varios vectores XSS con texto benigno alrededor. Se procesa por el mismo
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

// Estos tests cubren el layout de la página, sus estados y el cableado del contexto de navegación.
// La cobertura de extremo a extremo y el catálogo de variantes viven en sus propios issues.
describe('ReadPage', () => {
	const setup = async (
		literaryWork: LiteraryWork,
		options: {
			api?: LiteraryWorkApi;
			responseInit?: ResponseInit;
			navigation?: string;
			navigationSlug?: string;
		} = {},
	) => {
		return await render(ReadPage, {
			providers: [
				provideLiteraryWorkApiMock(options.api ?? new StubLiteraryWorkApi(literaryWork, onoffLiteraryWorkTeasersMock)),
				provideCollectionApiMock(new StubCollectionApi(onoffCollectionsMock)),
				provideRouter([]),
				...(options.responseInit ? [{ provide: RESPONSE_INIT, useValue: options.responseInit }] : []),
			],
			inputs: {
				slug: literaryWork.slug,
				...(options.navigation ? { navigation: options.navigation } : {}),
				...(options.navigationSlug ? { navigationSlug: options.navigationSlug } : {}),
			},
		});
	};

	afterEach(() => restoreAllMocks());

	// Afirma la promesa del comentario de la plantilla —el esqueleto se pinta con `@if`/`@else` planos—
	// que hasta acá ningún test sostenía: quitarlo no rompía nada.
	describe('estado de carga', () => {
		it('muestra el esqueleto de página hasta que la obra llega, y el contenido después', async () => {
			const api = new ControllableLiteraryWorkApi();
			await setup(representativeLiteraryWork, { api });

			// Control positivo doble: el esqueleto está y el contenido todavía no. Sin la segunda mitad, un
			// esqueleto que conviviera con el contenido pasaría igual.
			expect(screen.getByTestId('read-page-skeleton')).toBeTruthy();
			expect(screen.queryByRole('heading', { level: 1 })).toBeNull();

			api.emit(representativeLiteraryWork);

			expect(await screen.findByRole('heading', { level: 1, name: representativeLiteraryWork.title })).toBeTruthy();
			expect(screen.queryByTestId('read-page-skeleton')).toBeNull();
		});
	});

	// Test de aceptación del criterio principal de LiteraryWork: una obra de una sola sección ofrece al lector
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

	// El cuerpo se pinta dentro del componente que lo posee —igual que la nota editorial—, no volcado
	// suelto en la plantilla: de ahí cuelgan el bypass y las reglas tipográficas del cuerpo.
	it.each(onoffLiteraryWorksMock)(
		'pinta el cuerpo de "$slug" dentro del componente del cuerpo de sección',
		async (literaryWork) => {
			await setup(literaryWork);

			const sectionBodies = await screen.findAllByTestId('literary-work-section-body');
			expect(sectionBodies.length).toBe(literaryWork.content.length);
			expect(sectionBodies[0].textContent).toMatch(new RegExp(firstBodyWord(literaryWork), 'i'));
		},
	);

	it('renderiza el cuerpo malicioso saneado de forma inerte en el DOM', async () => {
		const { container } = await setup(literaryWorkWithMaliciousBody(representativeLiteraryWork));

		// El texto benigno del cuerpo sí llega al lector...
		expect(await screen.findByText(/Final legible de la obra maliciosa/i)).toBeTruthy();

		// ...pero ningún vector sobrevive como elemento ejecutable ni como atributo de handler en el DOM
		// renderizado por [innerHTML]+bypassSecurityTrustHtml. Se consulta el `container` del render, que
		// acota la aserción al árbol de la página: la ausencia de estos tags/atributos no se expresa por
		// rol de ATL, de ahí el acceso directo al nodo. (No se afirma ausencia de <img> a secas: la página
		// renderiza la portada legítima; el handler malicioso lo cubre el selector [onerror] de abajo.)
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
		'renderiza la nota editorial de "$slug" en el bloque del Design System',
		async (literaryWork) => {
			await setup(literaryWork);

			const noteText = (literaryWork.editorialNote ?? '').replace(/<[^>]+>/g, ' ');
			const [noteWord] = noteText.match(/\p{L}{6,}/gu) ?? [];
			if (noteWord === undefined) {
				throw new Error(`La nota editorial de "${literaryWork.slug}" no tiene texto`);
			}

			expect(screen.getAllByText(new RegExp(noteWord, 'i')).length).toBeGreaterThan(0);

			// La nota se pinta dentro del bloque del Design System, no suelta en la página: sin esto el
			// caso pasaría igual con el HTML volcado directamente en el template. Se lo identifica por su
			// texto y no por su posición, porque los epígrafes usan el mismo bloque en otra variante.
			const noteBlock = editorialNoteBlockContaining(await screen.findAllByTestId('editorial-note'), noteWord);

			// La nota se anuncia como región propia: sin el rótulo, quien navega por landmarks no tiene
			// forma de saber que dejó de leer la obra y pasó a leer a la redacción.
			expect(await screen.findByRole('complementary', { name: 'Nota editorial' })).toBeTruthy();
			// La nota no transporta atribución, así que el pie de la figura no debe existir.
			expect(within(noteBlock).queryByTestId('reference')).toBeNull();
		},
	);

	// El epígrafe es una cita de un tercero dentro de la obra: lo pinta el mismo bloque del Design
	// System en su variante `highlight`, que es la que existe para este caso.
	it.each(onoffLiteraryWorksWithEpigraphs)(
		'pinta los epígrafes de "$slug" como cita del Design System',
		async (literaryWork) => {
			await setup(literaryWork);

			const [epigraph] = literaryWork.content.flatMap((section) => [...(section.epigraphs ?? [])]);
			const epigraphText = epigraph.text.replace(/<[^>]+>/g, ' ');
			const [epigraphWord] = epigraphText.match(/\p{L}{6,}/gu) ?? [];
			if (epigraphWord === undefined) {
				throw new Error(`El epígrafe de "${literaryWork.slug}" no tiene texto`);
			}

			const epigraphBlock = editorialNoteBlockContaining(await screen.findAllByTestId('editorial-note'), epigraphWord);

			// La variante `highlight` cita a un tercero, y por eso rinde <blockquote> y no <aside>: es la
			// distinción semántica que la página perdería si volviera a volcar el epígrafe a mano.
			expect(within(epigraphBlock).getByRole('blockquote')).toBeTruthy();
			// La atribución acompaña al epígrafe que la trae; el canon podría sumar mañana uno sin fuente, y
			// la variante `highlight` cubre los dos casos.
			if (epigraph.reference === undefined) {
				expect(within(epigraphBlock).queryByTestId('reference')).toBeNull();
			} else {
				expect(within(epigraphBlock).getByTestId('reference')).toBeTruthy();
			}
		},
	);

	it.each(onoffLiteraryWorksWithoutEditorialNote)(
		'omite el bloque de nota editorial en "$slug", que no la tiene',
		async (literaryWork) => {
			await setup(literaryWork);

			expect(await screen.findByRole('heading', { level: 1, name: literaryWork.title })).toBeTruthy();

			// Sin nota editorial, los únicos bloques del Design System que quedan son los epígrafes: si la
			// página pintara una nota vacía, este conteo la delataría.
			const epigraphCount = literaryWork.content.reduce(
				(total, section) => total + (section.epigraphs?.length ?? 0),
				0,
			);
			expect(screen.queryAllByTestId('editorial-note').length).toBe(epigraphCount);
		},
	);

	// La página monta el bloque de formatos, no lo implementa: estos casos afirman el cableado —que la
	// obra le llegue y que su ausencia no deje nada dibujado—, y el comportamiento del bloque lo cubre
	// su propio spec.
	describe('bloque de formatos multimedia', () => {
		const [workWithFormats] = onoffLiteraryWorksWithMultipleMediaSources;
		const [workWithoutFormats] = onoffLiteraryWorksWithoutMediaSources;

		it('ofrece los formatos de una obra que trae varios', async () => {
			const { fixture } = await setup(workWithFormats);

			await renderDeferBlocks(fixture);

			expect(screen.getByRole('heading', { name: /diferentes formatos/i })).toBeInTheDocument();
			expect(screen.getByRole('group', { name: 'Formatos disponibles' })).toBeInTheDocument();
		});

		// El bloque no está en el primer render y llega recién cuando el diferido se resuelve. No es una
		// prueba de lo que sirve el servidor —el entorno de tests no renderiza en servidor—, sino de que
		// el diferido sigue en su lugar: sin este caso, sacarlo no rompería nada.
		it('no forma parte del render inicial', async () => {
			await setup(workWithFormats);

			expect(screen.queryByRole('heading', { name: /diferentes formatos/i })).not.toBeInTheDocument();
			expect(screen.queryByRole('group', { name: 'Formatos disponibles' })).not.toBeInTheDocument();
		});

		// La aserción de que el chunk no se pide: el marcador de posición existe solo dentro del bloque
		// diferido, así que su ausencia dice que el bloque ni siquiera se instanció y no queda
		// disparador que pueda descargarlo.
		it('declara el bloque diferido de formatos cuando la obra trae recursos', async () => {
			await setup(workWithFormats);

			expect(screen.getByTestId('media-formats-placeholder')).toBeInTheDocument();
		});

		it('no declara el bloque diferido de formatos cuando la obra no trae multimedia', async () => {
			await setup(workWithoutFormats);

			expect(screen.queryByTestId('media-formats-placeholder')).not.toBeInTheDocument();
		});

		it('no dibuja el bloque cuando la obra no trae multimedia', async () => {
			const { fixture } = await setup(workWithoutFormats);

			await renderDeferBlocks(fixture);

			expect(screen.queryByRole('heading', { name: /formatos?/i })).not.toBeInTheDocument();
			expect(screen.queryByRole('group', { name: 'Formatos disponibles' })).not.toBeInTheDocument();
		});
	});

	// La página transporta el contexto de navegación y elige con él la variante; qué sugiere cada
	// variante lo cubre el spec del despachador. Se afirma por el encabezado que cada una escribe,
	// que es lo observable de haber elegido bien.
	describe('sugerencias de lectura', () => {
		const [work] = onoffLiteraryWorksSingleSection;

		// Las dos variantes encabezan con "Más obras de …", así que lo que distingue a cuál se eligió es
		// el nombre: el de la colección o el del autor.
		it('ofrece las de la colección cuando se entró desde una', async () => {
			const { fixture } = await setup(work, { navigation: 'collection', navigationSlug: onoffCollectionsMock[0].slug });

			await renderDeferBlocks(fixture);

			expect(
				screen.getByRole('heading', { name: `Más obras de ${onoffCollectionsMock[0].title}` }),
			).toBeInTheDocument();
		});

		it('ofrece las del autor cuando se entró desde su listado', async () => {
			const { fixture } = await setup(work, { navigation: 'author', navigationSlug: work.authors[0].slug });

			await renderDeferBlocks(fixture);

			expect(screen.getByRole('heading', { name: `Más obras de ${work.authors[0].name}` })).toBeInTheDocument();
		});

		// Una obra abierta por URL directa no trae contexto, y aun así tiene que ofrecer a dónde seguir:
		// se cae al autor de la propia obra.
		it('cae en las del autor de la obra cuando no hay contexto en la ruta', async () => {
			const { fixture } = await setup(work);

			await renderDeferBlocks(fixture);

			expect(screen.getByRole('heading', { name: `Más obras de ${work.authors[0].name}` })).toBeInTheDocument();
		});
	});

	// La política de cabecera la escriben las hostDirectives de SEO de la página; estos casos fijan lo
	// observable a través de ellas y el borde sin obra, donde ambas hacen early-return.
	describe('metadata de la cabecera', () => {
		it('marca la página como indexable', async () => {
			const robotsSpy = spyOn(HeadMetadataDirective.prototype, 'setRobots');

			await setup(representativeLiteraryWork);

			expect(robotsSpy).toHaveBeenCalledWith('index, follow');
		});

		// Sin obra no hay señal que escribir: las directivas no emiten nada y rige el default del
		// documento hasta que los datos llegan.
		it('no emite robots cuando la obra no carga', async () => {
			const robotsSpy = spyOn(HeadMetadataDirective.prototype, 'setRobots');

			await setup(representativeLiteraryWork, { api: new StubFailingLiteraryWorkApi(404) });

			expect(robotsSpy).not.toHaveBeenCalled();
		});

		it('titula la página con el título de la obra y su byline', async () => {
			const titleSpy = spyOn(HeadMetadataDirective.prototype, 'setTitle');

			await setup(representativeLiteraryWork);

			const byline = representativeLiteraryWork.authors.map((author) => author.name).join(', ');
			expect(titleSpy).toHaveBeenCalledWith(`${representativeLiteraryWork.title} - ${byline}`);
		});

		it('emite un canonical self-referencial derivado del slug de la obra', async () => {
			const canonicalSpy = spyOn(HeadMetadataDirective.prototype, 'setCanonicalUrl');

			await setup(representativeLiteraryWork);

			expect(canonicalSpy).toHaveBeenCalledWith(
				buildCanonicalUrl(`${AppRoutes.Read}/${representativeLiteraryWork.slug}`),
			);
		});
	});

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
