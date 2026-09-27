import { clearAllMocks, type Mock, restoreAllMocks, spyOn } from '@test-utils';
import type { LandingPageContent } from '@models/landing-page-content.model';
import { onoffLiteraryWorksMock } from '@mocks/onoff-literary-works.mock';
import {
	onoffLiteraryWorkNavigationTeasersWithAuthorsMock,
	onoffLiteraryWorkTeasersMock,
} from '@mocks/onoff-literary-work-teasers.mock';
import * as literaryWorkService from './literary-work.service';
import { getLiteraryWorkBySlug, getLiteraryWorkTeasers } from './literary-work.service';
import { LiteraryWorkNotFoundError, MalformedLiteraryWorkError } from './literary-work.errors';
import { InMemoryLiteraryWorkRepository } from './literary-work.repository.mock';
import type { LiteraryWorkRepository, LiteraryWorkTeaserListing } from './literary-work.repository';
import { environment } from '../../_helpers/environment';
import { fetchClarityData } from '../../_helpers/clarity-connector';
import { RotatingContentNotFoundError } from '../content/content.errors';
import { InMemoryContentRepository } from '../content/content.repository.mock';

// Clarity es un servicio externo alcanzado por import de módulo, no por un seam de inyección: no hay
// dónde pasarle un doble sin cambiar el contrato del caso de uso.
/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock de módulo de un servicio externo sin punto de inyección */
vi.mock('../../_helpers/clarity-connector', () => ({ fetchClarityData: vi.fn() }));
/* eslint-enable no-restricted-syntax */

describe('getLiteraryWorkBySlug', () => {
	const repository = new InMemoryLiteraryWorkRepository(onoffLiteraryWorksMock);

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
}

describe('getLiteraryWorkTeasers', () => {
	const [firstTeaser] = onoffLiteraryWorkTeasersMock;
	const [author] = firstTeaser.authors;
	const repository = new InMemoryLiteraryWorkRepository([], onoffLiteraryWorkTeasersMock);

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

	it('throws when the metrics service returns no popular pages', async () => {
		(fetchClarityData as Mock).mockResolvedValue([]);
		const content = repositories();

		await expect(literaryWorkService.updateMostReadLiteraryWorks(content)).rejects.toThrow('Could not fetch metrics.');
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
