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

// Fragmentos de los `_ref` reales del corpus: la collection (featuredImage) y las 3 primeras
// stories de `onoffRawNavTeasersMock` (el-palacio, geometria, los-peldanos), que alimentan `storyCoverImages`.
const geometriasFeaturedRef = '6efd3e53eec8dfab23e1c0109027be9f58a01f8c';
const inventarioFeaturedRef = 'b02ff4ca997e7b8d5244cae72b704f59a4855fb1';
const elPalacioCoverRef = '3f8774ea01abc54483829d982035a810667240e1';
const geometriaCoverRef = '9e1eab984fbe94e19101c7aa4fc2e99a88f71736';
const losPeldanosCoverRef = '27fb05f42b38f0ba9ba21aeb566e25abe670b213';

describe('storylist.repository', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	describe('fetchStorylistBySlug', () => {
		it('maps a present featuredImage to representative imagery', async () => {
			(client.fetch as Mock).mockResolvedValue(geometriasDelDesveloRawCollection);

			const result = await fetchStorylistBySlug('geometrias-del-desvelo');

			expect(result.imagery.kind).toBe('representative');
			if (result.imagery.kind === 'representative') {
				expect(result.imagery.image).toContain(geometriasFeaturedRef);
			}
		});

		it('falls back to sample imagery (story covers) when featuredImage is null', async () => {
			(client.fetch as Mock).mockResolvedValue({ ...geometriasDelDesveloRawCollection, featuredImage: null });

			const result = await fetchStorylistBySlug('geometrias-del-desvelo');

			expect(result.imagery.kind).toBe('sample');
			if (result.imagery.kind === 'sample') {
				expect(result.imagery.images[0]).toContain(elPalacioCoverRef);
				expect(result.imagery.images[1]).toContain(geometriaCoverRef);
				expect(result.imagery.images[2]).toContain(losPeldanosCoverRef);
			}
		});
	});

	describe('fetchStorylistStoriesNavigationTeaserByStorylistSlug', () => {
		const params = { slug: 'inventario-de-las-pasiones', start: 0, end: 10 };

		it('maps a present featuredImage to representative imagery', async () => {
			(client.fetch as Mock).mockResolvedValue(elInventarioDeLasPasionesRawNavCollection);

			const result = await fetchStorylistStoriesNavigationTeaserByStorylistSlug(params);

			expect(result.imagery.kind).toBe('representative');
			if (result.imagery.kind === 'representative') {
				expect(result.imagery.image).toContain(inventarioFeaturedRef);
			}
		});

		it('falls back to sample imagery (story covers) when featuredImage is null', async () => {
			(client.fetch as Mock).mockResolvedValue({ ...elInventarioDeLasPasionesRawNavCollection, featuredImage: null });

			const result = await fetchStorylistStoriesNavigationTeaserByStorylistSlug(params);

			expect(result.imagery.kind).toBe('sample');
			if (result.imagery.kind === 'sample') {
				expect(result.imagery.images[0]).toContain(elPalacioCoverRef);
				expect(result.imagery.images[1]).toContain(geometriaCoverRef);
				expect(result.imagery.images[2]).toContain(losPeldanosCoverRef);
			}
		});
	});
});
