import { clearAllMocks, type Mock, restoreAllMocks, spyOn } from '@test-utils';
import type { LandingPageContent } from '@models/landing-page-content.model';
import type { LiteraryWorkTeaser } from '@models/literary-work.model';
import type { ReadingSuggestionsScope } from '@models/reading-suggestions.model';
import { createSlug } from '@models/slug.model';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import {
	onoffLiteraryWorkNavigationTeasersWithAuthorsMock,
	onoffLiteraryWorkTeasersMock,
} from '@mocks/onoff-literary-work-teasers.mock';
import { onoffCollectionsMock } from '@mocks/onoff-collections.mock';
import * as literaryWorkService from './literary-work.service';
import { getLiteraryWorkBySlug, getLiteraryWorkTeasers, getReadingSuggestions } from './literary-work.service';
import { LiteraryWorkNotFoundError, MalformedLiteraryWorkError } from './literary-work.errors';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';
import type {
	LiteraryWorkRepository,
	LiteraryWorkSuggestionCandidate,
	LiteraryWorkSuggestionsListing,
	LiteraryWorkTeaserListing,
} from './literary-work.repository';
import { environment } from '../../_helpers/environment';
import { fetchClarityData } from '../../_helpers/clarity-connector';
import { ClarityRequestError, ClarityResponseError } from '../../_helpers/clarity-connector.errors';
import { RotatingContentNotFoundError } from '../content/content.errors';
import { InMemoryContentRepository } from '../content/content.repository.mock';

// Clarity es un servicio externo alcanzado por import de módulo, no por un seam de inyección: no hay
// dónde pasarle un doble sin cambiar el contrato del caso de uso.
/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock de módulo de un servicio externo sin punto de inyección */
vi.mock('../../_helpers/clarity-connector', () => ({ fetchClarityData: vi.fn() }));
/* eslint-enable no-restricted-syntax */

describe('getLiteraryWorkBySlug', () => {
	const repository = new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock, [], []);

	it.each(onoffLiteraryWorksMock)('devuelve el agregado de dominio para "$slug"', async (literaryWork) => {
		expect(await getLiteraryWorkBySlug(literaryWork.slug, repository)).toBe(literaryWork);
	});

	it('lanza LiteraryWorkNotFoundError para un slug desconocido', async () => {
		await expect(getLiteraryWorkBySlug('no-existe', repository)).rejects.toThrow(LiteraryWorkNotFoundError);
	});
});

// Devuelve un listado canned con `malformed` poblado: el doble en memoria traduce de verdad y nunca
// produce esa rama, así que la política de descarte solo se puede ejercitar con un stub.
class StubLiteraryWorkRepository implements LiteraryWorkRepository {
	constructor(private readonly listing: LiteraryWorkTeaserListing) {}

	public async fetchBySlug(): Promise<never> {
		throw new Error('No participa de estos casos.');
	}

	public async fetchTeasers(): Promise<LiteraryWorkTeaserListing> {
		return this.listing;
	}

	public async fetchSuggestions(): Promise<never> {
		throw new Error('No participa de estos casos.');
	}
}

