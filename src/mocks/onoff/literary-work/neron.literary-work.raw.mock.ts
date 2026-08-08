// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { dramaHistoricoRawTag, teatroRawTag, tragediaRawTag } from '../../onoff-raw-tags.mock';
import { palacioSecondSectionReadingTime } from './el-palacio-de-las-nueve-fronteras.multi-section';
import neronMdBody from './neron.md?raw';

export const neronRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-neron',
	slug: 'neron',
	title: 'Nerón',
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-neronCover-236x328-png' } },
	editorialNote: null,
	badLanguage: false,
	originalPublication: 'Estreno teatral (1988)',
	publishedAt: '1988-01-01T00:00:00Z',
	totalReadingTime: 7,
	sectionCount: palacioSecondSectionReadingTime,
	tags: [teatroRawTag, tragediaRawTag, dramaHistoricoRawTag],
	mediaSources: [],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [{ _key: 'section-1', title: null, epigraphs: [], body: neronMdBody, readingTime: 7 }],
};
