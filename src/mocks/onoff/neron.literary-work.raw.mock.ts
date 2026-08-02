import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { dramaHistoricoRawTag, teatroRawTag, tragediaRawTag } from '../onoff-raw-tags.mock';
import { rawOnoffAuthor } from '../onoff-raw-author.mock';
import neronMdBody from './neron.md?raw';

export const neronRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-neron',
	slug: 'neron',
	title: 'Nerón',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-9642ca580d43168d6965f428e65df5ca6ec34cdc-236x328-png' },
	},
	editorialNote: null,
	badLanguage: false,
	originalPublication: 'Estreno teatral (1988)',
	publishedAt: '1988-01-01T00:00:00Z',
	totalReadingTime: 7,
	sectionCount: 1,
	tags: [teatroRawTag, tragediaRawTag, dramaHistoricoRawTag],
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
