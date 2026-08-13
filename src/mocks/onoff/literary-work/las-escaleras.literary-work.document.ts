import { onoffImageAssets } from '../../onoff-image-assets.mock';
import type { LiteraryWork } from '@sanity-types';
import lasEscalerasEditorialNoteMd from './las-escaleras.editorial-note.md?raw';
import lasEscalerasMdBody from './las-escaleras.md?raw';

export const lasEscalerasLiteraryWorkDocument: LiteraryWork = {
	_id: 'onoff-literary-work-las-escaleras',
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: 'rev-onoff-literary-work-las-escaleras',
	_type: 'literaryWork',
	title: 'Las escaleras',
	slug: { _type: 'slug', current: 'las-escaleras' },
	authors: [{ _key: 'author_1', _type: 'reference', _ref: 'author_1' }],
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: onoffImageAssets.lasEscalerasCover.ref },
	},
	content: [{ _type: 'section', _key: 'section-1', body: lasEscalerasMdBody, readingTime: 9 }],
	editorialNote: lasEscalerasEditorialNoteMd,
	totalReadingTime: 9,
	mediaSources: [],
	resources: [],
	tags: [
		{ _key: 'novela', _type: 'reference', _ref: 'tag-novela' },
		{ _key: 'absurdo', _type: 'reference', _ref: 'tag-absurdo' },
		{ _key: 'alegoria', _type: 'reference', _ref: 'tag-alegoria' },
	],
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1979)',
	publishedAt: '1979-01-01T00:00:00Z',
};
