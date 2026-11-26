import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import type { LiteraryWork, LiteraryWorkCatalogEntry, LiteraryWorkTeaser } from '@models/literary-work.model';
import { type Catalog, createCatalog } from '@models/catalog.model';
import { onoffLiteraryWorkCatalogEntriesMock } from '@mocks/onoff-literary-work-catalog-entries.mock';
import {
	onoffLiteraryWorksMock,
	onoffLiteraryWorksWithEditorialNote,
	onoffLiteraryWorksWithoutEditorialNote,
	onoffLiteraryWorksWithEpigraphs,
	onoffLiteraryWorksWithSectionTitles,
} from '@mocks/onoff-literary-works.mock';
import { onoffLiteraryWorkTeasersMock } from '@mocks/onoff-literary-work-teasers.mock';
import { environment } from '../environments/environment';
import { Endpoints } from './endpoints';
import { HttpLiteraryWorkApi, LiteraryWorkApi, type LiteraryWorkTeaserFilter } from './literary-work.provider';
import type { LiteraryWorkDto } from '@models/literary-work.dto';
import { provideLiteraryWorkApiMock, StubLiteraryWorkApi } from './literary-work.mock';

// El DTO de wire es la serialización JSON del agregado: los métodos (toAnchor) y los brands se
// pierden, quedando el shape plano que el endpoint efectivamente emite. Se deriva del canon de Onoff
// en vez de hand-authorear un objeto mock paralelo.
function toWireDto(literaryWork: LiteraryWork): LiteraryWorkDto {
	return JSON.parse(JSON.stringify(literaryWork)) as LiteraryWorkDto;
}

// Quita claves sin dejarlas en `undefined`: el punto del caso que lo usa es que la clave **no viaje**,
// que es distinto de viajar con valor indefinido.
function omit<T extends object, K extends keyof T>(source: T, keys: readonly K[]): Omit<T, K> {
	const result = { ...source };
	for (const key of keys) {
		delete result[key];
	}
	return result;
}

