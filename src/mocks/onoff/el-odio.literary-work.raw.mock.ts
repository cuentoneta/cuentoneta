import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawNovelaTag, rawDramaPsicologicoTag } from '../onoff-tags.mock';
import { rawOnoffAuthor } from '../onoff-raw-author.mock';
import elOdioMdBody from './el-odio.md?raw';
import elOdioEditorialNoteMd from './el-odio.editorial-note.md?raw';
import { elOdioEpigraphReference, elOdioEpigraphText, elOdioSectionTitle } from './el-odio.epigraph';

export const elOdioRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-el-odio',
	slug: 'el-odio',
	title: 'El odio',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-83588a6210ea3de0cee7f493f3d41140427958bf-236x328-png' },
	},
	editorialNote: elOdioEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1971)',
	publishedAt: '1971-01-01T00:00:00Z',
	totalReadingTime: 6,
	sectionCount: 1,
	tags: [rawNovelaTag, rawDramaPsicologicoTag],
	mediaSources: [],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [
		{
			_key: 'section-1',
			title: elOdioSectionTitle,
			epigraphs: [{ text: elOdioEpigraphText, reference: elOdioEpigraphReference }],
			body: elOdioMdBody,
			readingTime: 6,
		},
	],
};
