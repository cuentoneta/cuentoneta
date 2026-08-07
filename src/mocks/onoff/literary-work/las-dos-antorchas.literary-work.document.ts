// Documento tal como Sanity lo guarda. Es fuente escrita a mano: la fixture cruda de esta obra se
// deriva de acá evaluando la query real con `pnpm corpus:generate`.
import type { LiteraryWork } from '@sanity-types';
import lasDosAntorchasEditorialNoteMd from './las-dos-antorchas.editorial-note.md?raw';
import lasDosAntorchasMdBody from './las-dos-antorchas.md?raw';

export const lasDosAntorchasLiteraryWorkDocument: LiteraryWork = {
	_id: 'onoff-literary-work-las-dos-antorchas',
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: 'rev-onoff-literary-work-las-dos-antorchas',
	_type: 'literaryWork',
	title: 'Las dos antorchas',
	slug: { _type: 'slug', current: 'las-dos-antorchas' },
	authors: [{ _key: 'author_1', _type: 'reference', _ref: 'author_1' }],
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-83ad8511a47107773b70ff339edd8b43c29dcf3e-236x328-png' },
	},
	content: [{ _type: 'section', _key: 'section-1', body: lasDosAntorchasMdBody, readingTime: 8 }],
	editorialNote: lasDosAntorchasEditorialNoteMd,
	totalReadingTime: 8,
	mediaSources: [],
	resources: [],
	tags: [
		{ _key: 'novela', _type: 'reference', _ref: 'tag-novela' },
		{ _key: 'metaficcion', _type: 'reference', _ref: 'tag-metaficcion' },
		{ _key: 'experimental', _type: 'reference', _ref: 'tag-experimental' },
	],
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1987)',
	publishedAt: '1987-01-01T00:00:00Z',
};
