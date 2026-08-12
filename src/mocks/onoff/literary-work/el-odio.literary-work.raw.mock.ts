// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { dramaPsicologicoRawTag, novelaRawTag } from '../../onoff-raw-tags.mock';
import elOdioEditorialNoteMd from './el-odio.editorial-note.md?raw';
import { elOdioEpigraphReference, elOdioEpigraphText, elOdioSectionTitle } from './el-odio.epigraph';
import elOdioMdBody from './el-odio.md?raw';

export const elOdioRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-el-odio',
	slug: 'el-odio',
	title: 'El odio',
	coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-elOdioCover-236x328-png' } },
	editorialNote: elOdioEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1971)',
	publishedAt: '1971-01-01T00:00:00Z',
	totalReadingTime: 6,
	sectionCount: 1,
	tags: [novelaRawTag, dramaPsicologicoRawTag],
	mediaSources: [],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [
		{
			_key: 'section-1',
			title: elOdioSectionTitle,
			epigraphs: [{ text: elOdioEpigraphText, reference: elOdioEpigraphReference }],
			body: elOdioMdBody,
			readingTime: 6,
		},
	],
};
