import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../onoff-raw-author.mock';
import lasDosAntorchasMdBody from './las-dos-antorchas.md?raw';
import lasDosAntorchasEditorialNoteMd from './las-dos-antorchas.editorial-note.md?raw';

// Contraparte raw (shape crudo de Sanity) del corpus LiteraryWork — mono-sección, prosa plana.
// Espeja la metadata de `lasDosAntorchasLiteraryWorkMock` (./las-dos-antorchas.mock.ts).
export const lasDosAntorchasRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-las-dos-antorchas',
	slug: 'las-dos-antorchas',
	title: 'Las dos antorchas',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-83ad8511a47107773b70ff339edd8b43c29dcf3e-236x328-png' },
	},
	editorialNote: lasDosAntorchasEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1987)',
	publishedAt: '1987-01-01T00:00:00Z',
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
			body: lasDosAntorchasMdBody,
			readingTime: 8,
		},
	],
};
