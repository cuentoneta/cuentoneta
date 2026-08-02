import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawNovelaTag, rawAbsurdoTag, rawAlegoriaTag } from '../onoff-tags.mock';
import { rawOnoffAuthor } from '../onoff-raw-author.mock';
import lasEscalerasMdBody from './las-escaleras.md?raw';
import lasEscalerasEditorialNoteMd from './las-escaleras.editorial-note.md?raw';

export const lasEscalerasRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-las-escaleras',
	slug: 'las-escaleras',
	title: 'Las escaleras',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-ad5639283bf3d3e927b5b0eb79ef2ba098b707e8-236x328-png' },
	},
	editorialNote: lasEscalerasEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1979)',
	publishedAt: '1979-01-01T00:00:00Z',
	totalReadingTime: 9,
	sectionCount: 1,
	tags: [rawNovelaTag, rawAbsurdoTag, rawAlegoriaTag],
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
