import type { SanityImageSource } from '@sanity/image-url';
import { mapImagery } from './storylist-imagery.functions';

/* eslint-disable no-restricted-syntax -- vi.mock: builder de imágenes de Sanity para que urlFor sea determinista en test; se migra a DI en #1503 */
vi.mock('@sanity/image-url', () => ({
	createImageUrlBuilder: () => ({
		image: (source: unknown) => ({ url: () => `https://cdn.test/${JSON.stringify(source)}` }),
	}),
}));
/* eslint-enable no-restricted-syntax */

const img = (ref: string): SanityImageSource => ({ _type: 'image', asset: { _type: 'reference', _ref: ref } });

describe('mapImagery (ACL)', () => {
	it('returns representative imagery from the featuredImage', () => {
		const result = mapImagery({ id: 'col-1', featuredImage: img('feat'), storyCoverImages: [img('s1')] });

		expect(result.kind).toBe('representative');
		if (result.kind === 'representative') {
			expect(result.image).toContain('feat');
		}
	});

	it('returns sample imagery (tuple of 3 non-empty) when there is no featuredImage', () => {
		const result = mapImagery({
			id: 'col-1',
			featuredImage: null,
			storyCoverImages: [img('a'), img('b'), img('c'), img('d'), img('e')],
		});

		expect(result.kind).toBe('sample');
		if (result.kind === 'sample') {
			expect(result.images).toHaveLength(3);
			expect(result.images.every((url) => url !== '')).toBe(true);
		}
	});

	it('pads the sample tuple with empty strings when there are fewer than 3 covers', () => {
		const result = mapImagery({ id: 'col-1', featuredImage: null, storyCoverImages: [img('only')] });

		expect(result.kind).toBe('sample');
		if (result.kind === 'sample') {
			expect(result.images).toHaveLength(3);
			expect(result.images.filter(Boolean)).toHaveLength(1);
		}
	});

	it('produces an all-empty tuple when there are no covers', () => {
		expect(mapImagery({ id: 'col-1', featuredImage: null, storyCoverImages: [] })).toEqual({
			kind: 'sample',
			images: ['', '', ''],
		});
	});

	it('is deterministic: same id and input produce the same selection', () => {
		const covers = [img('a'), img('b'), img('c'), img('d'), img('e')];
		const first = mapImagery({ id: 'col-7', featuredImage: null, storyCoverImages: covers });
		const second = mapImagery({ id: 'col-7', featuredImage: null, storyCoverImages: covers });

		expect(first).toEqual(second);
	});

	it('varies the sample selection across different ids', () => {
		const covers = [img('a'), img('b'), img('c'), img('d'), img('e')];
		const selections = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'].map((id) =>
			JSON.stringify(mapImagery({ id, featuredImage: null, storyCoverImages: covers })),
		);

		expect(new Set(selections).size).toBeGreaterThan(1);
	});
});