describe('getLiteraryWorkTeasers', () => {
	const [firstTeaser] = onoffLiteraryWorkTeasersMock;
	const [author] = firstTeaser.authors;
	const repository = new InMemoryLiteraryWorkRepository([], onoffLiteraryWorkTeasersMock, []);

	afterEach(() => restoreAllMocks());

	it('devuelve el catálogo entero sin filtro', async () => {
		const literaryWorks = await getLiteraryWorkTeasers({}, repository);

		expect(literaryWorks).toHaveLength(onoffLiteraryWorkTeasersMock.length);
	});

	it('devuelve los teasers de las obras del autor filtrado', async () => {
		const literaryWorks = await getLiteraryWorkTeasers({ author: author.slug }, repository);

		expect(literaryWorks.length).toBeGreaterThan(0);
		literaryWorks.forEach(({ authors }) => {
			expect(authors.some(({ slug }) => slug === author.slug)).toBe(true);
		});
	});

	it('devuelve un listado vacío para un autor sin obras, sin convertirlo en error', async () => {
		expect(await getLiteraryWorkTeasers({ author: 'sin-obras' }, repository)).toEqual([]);
	});

	// El caso que impide "simplificar" la tolerancia sin ver lo que saca: una obra que el CMS dejó
	// inconsistente no debe llevarse puestas a las demás en un listado.
	it('devuelve las obras sanas y registra la descartada', async () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		const malformed = new MalformedLiteraryWorkError('una-obra-rota', { cause: new Error('sin extracto') });
		const stub = new StubLiteraryWorkRepository({ literaryWorks: [firstTeaser], malformed: [malformed] });

		const literaryWorks = await getLiteraryWorkTeasers({ author: author.slug }, stub);

		expect(literaryWorks).toEqual([firstTeaser]);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('una-obra-rota'), malformed.cause);
	});

	// La política es por obra y no cambia con la cantidad: distinguir "todas rotas" de "algunas rotas"
	// introduciría un umbral que nadie puede nombrar, y el consumidor ya sabe no dibujarse ante lista
	// vacía.
	it('devuelve un listado vacío cuando todas las obras están mal curadas', async () => {
		spyOn(console, 'warn').mockImplementation(() => undefined);
		const stub = new StubLiteraryWorkRepository({
			literaryWorks: [],
			malformed: [new MalformedLiteraryWorkError('una'), new MalformedLiteraryWorkError('otra')],
		});

		expect(await getLiteraryWorkTeasers({ author: author.slug }, stub)).toEqual([]);
	});
});

// El listado del ámbito, canned: el doble en memoria traduce de verdad y nunca produce `malformed`, así
// que la política de descarte y el recorte se ejercitan con un stub.
class StubLiteraryWorkSuggestionsRepository implements LiteraryWorkRepository {
	constructor(private readonly listing: LiteraryWorkSuggestionsListing) {}

	public async fetchBySlug(): Promise<never> {
		throw new Error('No participa de estos casos.');
	}

	public async fetchTeasers(): Promise<never> {
		throw new Error('No participa de estos casos.');
	}

	public async fetchSuggestions(
		_scope: ReadingSuggestionsScope,
		select: (candidates: readonly LiteraryWorkSuggestionCandidate[]) => readonly string[],
		limit: number,
	): Promise<LiteraryWorkSuggestionsListing> {
		const bySlug = new Map<string, LiteraryWorkTeaser[]>();
		for (const literaryWork of this.listing.literaryWorks) {
			const group = bySlug.get(literaryWork.slug);
			if (group) {
				group.push(literaryWork);
			} else {
				bySlug.set(literaryWork.slug, [literaryWork]);
			}
		}
		const candidates = this.listing.literaryWorks.map(({ slug, tags }) => ({ slug, tags }));
		const literaryWorks = select(candidates)
			.map((slug) => bySlug.get(slug)?.shift())
			.filter((literaryWork): literaryWork is LiteraryWorkTeaser => literaryWork !== undefined)
			.slice(0, limit);
		return { title: this.listing.title, literaryWorks, malformed: this.listing.malformed };
	}
}

