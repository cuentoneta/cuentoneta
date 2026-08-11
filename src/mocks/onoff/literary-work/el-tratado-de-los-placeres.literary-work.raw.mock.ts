// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { ensayoRawTag, filosoficoRawTag, metaficcionRawTag } from '../../onoff-raw-tags.mock';
import elTratadoDeLosPlaceresEditorialNoteMd from './el-tratado-de-los-placeres.editorial-note.md?raw';
import elTratadoDeLosPlaceresMdBody from './el-tratado-de-los-placeres.md?raw';

export const elTratadoDeLosPlaceresRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-el-tratado-de-los-placeres',
	slug: 'el-tratado-de-los-placeres',
	title: 'El tratado de los placeres',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-ff13dcee67b52bc4bbd78c2c7900f466f335badd-236x328-png' },
	},
	editorialNote: elTratadoDeLosPlaceresEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1981)',
	publishedAt: '1981-01-01T00:00:00Z',
	totalReadingTime: 10,
	sectionCount: 1,
	tags: [ensayoRawTag, filosoficoRawTag, metaficcionRawTag],
	mediaSources: [],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [{ _key: 'section-1', title: null, epigraphs: [], body: elTratadoDeLosPlaceresMdBody, readingTime: 10 }],
};
