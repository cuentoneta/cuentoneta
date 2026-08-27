import { clearAllMocks, type Mock } from '@test-utils';
import * as storyRepository from './story.repository';
import * as storyService from './story.service';
import type { StoriesByAuthorSlugQueryResult } from '@sanity-types';
import { onoffRawStoriesMock, onoffRawTeasersMock } from '@mocks/onoff-raw-stories.mock';
import { onoffLiteraryWorkNavigationTeasersWithAuthorsMock } from '@mocks/onoff-literary-work-teasers.mock';
import { environment } from '../../_helpers/environment';
import { fetchClarityData } from '../../_helpers/clarity-connector';
import { RotatingContentNotFoundError } from '../content/content.errors';
import { InMemoryContentRepository } from '../content/content.repository.mock';

/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock de módulo del repository y del builder de imágenes; se migra a inyección de dependencias en #1503 */
vi.mock('./story.repository', () => ({
	fetchStoriesByAuthorSlug: vi.fn(),
	fetchStories: vi.fn(),
	fetchStoriesBySlugs: vi.fn(),
	fetchStoryBySlug: vi.fn(),
}));
vi.mock('@sanity/image-url', () => ({
	createImageUrlBuilder: () => ({
		image: (source: unknown) => ({ url: () => `https://cdn.test/${JSON.stringify(source)}` }),
	}),
}));
// Clarity es un servicio externo alcanzado por import de módulo, no por un seam de inyección: no hay
// dónde pasarle un doble sin cambiar el contrato del caso de uso.
vi.mock('../../_helpers/clarity-connector', () => ({ fetchClarityData: vi.fn() }));
/* eslint-enable no-restricted-syntax */

// El teaser base sale de la colección del canon y no de un export por obra: el caso necesita "un teaser
// crudo cualquiera" al que ponerle una portada, no uno puntual.
const [rawTeaser] = onoffRawTeasersMock;

const rawTeaserWithCover: StoriesByAuthorSlugQueryResult[0] = {
	...rawTeaser,
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-abc-100x100-jpg' } },
};

describe('StoryService', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	describe('getStoriesByAuthorSlug — mapeo de coverImage', () => {
		it('should expose coverImage as a string, never the raw Sanity image object', async () => {
			(storyRepository.fetchStoriesByAuthorSlug as Mock).mockResolvedValue([rawTeaserWithCover]);

			const [story] = await storyService.getStoriesByAuthorSlug({ slug: 'francois-onoff', limit: 10, offset: 0 });

			expect(typeof story.coverImage).toBe('string');
			expect(story.coverImage).not.toBeInstanceOf(Object);
		});
	});

	describe('getStoryBySlug — mapeo de coverImage', () => {
		it('should expose coverImage as a URL string built from the raw Sanity image', async () => {
			(storyRepository.fetchStoryBySlug as Mock).mockResolvedValue(onoffRawStoriesMock[0]);

			const story = await storyService.getStoryBySlug('el-odio');

			expect(typeof story.coverImage).toBe('string');
			expect(story.coverImage).not.toBe('');
		});
	});
});

