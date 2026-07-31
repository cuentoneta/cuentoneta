import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../onoff-raw-author.mock';
import palacioNueveFronterasMdBody from './el-palacio-de-las-nueve-fronteras.md?raw';
import elPalacioDeLasNueveFronterasEditorialNoteMd from './el-palacio-de-las-nueve-fronteras.editorial-note.md?raw';
import {
	palacioNueveFronterasEpigraphReference,
	palacioNueveFronterasEpigraphText,
	palacioNueveFronterasSectionTitle,
} from './el-palacio-de-las-nueve-fronteras.epigraph';

export const palacioNueveFronterasRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras',
	slug: 'el-palacio-de-las-nueve-fronteras',
	title: 'El palacio de las nueve fronteras',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-3f8774ea01abc54483829d982035a810667240e1-236x328-png' },
	},
	editorialNote: elPalacioDeLasNueveFronterasEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1985)',
	publishedAt: '1985-01-01T00:00:00Z',
	totalReadingTime: 11,
	sectionCount: 1,
	tags: [],
	mediaSources: [],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [
		{
			_key: 'section-1',
			title: palacioNueveFronterasSectionTitle,
			epigraphs: [{ text: palacioNueveFronterasEpigraphText, reference: palacioNueveFronterasEpigraphReference }],
			body: palacioNueveFronterasMdBody,
			readingTime: 11,
		},
	],
};
