import type { SanityImageSource } from '@sanity/image-url';
import { mapImagery, mapTags } from './functions';

/* eslint-disable no-restricted-syntax -- vi.mock: builder de imágenes de Sanity para que urlFor sea determinista en test; se migra a DI en #1503 */
vi.mock('@sanity/image-url', () => ({
	createImageUrlBuilder: () => ({
		image: (source: unknown) => ({ url: () => `https://cdn.test/${JSON.stringify(source)}` }),
	}),
}));
/* eslint-enable no-restricted-syntax */

const img = (ref: string): SanityImageSource => ({ _type: 'image', asset: { _type: 'reference', _ref: ref } });

describe('mapTags (ACL)', () => {
	it('maps a raw Sanity tag to the domain Tag model', () => {
		const result = mapTags([
			{
				title: 'Cumpleaños',
				slug: 'cumpleanos',
				shortDescription: 'Etiqueta de cumpleaños',
				description: [
					{
						_type: 'block',
						_key: 'b1',
						style: 'normal',
						markDefs: [],
						children: [{ _type: 'span', _key: 's1', text: 'Etiqueta de cumpleaños', marks: [] }],
					},
				],
				icon: { _type: 'iconPicker', provider: 'mdi', name: 'cake' },
			},
		]);

		expect(result).toHaveLength(1);
		expect(result[0]).toMatchObject({
			title: 'Cumpleaños',
			slug: 'cumpleanos',
			shortDescription: 'Etiqueta de cumpleaños',
			icon: { provider: 'mdi', name: 'cake' },
		});
		expect(result[0].description).toHaveLength(1);
		expect(result[0].description[0]._type).toBe('block');
	});

	it('normalizes missing icon provider/name to empty strings', () => {
		const result = mapTags([
			{
				title: 'Sin ícono',
				slug: 'sin-icono',
				shortDescription: 'desc',
				description: [],
				icon: { _type: 'iconPicker' },
			},
		]);

		expect(result[0].icon).toEqual({ provider: '', name: '' });
	});

	it('discards non-text-block elements from the description', () => {
		const result = mapTags([
			{
				title: 'Mixto',
				slug: 'mixto',
				shortDescription: 'desc',
				description: [
					{
						_type: 'block',
						_key: 'b1',
						style: 'normal',
						markDefs: [],
						children: [{ _type: 'span', _key: 's1', text: 'texto', marks: [] }],
					},
					{ _type: 'image', _key: 'img1' },
				],
				icon: { _type: 'iconPicker', provider: 'mdi', name: 'tag' },
			},
		]);

		expect(result[0].description).toHaveLength(1);
		expect(result[0].description[0]._type).toBe('block');
	});

	it('returns an empty array when there are no tags', () => {
		expect(mapTags([])).toEqual([]);
	});
});

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
});
