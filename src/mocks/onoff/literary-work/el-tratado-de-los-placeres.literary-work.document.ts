import { onoffImageAssets } from '../../onoff-image-assets.mock';
import type { LiteraryWork } from '@sanity-types';
import elTratadoDeLosPlaceresEditorialNoteMd from './el-tratado-de-los-placeres.editorial-note.md?raw';
import elTratadoDeLosPlaceresMdBody from './el-tratado-de-los-placeres.md?raw';

export const elTratadoDeLosPlaceresLiteraryWorkDocument: LiteraryWork = {
	_id: 'onoff-literary-work-el-tratado-de-los-placeres',
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: 'rev-onoff-literary-work-el-tratado-de-los-placeres',
	_type: 'literaryWork',
	title: 'El tratado de los placeres',
	slug: { _type: 'slug', current: 'el-tratado-de-los-placeres' },
	authors: [{ _key: 'author_1', _type: 'reference', _ref: 'author_1' }],
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: onoffImageAssets.elTratadoDeLosPlaceresCover.ref },
	},
	content: [{ _type: 'section', _key: 'section-1', body: elTratadoDeLosPlaceresMdBody, readingTime: 10 }],
	editorialNote: elTratadoDeLosPlaceresEditorialNoteMd,
	totalReadingTime: 10,
	mediaSources: [],
	resources: [],
	tags: [
		{ _key: 'ensayo', _type: 'reference', _ref: 'tag-ensayo' },
		{ _key: 'filosofico', _type: 'reference', _ref: 'tag-filosofico' },
		{ _key: 'metaficcion', _type: 'reference', _ref: 'tag-metaficcion' },
	],
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1981)',
	publishedAt: '1981-01-01T00:00:00Z',
};
