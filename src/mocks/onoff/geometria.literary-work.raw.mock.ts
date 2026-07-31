import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../onoff-raw-author.mock';
import geometriaMdBody from './geometria.md?raw';
import geometriaEditorialNoteMd from './geometria.editorial-note.md?raw';
import { geometriaEpigraphReference, geometriaEpigraphText, geometriaSectionTitle } from './geometria.epigraph';

export const geometriaRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-geometria',
	slug: 'geometria',
	title: 'Geometría',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-9e1eab984fbe94e19101c7aa4fc2e99a88f71736-236x328-png' },
	},
	editorialNote: geometriaEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1974)',
	publishedAt: '1974-01-01T00:00:00Z',
	totalReadingTime: 7,
	sectionCount: 1,
	tags: [],
	mediaSources: [],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [
		{
			_key: 'section-1',
			title: geometriaSectionTitle,
			epigraphs: [{ text: geometriaEpigraphText, reference: geometriaEpigraphReference }],
			body: geometriaMdBody,
			readingTime: 7,
		},
	],
};
