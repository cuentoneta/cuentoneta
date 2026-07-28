import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../onoff-raw-author.mock';
import neronMdBody from './neron.md?raw';

// Contraparte raw (shape crudo de Sanity) del corpus LiteraryWork — mono-sección, prosa plana.
// Espeja la metadata de `neronLiteraryWorkMock` (./neron.mock.ts).
export const neronRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-neron',
	slug: 'neron',
	title: 'Nerón',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-9642ca580d43168d6965f428e65df5ca6ec34cdc-236x328-png' },
	},
	badLanguage: false,
	originalPublication: 'Estreno teatral (1988)',
	publishedAt: '1988-01-01T00:00:00Z',
	totalReadingTime: 7,
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
			body: neronMdBody,
			readingTime: 7,
		},
	],
};
