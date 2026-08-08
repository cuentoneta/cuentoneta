// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { experimentalRawTag, metaficcionRawTag, novelaRawTag } from '../../onoff-raw-tags.mock';
import { palacioSecondSectionReadingTime } from './el-palacio-de-las-nueve-fronteras.multi-section';
import lasDosAntorchasEditorialNoteMd from './las-dos-antorchas.editorial-note.md?raw';
import lasDosAntorchasMdBody from './las-dos-antorchas.md?raw';

export const lasDosAntorchasRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-las-dos-antorchas',
	slug: 'las-dos-antorchas',
	title: 'Las dos antorchas',
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-lasDosAntorchasCover-236x328-png' } },
	editorialNote: lasDosAntorchasEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1987)',
	publishedAt: '1987-01-01T00:00:00Z',
	totalReadingTime: 8,
	sectionCount: palacioSecondSectionReadingTime,
	tags: [novelaRawTag, metaficcionRawTag, experimentalRawTag],
	mediaSources: [],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [{ _key: 'section-1', title: null, epigraphs: [], body: lasDosAntorchasMdBody, readingTime: 8 }],
};
