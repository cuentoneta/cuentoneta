import type { SanityImageSource } from '@sanity/image-url';
import { mapImagery } from './storylist-imagery.functions';
import { clearAllMocks } from '@test-utils';

/* eslint-disable no-restricted-syntax -- vi.mock: builder de imágenes de Sanity para que urlFor sea determinista en test; se migra a DI en #1503 */
vi.mock('@sanity/image-url', () => ({
	createImageUrlBuilder: () => ({
		image: (source: unknown) => ({ url: () => `https://cdn.test/${JSON.stringify(source)}` }),
	}),
}));
/* eslint-enable no-restricted-syntax */

const img = (ref: string): SanityImageSource => ({ _type: 'image', asset: { _type: 'reference', _ref: ref } });

describe('mapImagery (ACL)', () => {
	beforeEach(() => {
		clearAllMocks();
	});

	it('returns representative imagery from the featuredImage', () => {
		const result = mapImagery({ featuredImage: img('feat'), storyCoverImages: [img('s1')] });

		expect(result.kind).toBe('representative');
		if (result.kind === 'representative') {
			expect(result.image).toContain('feat');
		}
	});

	it('takes the first 3 covers in order when there is no featuredImage', () => {
		const result = mapImagery({
			featuredImage: null,
			storyCoverImages: [img('a'), img('b'), img('c'), img('d'), img('e')],
		});

		expect(result.kind).toBe('sample');
		if (result.kind === 'sample') {
			expect(result.images).toHaveLength(3);
			expect(result.images[0]).toContain('a');
			expect(result.images[1]).toContain('b');
			expect(result.images[2]).toContain('c');
		}
	});

	it('pads the sample tuple with empty strings when there are fewer than 3 covers', () => {
		const result = mapImagery({ featuredImage: null, storyCoverImages: [img('only')] });

		expect(result.kind).toBe('sample');
		if (result.kind === 'sample') {
			expect(result.images).toHaveLength(3);
			expect(result.images.filter(Boolean)).toHaveLength(1);
		}
	});

	it('produces an all-empty tuple when there are no covers', () => {
		expect(mapImagery({ featuredImage: null, storyCoverImages: [] })).toEqual({
			kind: 'sample',
			images: ['', '', ''],
		});
	});
});
