import type { SanityImageSource } from '@sanity/image-url';
import {
	mapHighlightedAuthors,
	mapStoryNavigationTeaser,
	mapStoryNavigationTeaserWithAuthor,
	mapStoryTeaser,
	mapTags,
	urlFor,
} from './functions';
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

describe('mapHighlightedAuthors (ACL)', () => {
	const rawTag = (title: string, slug: string) => ({
		title,
		slug,
		shortDescription: title,
		description: [] as never[],
		icon: { _type: 'iconPicker' as const, provider: 'mdi', name: 'tag' },
	});

	const rawAuthor = (overrides: { tags?: ReturnType<typeof rawTag>[] } = {}) => ({
		_id: 'author_1',
		slug: 'clarice-lispector',
		name: 'Clarice Lispector',
		image: { _type: 'image' as const },
		nationality: {
			_id: 'nat_1',
			_type: 'nationality' as const,
			_createdAt: '2020-01-01T00:00:00Z',
			_updatedAt: '2020-01-01T00:00:00Z',
			_rev: 'rev',
			country: 'Brasil',
			flag: { _type: 'image' as const },
		},
		biography: [] as never[],
		bornOn: null,
		bornOnYear: null,
		diedOn: null,
		diedOnYear: null,
		resources: [] as never[],
		tags: overrides.tags ?? [],
	});

	it('concatenates additionalTags before author tags', () => {
		const result = mapHighlightedAuthors([
			{
				author: rawAuthor({ tags: [rawTag('Surrealismo', 'surrealismo')] }),
				additionalTags: [rawTag('Cumpleaños', 'cumpleanos')],
				storyCount: 12,
			},
		]);

		expect(result).toHaveLength(1);
		expect(result[0].tags.map((tag) => tag.slug)).toEqual(['cumpleanos', 'surrealismo']);
		expect(result[0].storyCount).toBe(12);
	});

	it('returns empty tags when both sources are empty', () => {
		const result = mapHighlightedAuthors([
			{
				author: rawAuthor({ tags: [] }),
				additionalTags: [],
				storyCount: 0,
			},
		]);

		expect(result[0].tags).toEqual([]);
		expect(result[0].storyCount).toBe(0);
	});

	it('keeps only additionalTags when the author has none', () => {
		const result = mapHighlightedAuthors([
			{
				author: rawAuthor({ tags: [] }),
				additionalTags: [rawTag('Cumpleaños', 'cumpleanos')],
				storyCount: 3,
			},
		]);

		expect(result[0].tags.map((tag) => tag.slug)).toEqual(['cumpleanos']);
	});

	it('keeps only author tags when additionalTags are empty', () => {
		const result = mapHighlightedAuthors([
			{
				author: rawAuthor({ tags: [rawTag('Crónica', 'cronica'), rawTag('Ensayo', 'ensayo')] }),
				additionalTags: [],
				storyCount: 7,
			},
		]);

		expect(result[0].tags.map((tag) => tag.slug)).toEqual(['cronica', 'ensayo']);
	});

	it('maps the author through the teaser ACL with empty tags on the teaser', () => {
		const result = mapHighlightedAuthors([
			{
				author: rawAuthor({ tags: [rawTag('Surrealismo', 'surrealismo')] }),
				additionalTags: [],
				storyCount: 5,
			},
		]);

		expect(result[0].author).toMatchObject({
			_id: 'author_1',
			slug: 'clarice-lispector',
			name: 'Clarice Lispector',
			tags: [],
			biography: [],
			resources: [],
		});
		expect(result[0].author.imageUrl).toBeDefined();
	});

	it('returns an empty array when the input is empty or missing', () => {
		expect(mapHighlightedAuthors([])).toEqual([]);
		expect(mapHighlightedAuthors(undefined)).toEqual([]);
		expect(mapHighlightedAuthors(null)).toEqual([]);
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

describe('urlFor (ACL)', () => {
	it('returns an empty string when the source is null or undefined', () => {
		// REASON: urlFor es una función de propósito general invocada desde varios mappers; su tipo
		// SanityImageSource no incluye null/undefined, pero el guard defensivo es real (llamadores
		// externos al tipo pueden pasar un valor vacío) y se ejercita acotado, con el único cast del corpus.
		expect(urlFor(null as unknown as SanityImageSource)).toBe('');
		expect(urlFor(undefined as unknown as SanityImageSource)).toBe('');
	});
});