describe('getReadingSuggestions', () => {
	const [canon] = onoffLiteraryWorkTeasersMock;
	const [author] = canon.authors;
	const [collection] = onoffCollectionsMock;
	const repository = new InMemoryLiteraryWorkRepository([], onoffLiteraryWorkTeasersMock, onoffCollectionsMock);

	// Las fixtures descomponen una obra del canon cambiándole lo único que el criterio mira —slug y
	// tags—, en vez de inventar una obra de prueba: el resto de los campos sigue validado por el corpus.
	function fixture(slug: string, tagSlugs: readonly string[]): LiteraryWorkTeaser {
		return {
			...canon,
			slug: createSlug(slug),
			tags: tagSlugs.map((tagSlug) => ({ title: tagSlug, slug: tagSlug, description: tagSlug })),
		};
	}

	async function rankedSlugsOf(
		candidates: readonly LiteraryWorkTeaser[],
		currentWorkSlug: string,
		limit = 3,
	): Promise<string[]> {
		const stub = new StubLiteraryWorkSuggestionsRepository({
			title: 'Un ámbito',
			literaryWorks: candidates,
			malformed: [],
		});
		const { suggestions } = await getReadingSuggestions(currentWorkSlug, { author: 'un-autor' }, limit, stub);
		return suggestions.map(({ slug }) => slug);
	}

	// El orden dentro de un empate rota, así que lo que se afirma de él es el ciclo: el mismo listado,
	// empezando en otro punto. Un reordenamiento libre —ordenar por otro criterio, o barajar— no lo
	// cumpliría.
	function isRotationOf(listing: readonly string[], candidate: readonly string[]): boolean {
		return listing.some(
			(_, offset) => [...listing.slice(offset), ...listing.slice(0, offset)].join() === candidate.join(),
		);
	}

	afterEach(() => restoreAllMocks());

	it('devuelve las obras del autor, encabezadas por su nombre y sin la que se lee', async () => {
		const { title, suggestions } = await getReadingSuggestions(canon.slug, { author: author.slug }, 3, repository);

		expect(title).toBe(author.name);
		expect(suggestions).toHaveLength(3);
		expect(suggestions.map(({ slug }) => slug)).not.toContain(canon.slug);
	});

	it('devuelve las obras de la colección, encabezadas por su título', async () => {
		const [currentWork] = collection.literaryWorks;

		const { title, suggestions } = await getReadingSuggestions(
			currentWork.slug,
			{ collection: collection.slug },
			3,
			repository,
		);

		expect(title).toBe(collection.title);
		expect(suggestions.length).toBeGreaterThan(0);
		expect(suggestions.map(({ slug }) => slug)).not.toContain(currentWork.slug);
	});

	it('devuelve un listado vacío y sin encabezado para un ámbito sin obras', async () => {
		await expect(getReadingSuggestions(canon.slug, { author: 'sin-obras' }, 3, repository)).resolves.toEqual({
			title: '',
			suggestions: [],
		});
		await expect(getReadingSuggestions(canon.slug, { collection: 'sin-obras' }, 3, repository)).resolves.toEqual({
			title: '',
			suggestions: [],
		});
	});

	it('ordena por tags compartidos, de mayor a menor', async () => {
		const reference = fixture('referencia', ['ensayo', 'teatro']);

		const slugs = await rankedSlugsOf(
			[fixture('un-tag', ['ensayo']), reference, fixture('dos-tags', ['ensayo', 'teatro'])],
			'referencia',
		);

		expect(slugs).toEqual(['dos-tags', 'un-tag']);
	});

	it('cuenta una sola vez un tag repetido', async () => {
		const reference = fixture('referencia', ['ensayo', 'teatro']);

		const slugs = await rankedSlugsOf(
			[fixture('dos-veces', ['ensayo', 'ensayo']), fixture('una-vez', ['ensayo', 'teatro']), reference],
			'referencia',
		);

		expect(slugs).toEqual(['una-vez', 'dos-veces']);
	});

	it('no descarta las obras sin afinidad: completan el listado', async () => {
		const reference = fixture('referencia', ['ensayo']);

		const slugs = await rankedSlugsOf([fixture('una', []), reference, fixture('otra', ['ensayo'])], 'referencia');

		expect(slugs).toEqual(['otra', 'una']);
	});

	it('recorta el listado al límite pedido', async () => {
		const reference = fixture('referencia', ['ensayo']);
		const candidates = [reference, fixture('una', []), fixture('otra', []), fixture('tercera', [])];

		expect(await rankedSlugsOf(candidates, 'referencia', 2)).toHaveLength(2);
	});

	it('devuelve menos sugerencias que el límite cuando el ámbito no alcanza', async () => {
		const reference = fixture('referencia', ['ensayo']);

		expect(await rankedSlugsOf([reference, fixture('unica', ['ensayo'])], 'referencia', 5)).toHaveLength(1);
	});

	it('no devuelve nada cuando el ámbito solo tiene la obra que se lee', async () => {
		const reference = fixture('referencia', ['ensayo']);

		expect(await rankedSlugsOf([reference], 'referencia')).toEqual([]);
	});

	it('no reordena el listado que recibe', async () => {
		const reference = fixture('referencia', ['ensayo']);
		const candidates = [fixture('una', []), reference, fixture('otra', ['ensayo'])];
		const before = [...candidates];

		await rankedSlugsOf(candidates, 'referencia');

		expect(candidates).toEqual(before);
	});

	// A igual afinidad el orden rota: un ámbito prolífico cuyas obras comparten los mismos tags no ofrece
	// siempre las mismas. Cada obra que se lee arranca el empate en su propio punto.
	it('rota el empate según la obra que se lee, de forma estable entre pedidos', async () => {
		const candidates = [fixture('una', []), fixture('otra', []), fixture('tercera', [])];
		const canonicalOrder = ['una', 'otra', 'tercera'];
		const rotations = await Promise.all(
			['el-odio', 'geometria', 'los-peldanos'].map((slug) => rankedSlugsOf(candidates, slug)),
		);

		rotations.forEach((rotation) => expect(isRotationOf(canonicalOrder, rotation)).toBe(true));
		// No se comparan dos slugs puntuales: lo que se afirma es que el empate no es el mismo para todas
		// las obras que se leen, sin depender de que dos hashes concretos difieran.
		expect(new Set(rotations.map((rotation) => rotation.join())).size).toBeGreaterThan(1);
		expect(await rankedSlugsOf(candidates, 'el-odio')).toEqual(rotations[0]);
	});

	// Un contexto de navegación viejo —o de otro ámbito— deja la obra que se lee fuera del listado: no
	// hay afinidad que medir ni nada que descartar, así que todas empatan y la rotación es la que reparte.
	it('rota todo el listado cuando la obra que se lee no está entre las candidatas', async () => {
		const candidates = [fixture('primera', ['ensayo']), fixture('segunda', ['ensayo']), fixture('tercera', ['ensayo'])];

		const slugs = await rankedSlugsOf(candidates, 'no-esta');

		expect(isRotationOf(['primera', 'segunda', 'tercera'], slugs)).toBe(true);
	});

	// El canon: las dos obras que comparten dos tags con la que se lee van primero —en el orden que la
	// rotación decida— y la tercera sale del empate de un solo tag compartido.
	it('ordena el canon por los tags que comparte con la obra que se lee', async () => {
		const slugs = await rankedSlugsOf(onoffLiteraryWorkTeasersMock, canon.slug);

		expect(new Set(slugs.slice(0, 2))).toEqual(new Set(['el-odio', 'las-dos-antorchas']));
		expect(['geometria', 'las-escaleras', 'el-tratado-de-los-placeres']).toContain(slugs[2]);
	});

	it('devuelve las obras sanas y registra la descartada', async () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		const malformed = new MalformedLiteraryWorkError('una-obra-rota', { cause: new Error('sin extracto') });
		const stub = new StubLiteraryWorkSuggestionsRepository({
			title: author.name,
			literaryWorks: [canon],
			malformed: [malformed],
		});

		const { title, suggestions } = await getReadingSuggestions('cualquiera', { author: author.slug }, 3, stub);

		expect(title).toBe(author.name);
		expect(suggestions).toEqual([canon]);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('una-obra-rota'), malformed.cause);
	});

	// La colección existe: su título encabeza el bloque aunque no quede ninguna obra que ofrecer. El
	// bloque no se pinta por la lista vacía, no por un encabezado ausente.
	it('conserva el encabezado de la colección cuando todas sus obras están mal curadas', async () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);
		const malformed = new MalformedLiteraryWorkError('una-obra-rota', { cause: new Error('sin extracto') });
		const stub = new StubLiteraryWorkSuggestionsRepository({
			title: 'Una colección',
			literaryWorks: [],
			malformed: [malformed],
		});

		const { title, suggestions } = await getReadingSuggestions('cualquiera', { collection: 'una-coleccion' }, 3, stub);

		expect(title).toBe('Una colección');
		expect(suggestions).toEqual([]);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('una-obra-rota'), malformed.cause);
	});
});

