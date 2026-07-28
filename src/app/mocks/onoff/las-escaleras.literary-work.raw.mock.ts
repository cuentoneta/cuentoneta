import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../onoff-raw-author.mock';
import lasEscalerasMdBody from './las-escaleras.md?raw';

// Contraparte raw (shape crudo de Sanity) del corpus LiteraryWork — mono-sección, prosa plana.
// Espeja la metadata de `lasEscalerasLiteraryWorkMock` (./las-escaleras.mock.ts).
export const lasEscalerasRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-las-escaleras',
	slug: 'las-escaleras',
	title: 'Las escaleras',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-ad5639283bf3d3e927b5b0eb79ef2ba098b707e8-236x328-png' },
	},
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1979)',
	publishedAt: '1979-01-01T00:00:00Z',
	totalReadingTime: 9,
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
			body: lasEscalerasMdBody,
			readingTime: 9,
		},
	],
};
