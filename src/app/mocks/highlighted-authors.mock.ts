import type { HighlightedAuthor } from '@models/landing-page-content.model';
import type { Tag } from '@models/tag.model';
import { authorTeaserMock } from './author.mock';

const genreTags: Tag[] = [
	{ title: 'Surrealismo', slug: 'surrealismo', shortDescription: '', description: [] },
	{ title: 'Literatura Infantil', slug: 'literatura-infantil', shortDescription: '', description: [] },
	{ title: 'Horror Psicológico', slug: 'horror-psicologico', shortDescription: '', description: [] },
	{ title: 'Ficción Especulativa', slug: 'ficcion-especulativa', shortDescription: '', description: [] },
	{ title: 'Crónica', slug: 'cronica', shortDescription: '', description: [] },
	{ title: 'Ciencia Ficción', slug: 'ciencia-ficcion', shortDescription: '', description: [] },
];

const authorsSeed = [
	{ name: 'Clarice Lispector', slug: 'clarice-lispector', country: 'Brasil', storyCount: 27, tagIndexes: [0] },
	{
		name: 'María Elena Walsh',
		slug: 'maria-elena-walsh',
		country: 'Argentina',
		storyCount: 16,
		tagIndexes: [1, 0],
	},
	{
		name: 'Mariana Enríquez',
		slug: 'mariana-enriquez',
		country: 'Argentina',
		storyCount: 21,
		tagIndexes: [2],
	},
	{
		name: 'Jorge Luis Borges',
		slug: 'jorge-luis-borges',
		country: 'Argentina',
		storyCount: 13,
		tagIndexes: [3, 0, 4, 5, 1, 2, 0],
	},
	{
		name: 'Eduardo Galeano',
		slug: 'eduardo-galeano',
		country: 'Uruguay',
		storyCount: 4,
		tagIndexes: [4, 0, 1, 2],
	},
	{
		name: 'Héctor Germán Oesterheld',
		slug: 'hector-german-oesterheld',
		country: 'Argentina',
		storyCount: 7,
		tagIndexes: [5, 3, 0],
	},
] as const;

export const highlightedAuthorsMock: HighlightedAuthor[] = authorsSeed.map((seed, index) => ({
	author: {
		...authorTeaserMock,
		_id: `highlighted-author-${index + 1}`,
		slug: seed.slug,
		name: seed.name,
		nationality: {
			...authorTeaserMock.nationality,
			country: seed.country,
		},
	},
	tags: seed.tagIndexes.map((tagIndex) => genreTags[tagIndex]),
	storyCount: seed.storyCount,
}));
