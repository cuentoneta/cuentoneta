import type { SanityImageSource } from '@sanity/image-url';
import { clearAllMocks, type Mock } from '@test-utils';
import { client } from '../../_helpers/sanity-connector';
import { fetchStorylistBySlug, fetchStorylistStoriesNavigationTeaserByStorylistSlug } from './storylist.repository';

/* eslint-disable no-restricted-syntax -- vi.mock/vi.fn: mock del cliente de Sanity y del builder de imágenes para aislar el mapeo del repository; se migra a inyección de dependencias en #1503 */
vi.mock('../../_helpers/sanity-connector', () => ({
	client: { fetch: vi.fn() },
}));
vi.mock('@sanity/image-url', () => ({
	createImageUrlBuilder: () => ({
		image: (source: unknown) => ({ url: () => `https://cdn.test/${JSON.stringify(source)}` }),
	}),
}));
/* eslint-enable no-restricted-syntax */

const img = (ref: string): SanityImageSource => ({ _type: 'image', asset: { _type: 'reference', _ref: ref } });

// Colección cruda mínima: las sub-colecciones van vacías para aislar el mapeo de `imagery`.
const rawStorylist = (overrides: {
	featuredImage: SanityImageSource | null;
	storyCoverImages: SanityImageSource[];
}) => ({
	_id: 'onoff-arquitecturas-laberinto',
	slug: 'arquitecturas-del-laberinto',
	title: 'Arquitecturas del laberinto',
	description: [],
	tags: [],
	stories: [],
	count: 0,
	config: { showAuthors: true },
	tabs: [],
	mediaSources: [],
	...overrides,
});

describe('storylist.repository', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	describe('fetchStorylistBySlug', () => {
		it('maps a present featuredImage to representative imagery', async () => {
			(client.fetch as Mock).mockResolvedValue(
				rawStorylist({ featuredImage: img('feat'), storyCoverImages: [img('c1')] }),
			);

			const result = await fetchStorylistBySlug('arquitecturas-del-laberinto');

			expect(result.imagery.kind).toBe('representative');
			if (result.imagery.kind === 'representative') {
				expect(result.imagery.image).toContain('feat');
			}
		});

		it('falls back to sample imagery (story covers) when featuredImage is null', async () => {
			(client.fetch as Mock).mockResolvedValue(
				rawStorylist({ featuredImage: null, storyCoverImages: [img('c1'), img('c2'), img('c3')] }),
			);

			const result = await fetchStorylistBySlug('arquitecturas-del-laberinto');

			expect(result.imagery.kind).toBe('sample');
			if (result.imagery.kind === 'sample') {
				expect(result.imagery.images[0]).toContain('c1');
				expect(result.imagery.images[1]).toContain('c2');
				expect(result.imagery.images[2]).toContain('c3');
			}
		});
	});

	describe('fetchStorylistStoriesNavigationTeaserByStorylistSlug', () => {
		const params = { slug: 'arquitecturas-del-laberinto', start: 0, end: 10 };

		it('maps a present featuredImage to representative imagery', async () => {
			(client.fetch as Mock).mockResolvedValue(
				rawStorylist({ featuredImage: img('feat'), storyCoverImages: [img('c1')] }),
			);

			const result = await fetchStorylistStoriesNavigationTeaserByStorylistSlug(params);

			expect(result.imagery.kind).toBe('representative');
			if (result.imagery.kind === 'representative') {
				expect(result.imagery.image).toContain('feat');
			}
		});

		it('falls back to sample imagery (story covers) when featuredImage is null', async () => {
			(client.fetch as Mock).mockResolvedValue(
				rawStorylist({ featuredImage: null, storyCoverImages: [img('c1'), img('c2'), img('c3')] }),
			);

			const result = await fetchStorylistStoriesNavigationTeaserByStorylistSlug(params);

			expect(result.imagery.kind).toBe('sample');
			if (result.imagery.kind === 'sample') {
				expect(result.imagery.images[0]).toContain('c1');
				expect(result.imagery.images[1]).toContain('c2');
				expect(result.imagery.images[2]).toContain('c3');
			}
		});
	});
});
