// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { absurdoRawTag, cuentoRawTag, surrealismoRawTag } from '../../onoff-raw-tags.mock';
import { palacioSecondSectionReadingTime } from './el-palacio-de-las-nueve-fronteras.multi-section';
import losPeldanosEditorialNoteMd from './los-peldanos.editorial-note.md?raw';
import losPeldanosMdBody from './los-peldanos.md?raw';

export const losPeldanosRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-los-peldanos',
	slug: 'los-peldanos',
	title: 'Los peldaños',
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-losPeldanosCover-236x328-png' } },
	editorialNote: losPeldanosEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1977)',
	publishedAt: '1977-01-01T00:00:00Z',
	totalReadingTime: 8,
	sectionCount: palacioSecondSectionReadingTime,
	tags: [cuentoRawTag, absurdoRawTag, surrealismoRawTag],
	mediaSources: [],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [{ _key: 'section-1', title: null, epigraphs: [], body: losPeldanosMdBody, readingTime: 8 }],
};
