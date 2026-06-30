import { mapStoryNavigationTeaser, mapStoryNavigationTeaserWithAuthor, mapStoryTeaser, mapTags } from './functions';

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

// El input crudo no incluye `tags`: las queries de teaser/navegación dejaron de proyectar `'tags': []`,
// así que el mapper es la única fuente del campo vacío (consistente con `mapAuthorTeaser`).
function rawStoryTeaserItem() {
	return {
		_id: 'story-1',
		slug: 'historia-1',
		title: 'Historia 1',
		badLanguage: false,
		body: [],
		originalPublication: '',
		approximateReadingTime: 2,
		coverImage: null,
		mediaSources: [],
		resources: [],
	};
}

function rawAuthorTeaser() {
	return {
		_id: 'author-1',
		slug: 'autor',
		name: 'Autor',
		image: null,
		nationality: { country: 'AR', flag: null },
		bornOn: null,
		bornOnYear: null,
		diedOn: null,
		diedOnYear: null,
	};
}

describe('mapStoryTeaser (ACL)', () => {
	it('sets tags to [] from the mapper, not from the raw spread', () => {
		const result = mapStoryTeaser([rawStoryTeaserItem()] as unknown as Parameters<typeof mapStoryTeaser>[0]);

		expect(result[0].tags).toEqual([]);
	});
});

describe('mapStoryNavigationTeaser (ACL)', () => {
	it('sets tags to [] from the mapper, not from the raw spread', () => {
		const result = mapStoryNavigationTeaser([rawStoryTeaserItem()] as unknown as Parameters<
			typeof mapStoryNavigationTeaser
		>[0]);

		expect(result[0].tags).toEqual([]);
	});
});

describe('mapStoryNavigationTeaserWithAuthor (ACL)', () => {
	it('sets tags to [] from the mapper, not from the raw spread', () => {
		const result = mapStoryNavigationTeaserWithAuthor([
			{ ...rawStoryTeaserItem(), author: rawAuthorTeaser() },
		] as unknown as Parameters<typeof mapStoryNavigationTeaserWithAuthor>[0]);

		expect(result[0].tags).toEqual([]);
	});
});