describe('updateMostReadStories', () => {
	const [first, second] = onoffLiteraryWorkNavigationTeasersWithAuthorsMock;
	const rotatingContent = {
		_id: 'rotatingContent',
		name: 'Lo más leído',
		mostRead: [],
		mostReadLiteraryWorks: [first, second],
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

	// Las dos rutas conviven durante la migración y el tráfico está repartido: quedarse con un prefijo
	// vaciaría la lista a medida que los lectores se corren a la otra.
	it('reads popular pages from both the story and the reading routes', async () => {
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(`${environment.basePath}/story/${first.slug}`, `${environment.basePath}/read/${second.slug}`),
		);
		const content = repositories();

		const result = await storyService.updateMostReadStories(content);

		expect(result.mostReadLiteraryWorks.map(({ slug }) => slug)).toEqual([first.slug, second.slug]);
	});

	// La obra migrada conserva el slug de su historia de origen, así que el mismo slug llega por los dos
	// caminos: sin deduplicar, la lista destacaría dos veces la misma obra.
	it('counts a work reached through both routes only once', async () => {
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(`${environment.basePath}/story/${first.slug}`, `${environment.basePath}/read/${first.slug}`),
		);
		const content = repositories();

		const result = await storyService.updateMostReadStories(content);

		expect(result.mostReadLiteraryWorks.map(({ slug }) => slug)).toEqual([first.slug]);
	});

	it('ignores popular pages outside the reading routes', async () => {
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(`${environment.basePath}/about`, `${environment.basePath}/read/${first.slug}`),
		);
		const content = repositories();

		const result = await storyService.updateMostReadStories(content);

		expect(result.mostReadLiteraryWorks.map(({ slug }) => slug)).toEqual([first.slug]);
	});

	it('throws when the metrics service returns no popular pages', async () => {
		(fetchClarityData as Mock).mockResolvedValue([]);
		const content = repositories();

		await expect(storyService.updateMostReadStories(content)).rejects.toThrow('Could not fetch metrics.');
	});

	// La lista es un ranking: el orden lo define Clarity, y la query que resuelve los identificadores
	// filtra por pertenencia y devuelve en orden de documento. Se pide al revés del orden de
	// almacenamiento justamente para que una implementación que no reordene no pueda pasar.
	it('preserves the ranking order of the metrics, not the storage order', async () => {
		const ranked = [...onoffLiteraryWorkNavigationTeasersWithAuthorsMock].reverse().slice(0, 3);
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(...ranked.map(({ slug }) => `${environment.basePath}/read/${slug}`)),
		);
		const content = repositories();

		const result = await storyService.updateMostReadStories(content);

		expect(result.mostReadLiteraryWorks.map(({ slug }) => slug)).toEqual(ranked.map(({ slug }) => slug));
	});

	// Clarity reporta la URL visitada, no el slug. Sin normalizar, la obra con tráfico de campaña —la
	// que más se leyó— es justamente la que desaparece del ranking.
	it.each([
		['querystring', (url: string) => `${url}?utm_source=newsletter`],
		['ancla', (url: string) => `${url}#final`],
		['barra final', (url: string) => `${url}/`],
	])('deriva el slug de una URL con %s', async (_label, decorate) => {
		(fetchClarityData as Mock).mockResolvedValue(popularPages(decorate(`${environment.basePath}/read/${first.slug}`)));
		const content = repositories();

		const result = await storyService.updateMostReadStories(content);

		expect(result.mostReadLiteraryWorks.map(({ slug }) => slug)).toEqual([first.slug]);
	});

	it('deduplicates a work reached through decorated and clean URLs alike', async () => {
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(
				`${environment.basePath}/story/${first.slug}?utm_source=x`,
				`${environment.basePath}/read/${first.slug}`,
			),
		);
		const content = repositories();

		const result = await storyService.updateMostReadStories(content);

		expect(result.mostReadLiteraryWorks.map(({ slug }) => slug)).toEqual([first.slug]);
	});

	// Cuántas obras se destacan lo decide la curaduría, no el cron: el caso de uso escribe todo el
	// ranking que las métricas traen.
	it('writes every ranked work, however many the metrics bring', async () => {
		const everyWork = onoffLiteraryWorkNavigationTeasersWithAuthorsMock;
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(...everyWork.map(({ slug }) => `${environment.basePath}/read/${slug}`)),
		);
		const content = repositories();

		const result = await storyService.updateMostReadStories(content);

		expect(result.mostReadLiteraryWorks.map(({ slug }) => slug)).toEqual(everyWork.map(({ slug }) => slug));
	});

	it('falla cuando el contenido rotativo no está instalado', async () => {
		(fetchClarityData as Mock).mockResolvedValue(popularPages(`${environment.basePath}/read/${first.slug}`));

		await expect(storyService.updateMostReadStories(new InMemoryContentRepository())).rejects.toThrow(
			RotatingContentNotFoundError,
		);
	});
});
