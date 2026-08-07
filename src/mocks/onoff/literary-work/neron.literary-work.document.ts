// Documento tal como Sanity lo guarda. Es fuente escrita a mano: la fixture cruda de esta obra se
// deriva de acá evaluando la query real con `pnpm corpus:generate`.
import type { LiteraryWork } from '@sanity-types';
import neronMdBody from './neron.md?raw';

export const neronLiteraryWorkDocument: LiteraryWork = {
	_id: 'onoff-literary-work-neron',
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: 'rev-onoff-literary-work-neron',
	_type: 'literaryWork',
	title: 'Nerón',
	slug: { _type: 'slug', current: 'neron' },
	authors: [{ _key: 'author_1', _type: 'reference', _ref: 'author_1' }],
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-9642ca580d43168d6965f428e65df5ca6ec34cdc-236x328-png' },
	},
	content: [{ _type: 'section', _key: 'section-1', body: neronMdBody, readingTime: 7 }],
	totalReadingTime: 7,
	mediaSources: [],
	resources: [],
	tags: [
		{ _key: 'teatro', _type: 'reference', _ref: 'tag-teatro' },
		{ _key: 'tragedia', _type: 'reference', _ref: 'tag-tragedia' },
		{ _key: 'drama-historico', _type: 'reference', _ref: 'tag-drama-historico' },
	],
	badLanguage: false,
	originalPublication: 'Estreno teatral (1988)',
	publishedAt: '1988-01-01T00:00:00Z',
};
