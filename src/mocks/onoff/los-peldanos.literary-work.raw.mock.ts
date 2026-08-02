import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawCuentoTag, rawAbsurdoTag, rawSurrealismoTag } from '../onoff-tags.mock';
import { rawOnoffAuthor } from '../onoff-raw-author.mock';
import losPeldanosMdBody from './los-peldanos.md?raw';
import losPeldanosEditorialNoteMd from './los-peldanos.editorial-note.md?raw';

export const losPeldanosRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-los-peldanos',
	slug: 'los-peldanos',
	title: 'Los peldaños',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-27fb05f42b38f0ba9ba21aeb566e25abe670b213-236x328-png' },
	},
	editorialNote: losPeldanosEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1977)',
	publishedAt: '1977-01-01T00:00:00Z',
	totalReadingTime: 8,
	sectionCount: 1,
	tags: [rawCuentoTag, rawAbsurdoTag, rawSurrealismoTag],
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
