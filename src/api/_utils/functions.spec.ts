import { mapStoryNavigationTeaser, mapStoryNavigationTeaserWithAuthor, mapStoryTeaser, mapTags } from './functions';
import { elOdioRawTeaser, onoffRawNavTeasersMock } from '../_mocks/onoff-raw-stories.mock';

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

// El input crudo no incluye `tags`: el mapper es la única fuente del campo vacío (consistente con `mapAuthorTeaser`).
describe('mapStoryTeaser (ACL)', () => {
	it('sets tags to [] from the mapper, not from the raw spread', () => {
		const result = mapStoryTeaser([elOdioRawTeaser]);

		expect(result[0].tags).toEqual([]);
	});
});

describe('mapStoryNavigationTeaser (ACL)', () => {
	it('sets tags to [] from the mapper, not from the raw spread', () => {
		const result = mapStoryNavigationTeaser([elOdioRawTeaser]);

		expect(result[0].tags).toEqual([]);
	});
});

describe('mapStoryNavigationTeaserWithAuthor (ACL)', () => {
	it('sets tags to [] from the mapper, not from the raw spread', () => {
		const result = mapStoryNavigationTeaserWithAuthor([onoffRawNavTeasersMock[0]]);

		expect(result[0].tags).toEqual([]);
	});
});