// Registra si el caso de uso pide la landing: solo necesita lo más leído, y pedirla entera
// arrastraría el conteo por autor destacado que la proyección calcula en caliente.
class SpyContentRepository extends InMemoryContentRepository {
	public landingPageFetches = 0;

	public override async fetchLandingPageContent(slug: string): Promise<LandingPageContent | null> {
		this.landingPageFetches++;
		return super.fetchLandingPageContent(slug);
	}
}

describe('updateMostReadLiteraryWorks', () => {
	const [first, second] = onoffLiteraryWorkNavigationTeasersWithAuthorsMock;
	const rotatingContent = {
		_id: 'rotatingContent',
		name: 'Lo más leído',
		mostRead: [first, second],
	};

	function popularPages(...urls: string[]) {
		return [
			{
				metricName: 'PopularPages' as const,
				information: urls.map((url) => ({ url, visitsCount: '1' })),
			},
		];
	}

	// El caso de uso ya no cruza dos repositories: le pasa los slugs al que escribe, y ése los resuelve
	// contra el catálogo que conoce.
	function repositories() {
		return new InMemoryContentRepository({
			rotatingContent,
			literaryWorks: onoffLiteraryWorkNavigationTeasersWithAuthorsMock,
		});
	}

	beforeEach(() => clearAllMocks());

	// El filtro de prefijo es exacto: una URL bajo el prefijo retirado no aporta al ranking, venga de
	// donde venga, porque rankearía una ruta que el servidor ya redirige.
	it('ignores popular pages from the withdrawn story route', async () => {
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(
				`${environment.basePath}/story/${first.slug}`,
				`${environment.basePath}/literary-work/${second.slug}`,
			),
		);
		const content = repositories();

		const result = await literaryWorkService.updateMostReadLiteraryWorks(content);

		expect(result.mostRead.map(({ slug }) => slug)).toEqual([second.slug]);
	});

	it('ignores popular pages outside the reading routes', async () => {
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(`${environment.basePath}/about`, `${environment.basePath}/literary-work/${first.slug}`),
		);
		const content = repositories();

		const result = await literaryWorkService.updateMostReadLiteraryWorks(content);

		expect(result.mostRead.map(({ slug }) => slug)).toEqual([first.slug]);
	});

	// El prefijo de la ruta nueva es el del catálogo más una barra, así que el catálogo en sí no
	// entra: sin este caso, una visita a `/literary-work` aportaría un slug vacío al ranking.
	it('ignores the catalog itself, which shares the prefix without a slug', async () => {
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(`${environment.basePath}/literary-work`, `${environment.basePath}/literary-work/${first.slug}`),
		);
		const content = repositories();

		const result = await literaryWorkService.updateMostReadLiteraryWorks(content);

		expect(result.mostRead.map(({ slug }) => slug)).toEqual([first.slug]);
	});

	it('throws a typed error when the metric is absent', async () => {
		(fetchClarityData as Mock).mockResolvedValue([]);
		const content = repositories();

		await expect(literaryWorkService.updateMostReadLiteraryWorks(content)).rejects.toThrow(ClarityResponseError);
	});

	it('lets a provider failure through without writing the ranking', async () => {
		(fetchClarityData as Mock).mockRejectedValue(new ClarityRequestError(401));
		const content = repositories();

		await expect(literaryWorkService.updateMostReadLiteraryWorks(content)).rejects.toThrow(ClarityRequestError);
		expect((await content.fetchRotatingContent())?.mostRead).toEqual(rotatingContent.mostRead);
	});

	// La lista es un ranking: el orden lo define Clarity, y la query que resuelve los identificadores
	// filtra por pertenencia y devuelve en orden de documento. Se pide al revés del orden de
	// almacenamiento justamente para que una implementación que no reordene no pueda pasar.
	it('preserves the ranking order of the metrics, not the storage order', async () => {
		const ranked = [...onoffLiteraryWorkNavigationTeasersWithAuthorsMock].reverse().slice(0, 3);
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(...ranked.map(({ slug }) => `${environment.basePath}/literary-work/${slug}`)),
		);
		const content = repositories();

		const result = await literaryWorkService.updateMostReadLiteraryWorks(content);

		expect(result.mostRead.map(({ slug }) => slug)).toEqual(ranked.map(({ slug }) => slug));
	});

	// Clarity reporta la URL visitada, no el slug. Sin normalizar, la obra con tráfico de campaña —la
	// que más se leyó— es justamente la que desaparece del ranking.
	it.each([
		['querystring', (url: string) => `${url}?utm_source=newsletter`],
		['ancla', (url: string) => `${url}#final`],
		['barra final', (url: string) => `${url}/`],
	])('deriva el slug de una URL con %s', async (_label, decorate) => {
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(decorate(`${environment.basePath}/literary-work/${first.slug}`)),
		);
		const content = repositories();

		const result = await literaryWorkService.updateMostReadLiteraryWorks(content);

		expect(result.mostRead.map(({ slug }) => slug)).toEqual([first.slug]);
	});

	it('deduplicates a work reached through decorated and clean URLs alike', async () => {
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(
				`${environment.basePath}/literary-work/${first.slug}?utm_source=x`,
				`${environment.basePath}/literary-work/${first.slug}`,
			),
		);
		const content = repositories();

		const result = await literaryWorkService.updateMostReadLiteraryWorks(content);

		expect(result.mostRead.map(({ slug }) => slug)).toEqual([first.slug]);
	});

	// Cuántas obras se destacan lo decide la curaduría, no el cron: el caso de uso escribe todo el
	// ranking que las métricas traen.
	it('writes every ranked work, however many the metrics bring', async () => {
		const everyWork = onoffLiteraryWorkNavigationTeasersWithAuthorsMock;
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(...everyWork.map(({ slug }) => `${environment.basePath}/literary-work/${slug}`)),
		);
		const content = repositories();

		const result = await literaryWorkService.updateMostReadLiteraryWorks(content);

		expect(result.mostRead.map(({ slug }) => slug)).toEqual(everyWork.map(({ slug }) => slug));
	});

	it('falla cuando el contenido rotativo no está instalado', async () => {
		(fetchClarityData as Mock).mockResolvedValue(popularPages(`${environment.basePath}/literary-work/${first.slug}`));

		await expect(literaryWorkService.updateMostReadLiteraryWorks(new InMemoryContentRepository())).rejects.toThrow(
			RotatingContentNotFoundError,
		);
	});

	// El cron solo necesita lo más leído: si volviera a pedir la landing entera, pagaría el conteo
	// por autor en caliente para quedarse con una lista que ya tiene su propia query.
	it('serves the ranking without fetching the landing page content', async () => {
		(fetchClarityData as Mock).mockResolvedValue(popularPages(`${environment.basePath}/literary-work/${first.slug}`));
		const content = new SpyContentRepository({
			rotatingContent,
			literaryWorks: onoffLiteraryWorkNavigationTeasersWithAuthorsMock,
		});

		const result = await literaryWorkService.updateMostReadLiteraryWorks(content);

		expect(result.mostRead.map(({ slug }) => slug)).toEqual([first.slug]);
		expect(content.landingPageFetches).toBe(0);
	});
});
