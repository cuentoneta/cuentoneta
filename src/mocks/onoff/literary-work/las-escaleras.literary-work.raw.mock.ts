// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { absurdoRawTag, alegoriaRawTag, novelaRawTag } from '../../onoff-raw-tags.mock';
import { palacioSecondSectionReadingTime } from './el-palacio-de-las-nueve-fronteras.multi-section';
import lasEscalerasEditorialNoteMd from './las-escaleras.editorial-note.md?raw';
import lasEscalerasMdBody from './las-escaleras.md?raw';

export const lasEscalerasRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-las-escaleras',
	slug: 'las-escaleras',
	title: 'Las escaleras',
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-lasEscalerasCover-236x328-png' } },
	editorialNote: lasEscalerasEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1979)',
	publishedAt: '1979-01-01T00:00:00Z',
	totalReadingTime: 9,
	sectionCount: palacioSecondSectionReadingTime,
	tags: [novelaRawTag, absurdoRawTag, alegoriaRawTag],
	mediaSources: [],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [{ _key: 'section-1', title: null, epigraphs: [], body: lasEscalerasMdBody, readingTime: 9 }],
};
