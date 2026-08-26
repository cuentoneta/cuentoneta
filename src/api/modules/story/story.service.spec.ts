import { clearAllMocks, type Mock } from '@test-utils';
import * as storyRepository from './story.repository';
import * as storyService from './story.service';
import type { StoriesByAuthorSlugQueryResult } from '@sanity-types';
import { onoffRawStoriesMock } from '@mocks/onoff-raw-stories.mock';
import { elOdioRawTeaser } from '@mocks/onoff-raw-stories.mock';
import {
	onoffLiteraryWorkNavigationTeasersWithAuthorsMock,
	onoffLiteraryWorkTeasersMock,
} from '@mocks/onoff-literary-work-teasers.mock';
import { environment } from '../../_helpers/environment';
import { fetchClarityData } from '../../_helpers/clarity-connector';
import { RotatingContentNotFoundError } from '../content/content.errors';
import { InMemoryContentRepository } from '../content/content.repository.mock';
import { InMemoryLiteraryWorkRepository } from '../literary-work/literary-work.repository.mock';

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

const rawTeaserWithCover: StoriesByAuthorSlugQueryResult[0] = {
	...elOdioRawTeaser,
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

	function repositories() {
		const content = new InMemoryContentRepository({
			rotatingContent,
			literaryWorks: onoffLiteraryWorkNavigationTeasersWithAuthorsMock,
		});
		// El doble de obras resuelve por slug: las obras del canon comparten slug entre su vista de
		// navegación y su agregado, que es exactamente la coincidencia que el cron explota.
		const literaryWork = new InMemoryLiteraryWorkRepository([], onoffLiteraryWorkTeasersMock);
		return { content, literaryWork };
	}

	beforeEach(() => clearAllMocks());

	// Las dos rutas conviven durante la migración y el tráfico está repartido: quedarse con un prefijo
	// vaciaría la lista a medida que los lectores se corren a la otra.
	it('reads popular pages from both the story and the reading routes', async () => {
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(`${environment.basePath}/story/${first.slug}`, `${environment.basePath}/read/${second.slug}`),
		);
		const { content, literaryWork } = repositories();

		const result = await storyService.updateMostReadStories(content, literaryWork);

		expect(result.mostReadLiteraryWorks.map(({ slug }) => slug)).toEqual([first.slug, second.slug]);
	});

	// La obra migrada conserva el slug de su historia de origen, así que el mismo slug llega por los dos
	// caminos: sin deduplicar, la lista destacaría dos veces la misma obra.
	it('counts a work reached through both routes only once', async () => {
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(`${environment.basePath}/story/${first.slug}`, `${environment.basePath}/read/${first.slug}`),
		);
		const { content, literaryWork } = repositories();

		const result = await storyService.updateMostReadStories(content, literaryWork);

		expect(result.mostReadLiteraryWorks.map(({ slug }) => slug)).toEqual([first.slug]);
	});

	it('ignores popular pages outside the reading routes', async () => {
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(`${environment.basePath}/about`, `${environment.basePath}/read/${first.slug}`),
		);
		const { content, literaryWork } = repositories();

		const result = await storyService.updateMostReadStories(content, literaryWork);

		expect(result.mostReadLiteraryWorks.map(({ slug }) => slug)).toEqual([first.slug]);
	});

	it('throws when the metrics service returns no popular pages', async () => {
		(fetchClarityData as Mock).mockResolvedValue([]);
		const { content, literaryWork } = repositories();

		await expect(storyService.updateMostReadStories(content, literaryWork)).rejects.toThrow('Could not fetch metrics.');
	});

	// La lista es un ranking: el orden lo define Clarity, y la query que resuelve los identificadores
	// filtra por pertenencia y devuelve en orden de documento. Se pide al revés del orden de
	// almacenamiento justamente para que una implementación que no reordene no pueda pasar.
	it('preserves the ranking order of the metrics, not the storage order', async () => {
		const ranked = [...onoffLiteraryWorkNavigationTeasersWithAuthorsMock].reverse().slice(0, 3);
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(...ranked.map(({ slug }) => `${environment.basePath}/read/${slug}`)),
		);
		const { content, literaryWork } = repositories();

		const result = await storyService.updateMostReadStories(content, literaryWork);

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
		const { content, literaryWork } = repositories();

		const result = await storyService.updateMostReadStories(content, literaryWork);

		expect(result.mostReadLiteraryWorks.map(({ slug }) => slug)).toEqual([first.slug]);
	});

	it('deduplicates a work reached through decorated and clean URLs alike', async () => {
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(
				`${environment.basePath}/story/${first.slug}?utm_source=x`,
				`${environment.basePath}/read/${first.slug}`,
			),
		);
		const { content, literaryWork } = repositories();

		const result = await storyService.updateMostReadStories(content, literaryWork);

		expect(result.mostReadLiteraryWorks.map(({ slug }) => slug)).toEqual([first.slug]);
	});

	// La landing dereferencia cada referencia escrita con su proyección completa en cada request, así
	// que un ranking sin tope se paga en cada visita a la home.
	it('acota el ranking a lo que la home consume', async () => {
		const everyWork = onoffLiteraryWorkNavigationTeasersWithAuthorsMock;
		(fetchClarityData as Mock).mockResolvedValue(
			popularPages(...everyWork.map(({ slug }) => `${environment.basePath}/read/${slug}`)),
		);
		const { content, literaryWork } = repositories();

		const result = await storyService.updateMostReadStories(content, literaryWork);

		expect(everyWork.length).toBeGreaterThan(6);
		expect(result.mostReadLiteraryWorks).toHaveLength(6);
	});

	it('falla cuando el contenido rotativo no está instalado', async () => {
		(fetchClarityData as Mock).mockResolvedValue(popularPages(`${environment.basePath}/read/${first.slug}`));
		const literaryWork = new InMemoryLiteraryWorkRepository([], onoffLiteraryWorkTeasersMock);

		await expect(storyService.updateMostReadStories(new InMemoryContentRepository(), literaryWork)).rejects.toThrow(
			RotatingContentNotFoundError,
		);
	});
});
