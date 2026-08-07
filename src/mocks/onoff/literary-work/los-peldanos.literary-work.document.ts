// Documento tal como Sanity lo guarda. Es fuente escrita a mano: la fixture cruda de esta obra se
// deriva de acá evaluando la query real con `pnpm corpus:generate`.
import type { LiteraryWork } from '@sanity-types';
import losPeldanosEditorialNoteMd from './los-peldanos.editorial-note.md?raw';
import losPeldanosMdBody from './los-peldanos.md?raw';

export const losPeldanosLiteraryWorkDocument: LiteraryWork = {
	_id: 'onoff-literary-work-los-peldanos',
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: 'rev-onoff-literary-work-los-peldanos',
	_type: 'literaryWork',
	title: 'Los peldaños',
	slug: { _type: 'slug', current: 'los-peldanos' },
	authors: [{ _key: 'author_1', _type: 'reference', _ref: 'author_1' }],
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-27fb05f42b38f0ba9ba21aeb566e25abe670b213-236x328-png' },
	},
	content: [{ _type: 'section', _key: 'section-1', body: losPeldanosMdBody, readingTime: 8 }],
	editorialNote: losPeldanosEditorialNoteMd,
	totalReadingTime: 8,
	mediaSources: [],
	resources: [],
	tags: [
		{ _key: 'cuento', _type: 'reference', _ref: 'tag-cuento' },
		{ _key: 'absurdo', _type: 'reference', _ref: 'tag-absurdo' },
		{ _key: 'surrealismo', _type: 'reference', _ref: 'tag-surrealismo' },
	],
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1977)',
	publishedAt: '1977-01-01T00:00:00Z',
};
