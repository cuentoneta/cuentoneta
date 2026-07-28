import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../onoff-raw-author.mock';
import losPeldanosMdBody from './los-peldanos.md?raw';

// Contraparte raw (shape crudo de Sanity) del corpus LiteraryWork — mono-sección, prosa plana.
// Espeja la metadata de `losPeldanosLiteraryWorkMock` (./los-peldanos.mock.ts).
export const losPeldanosRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-los-peldanos',
	slug: 'los-peldanos',
	title: 'Los peldaños',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-27fb05f42b38f0ba9ba21aeb566e25abe670b213-236x328-png' },
	},
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1977)',
	publishedAt: '1977-01-01T00:00:00Z',
	totalReadingTime: 8,
	sectionCount: 1,
	tags: [],
	mediaSources: [],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [
		{
			_key: 'section-1',
			title: null,
			epigraphs: [],
			body: losPeldanosMdBody,
			readingTime: 8,
		},
	],
};