describe('HttpLiteraryWorkApi', () => {
	let api: HttpLiteraryWorkApi;
	let http: HttpTestingController;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});
		api = TestBed.inject(HttpLiteraryWorkApi);
		http = TestBed.inject(HttpTestingController);
	});

	afterEach(() => {
		http.verify();
	});

	function requestBySlug(dto: LiteraryWorkDto): Promise<LiteraryWork> {
		const result = new Promise<LiteraryWork>((resolve, reject) => {
			api.getBySlug(dto.slug).subscribe({ next: resolve, error: reject });
		});
		http.expectOne(`${environment.apiUrl}${Endpoints.LiteraryWork}/${dto.slug}`).flush(dto);
		return result;
	}

	it.each(onoffLiteraryWorksMock)('rehidrata "$slug" al agregado de dominio, congelado', async (literaryWork) => {
		const dto = toWireDto(literaryWork);
		const rehydrated = await requestBySlug(dto);

		// Round-trip: re-serializar el agregado rehidratado reproduce el DTO de origen.
		expect(toWireDto(rehydrated)).toEqual(dto);
		expect(Object.isFrozen(rehydrated)).toBe(true);
	});

	it.each(onoffLiteraryWorksMock)(
		'deriva totalReadingTime de las secciones de "$slug", ignorando el valor del wire',
		async (literaryWork) => {
			const dto = toWireDto(literaryWork);
			const rehydrated = await requestBySlug({ ...dto, totalReadingTime: dto.totalReadingTime + 999 });

			expect(rehydrated.totalReadingTime).toBe(literaryWork.totalReadingTime);
		},
	);

	it.each(onoffLiteraryWorksWithSectionTitles)(
		'reconstruye el toAnchor() del título de sección de "$slug"',
		async (literaryWork) => {
			const rehydrated = await requestBySlug(toWireDto(literaryWork));
			// toAnchor() no cruza el wire; la rehidratación lo reconstruye vía createSectionTitle.
			const index = literaryWork.content.findIndex((section) => section.title !== undefined);
			expect(rehydrated.content[index].title?.toAnchor()).toBe(literaryWork.content[index].title?.toAnchor());
		},
	);

	it.each(onoffLiteraryWorksWithEpigraphs)('preserva el epígrafe de "$slug" en el round-trip', async (literaryWork) => {
		const rehydrated = await requestBySlug(toWireDto(literaryWork));
		const index = literaryWork.content.findIndex((section) => (section.epigraphs?.length ?? 0) > 0);
		expect(rehydrated.content[index].epigraphs?.[0].reference).toBe(
			literaryWork.content[index].epigraphs?.[0].reference,
		);
	});

	// Ningún round-trip del corpus ejercita la ausencia de las claves opcionales: todas las obras del
	// canon declaran badLanguage, y las secciones que se usan traen título y epígrafes. Sin este caso,
	// una opcionalidad perdida en el schema volvería la clave obligatoria y el wire real —donde sí
	// faltan— rompería.
	it('rehydrates a payload with every optional key absent', async () => {
		const dto = toWireDto(onoffLiteraryWorksMock[0]);
		const [firstSection, ...restOfSections] = dto.content;

		const rehydrated = await requestBySlug({
			...omit(dto, ['badLanguage', 'editorialNote']),
			content: [omit(firstSection, ['title', 'epigraphs']), ...restOfSections],
		});

		expect(rehydrated.badLanguage).toBeUndefined();
		expect(rehydrated.editorialNote).toBeUndefined();
		expect(rehydrated.content[0].title).toBeUndefined();
		expect(rehydrated.content[0].epigraphs).toBeUndefined();
	});

	it('errors the stream when the DTO violates a domain invariant', async () => {
		const dto = toWireDto(onoffLiteraryWorksMock[0]);

		// authors: [] pasa el schema de zod (array vacío es shape válido) pero viola la invariante
		// de dominio: la factory es la que lanza, no zod.
		await expect(requestBySlug({ ...dto, authors: [] })).rejects.toThrow(/sin autores/);
	});

	it.each(onoffLiteraryWorksWithEditorialNote)(
		'rehidrata la nota editorial de "$slug" como HTML saneado',
		async (literaryWork) => {
			const rehydrated = await requestBySlug(toWireDto(literaryWork));

			expect(rehydrated.editorialNote).toBe(literaryWork.editorialNote);
		},
	);

	it.each(onoffLiteraryWorksWithoutEditorialNote)(
		'deja la nota editorial de "$slug" en undefined cuando el DTO no la trae',
		async (literaryWork) => {
			const dto = toWireDto(literaryWork);
			const rehydrated = await requestBySlug(dto);

			expect(rehydrated.editorialNote).toBeUndefined();
			expect(toWireDto(rehydrated)).toEqual(dto);
		},
	);

	// El schema acepta el string vacío (z.string() no lo excluye), así que la guarda por truthiness
	// del provider es alcanzable: sin ella, createSanitizedHtml lanzaría por contenido vacío.
	it('leaves the editorial note undefined when the wire DTO carries an empty string', async () => {
		const dto = toWireDto(onoffLiteraryWorksMock[0]);
		const rehydrated = await requestBySlug({ ...dto, editorialNote: '' });

		expect(rehydrated.editorialNote).toBeUndefined();
	});

	// La frontera es la última defensa antes del [innerHTML] con bypass: un backend regresado que
	// sirviera HTML sin procesar tiene que fallar acá, no llegar al DOM.
	it('errors the stream when the editorial note carries html the pipeline never emits', async () => {
		const dto = toWireDto(onoffLiteraryWorksMock[0]);

		await expect(requestBySlug({ ...dto, editorialNote: '<p>Hola</p><script>alert(1)</script>' })).rejects.toThrow(
			/no pasó por el pipeline de sanitización/,
		);
	});

	it('errors the stream when the wire shape violates the DTO schema', async () => {
		const dto = toWireDto(onoffLiteraryWorksMock[0]);
		// readingTime como string en vez de number: zod lo rechaza en la frontera, antes de rehidratar.
		const malformed = { ...dto, content: [{ ...dto.content[0], readingTime: 'dos' }] };

		const result = new Promise<LiteraryWork>((resolve, reject) => {
			api.getBySlug(dto.slug).subscribe({ next: resolve, error: reject });
		});
		http.expectOne(`${environment.apiUrl}${Endpoints.LiteraryWork}/${dto.slug}`).flush(malformed);

		await expect(result).rejects.toThrow();
	});

	// El DTO de wire se deriva del canon por serialización, nunca a mano: es la misma forma en que
	// viaja de verdad, y enriquecer el corpus alcanza a estos casos solo.
	const wireTeasers = JSON.parse(JSON.stringify(onoffLiteraryWorkTeasersMock)) as unknown[];
	const collectionUrl = `${environment.apiUrl}${Endpoints.LiteraryWork}`;

	describe('getTeasers', () => {
		function requestTeasers(filter: LiteraryWorkTeaserFilter, url: string, payload: unknown[]) {
			const result = new Promise<LiteraryWorkTeaser[]>((resolve, reject) => {
				api.getTeasers(filter).subscribe({ next: resolve, error: reject });
			});
			http.expectOne(url).flush(payload);
			return result;
		}

		it('rehydrates the teasers filtered by author into domain teasers', async () => {
			const rehydrated = await requestTeasers(
				{ author: 'francois-onoff' },
				`${collectionUrl}/teasers?author=francois-onoff`,
				wireTeasers,
			);

			expect(rehydrated).toHaveLength(onoffLiteraryWorkTeasersMock.length);
			rehydrated.forEach((teaser, index) => {
				expect(teaser.slug).toBe(onoffLiteraryWorkTeasersMock[index].slug);
				expect(teaser.excerpt.bodyHtml).toBe(onoffLiteraryWorkTeasersMock[index].excerpt.bodyHtml);
			});
		});

		it('resolves an empty listing as an empty array', async () => {
			const listing = await requestTeasers({ author: 'sin-obras' }, `${collectionUrl}/teasers?author=sin-obras`, []);

			expect(listing).toEqual([]);
		});

		// La frontera valida acá y no en un template: un dato inválido corta el stream con error en vez
		// de llegar a la tarjeta como un hueco mudo.
		it('errors the stream when a teaser violates the DTO schema', async () => {
			const [first, ...rest] = wireTeasers as Array<Record<string, unknown>>;
			const malformed = [{ ...first, totalReadingTime: 'dos' }, ...rest];

			await expect(
				requestTeasers({ author: 'francois-onoff' }, `${collectionUrl}/teasers?author=francois-onoff`, malformed),
			).rejects.toThrow();
		});
	});

	describe('getCatalog', () => {
		type WireEntry = Record<string, unknown>;
		type WireCatalog = { entries: WireEntry[]; total: number };

		const wireCatalog = JSON.parse(
			JSON.stringify(createCatalog(onoffLiteraryWorkCatalogEntriesMock, onoffLiteraryWorkCatalogEntriesMock.length)),
		) as WireCatalog;

		function requestCatalog(payload: object) {
			const result = new Promise<Catalog<LiteraryWorkCatalogEntry>>((resolve, reject) => {
				api.getCatalog().subscribe({ next: resolve, error: reject });
			});
			http.expectOne(collectionUrl).flush(payload);
			return result;
		}

		it('requests the collection resource with no query params and rehydrates a frozen catalogue', async () => {
			const rehydrated = await requestCatalog(wireCatalog);

			expect(JSON.parse(JSON.stringify(rehydrated))).toEqual(wireCatalog);
			expect(Object.isFrozen(rehydrated)).toBe(true);
			expect(Object.isFrozen(rehydrated.entries)).toBe(true);
			rehydrated.entries.forEach((entry) => expect(Object.isFrozen(entry)).toBe(true));
		});

		it('keeps the order the server serves', async () => {
			const reversed = [...wireCatalog.entries].reverse();

			const rehydrated = await requestCatalog({ ...wireCatalog, entries: reversed });

			expect(rehydrated.entries.map(({ slug }) => slug)).toEqual(reversed.map(({ slug }) => slug));
		});

		// Un campo de más en el wire no llega al dominio: la factory proyecta la entrada a su contrato.
		it('projects every entry to its contract, dropping fields the wire carries in excess', async () => {
			const [first, ...rest] = wireCatalog.entries;
			const [author] = first['authors'] as WireEntry[];
			const bloated = {
				...first,
				coverImage: 'https://cdn.sanity.io/portada.jpg',
				excerpt: { bodyHtml: '<p>Extracto.</p>' },
				authors: [{ ...author, biography: '<p>Biografía.</p>' }],
			};

			const rehydrated = await requestCatalog({ ...wireCatalog, entries: [bloated, ...rest] });

			expect(Object.keys(rehydrated.entries[0]).sort()).toEqual([
				'authors',
				'kind',
				'slug',
				'tags',
				'title',
				'totalReadingTime',
			]);
			expect(Object.keys(rehydrated.entries[0].authors[0]).sort()).toEqual(['name', 'slug']);
		});

		it.each([
			['a reading time that is not a number', (entry: WireEntry) => ({ ...entry, totalReadingTime: 'dos' })],
			['a kind other than literaryWork', (entry: WireEntry) => ({ ...entry, kind: 'author' })],
			['no authors', (entry: WireEntry) => ({ ...entry, authors: [] })],
			['a blank title', (entry: WireEntry) => ({ ...entry, title: '  ' })],
		])('errors the stream when an entry carries %s', async (_label, corrupt) => {
			const [first, ...rest] = wireCatalog.entries;

			await expect(requestCatalog({ ...wireCatalog, entries: [corrupt(first), ...rest] })).rejects.toThrow();
		});

		it('errors the stream when the total is smaller than the entries it lists', async () => {
			await expect(requestCatalog({ ...wireCatalog, total: wireCatalog.entries.length - 1 })).rejects.toThrow(
				/Catalog inválido/,
			);
		});

		it('resolves the empty catalogue as empty', async () => {
			expect(await requestCatalog({ entries: [], total: 0 })).toEqual({ entries: [], total: 0 });
		});
	});
});

describe('LiteraryWorkApi', () => {
	it('resolves the http implementation with no explicit provider', () => {
		TestBed.configureTestingModule({
			providers: [provideHttpClient(), provideHttpClientTesting()],
		});

		expect(TestBed.inject(LiteraryWorkApi)).toBeInstanceOf(HttpLiteraryWorkApi);
	});

	it('lets the test double override the default implementation', () => {
		TestBed.configureTestingModule({
			providers: [
				provideHttpClient(),
				provideHttpClientTesting(),
				provideLiteraryWorkApiMock(new StubLiteraryWorkApi({ literaryWork: onoffLiteraryWorksMock[0] })),
			],
		});

		expect(TestBed.inject(LiteraryWorkApi)).toBeInstanceOf(StubLiteraryWorkApi);
	});
});
