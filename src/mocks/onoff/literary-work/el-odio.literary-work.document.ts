import { onoffImageAssets } from '../../onoff-image-assets.mock';
import type { LiteraryWork } from '@sanity-types';
import elOdioEditorialNoteMd from './el-odio.editorial-note.md?raw';
import { elOdioEpigraphReference, elOdioEpigraphText, elOdioSectionTitle } from './el-odio.epigraph';
import elOdioMdBody from './el-odio.md?raw';

export const elOdioLiteraryWorkDocument: LiteraryWork = {
	_id: 'onoff-literary-work-el-odio',
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: 'rev-onoff-literary-work-el-odio',
	_type: 'literaryWork',
	title: 'El odio',
	slug: { _type: 'slug', current: 'el-odio' },
	authors: [{ _key: 'author_1', _type: 'reference', _ref: 'author_1' }],
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: onoffImageAssets.elOdioCover.ref },
	},
	content: [
		{
			_type: 'section',
			_key: 'section-1',
			title: elOdioSectionTitle,
			epigraphs: [
				{ _type: 'epigraph', _key: 'epigraph-0', text: elOdioEpigraphText, reference: elOdioEpigraphReference },
			],
			body: elOdioMdBody,
			readingTime: 6,
		},
	],
	editorialNote: elOdioEditorialNoteMd,
	totalReadingTime: 6,
	mediaSources: [],
	resources: [],
	tags: [
		{ _key: 'novela', _type: 'reference', _ref: 'tag-novela' },
		{ _key: 'drama-psicologico', _type: 'reference', _ref: 'tag-drama-psicologico' },
	],
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1971)',
	publishedAt: '1971-01-01T00:00:00Z',
};
