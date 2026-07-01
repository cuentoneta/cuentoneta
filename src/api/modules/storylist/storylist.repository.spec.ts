import type { SanityImageSource } from '@sanity/image-url';
import { clearAllMocks, type Mock } from '@test-utils';
import { client } from '../../_helpers/sanity-connector';
import { geometriasDelDesveloRawCollection } from '../../_mocks/onoff/geometrias-del-desvelo.collection.raw.mock';
import { elInventarioDeLasPasionesRawNavCollection } from '../../_mocks/onoff/el-inventario-de-las-pasiones.collection.raw.mock';
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

// Portadas explícitas para los casos de imagery: el corpus crudo tiene featuredImage/coverImage en null
// hasta el follow-up #1681, así que los refs de imagen se inyectan por caso sobre las collections crudas.
const img = (ref: string): SanityImageSource => ({ _type: 'image', asset: { _type: 'reference', _ref: ref } });

describe('storylist.repository', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	describe('fetchStorylistBySlug', () => {
		it('maps a present featuredImage to representative imagery', async () => {
			(client.fetch as Mock).mockResolvedValue({
				...geometriasDelDesveloRawCollection,
				featuredImage: img('geometrias-del-desvelo'),
			});

			const result = await fetchStorylistBySlug('geometrias-del-desvelo');

			expect(result.imagery.kind).toBe('representative');
			if (result.imagery.kind === 'representative') {
				expect(result.imagery.image).toContain('geometrias-del-desvelo');
			}
		});

		it('falls back to sample imagery (story covers) when featuredImage is null', async () => {
			(client.fetch as Mock).mockResolvedValue({
				...geometriasDelDesveloRawCollection,
				storyCoverImages: [img('c1'), img('c2'), img('c3')],
			});

			const result = await fetchStorylistBySlug('geometrias-del-desvelo');

			expect(result.imagery.kind).toBe('sample');
			if (result.imagery.kind === 'sample') {
				expect(result.imagery.images[0]).toContain('c1');
				expect(result.imagery.images[1]).toContain('c2');
				expect(result.imagery.images[2]).toContain('c3');
			}
		});
	});

	describe('fetchStorylistStoriesNavigationTeaserByStorylistSlug', () => {
		const params = { slug: 'inventario-de-las-pasiones', start: 0, end: 10 };

		it('maps a present featuredImage to representative imagery', async () => {
			(client.fetch as Mock).mockResolvedValue({
				...elInventarioDeLasPasionesRawNavCollection,
				featuredImage: img('el-inventario-de-las-pasiones'),
			});

			const result = await fetchStorylistStoriesNavigationTeaserByStorylistSlug(params);

			expect(result.imagery.kind).toBe('representative');
			if (result.imagery.kind === 'representative') {
				expect(result.imagery.image).toContain('el-inventario-de-las-pasiones');
			}
		});

		it('falls back to sample imagery (story covers) when featuredImage is null', async () => {
			(client.fetch as Mock).mockResolvedValue({
				...elInventarioDeLasPasionesRawNavCollection,
				storyCoverImages: [img('c1'), img('c2'), img('c3')],
			});

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
