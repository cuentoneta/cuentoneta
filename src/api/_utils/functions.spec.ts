import { mapTags } from './functions';

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
