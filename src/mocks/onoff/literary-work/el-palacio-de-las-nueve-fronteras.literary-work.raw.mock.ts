// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { dramaPsicologicoRawTag, metaficcionRawTag, novelaRawTag } from '../../onoff-raw-tags.mock';
import elPalacioDeLasNueveFronterasEditorialNoteMd from './el-palacio-de-las-nueve-fronteras.editorial-note.md?raw';
import {
	palacioNueveFronterasEpigraphReference,
	palacioNueveFronterasEpigraphText,
	palacioNueveFronterasSectionTitle,
} from './el-palacio-de-las-nueve-fronteras.epigraph';
import elPalacioDeLasNueveFronterasMdBody from './el-palacio-de-las-nueve-fronteras.md?raw';

export const palacioNueveFronterasRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras',
	slug: 'el-palacio-de-las-nueve-fronteras',
	title: 'El palacio de las nueve fronteras',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-elPalacioDeLasNueveFronterasCover-236x328-png' },
	},
	editorialNote: elPalacioDeLasNueveFronterasEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1985)',
	publishedAt: '1985-01-01T00:00:00Z',
	totalReadingTime: 11,
	sectionCount: 1,
	tags: [novelaRawTag, dramaPsicologicoRawTag, metaficcionRawTag],
	mediaSources: [],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [
		{
			_key: 'section-1',
			title: palacioNueveFronterasSectionTitle,
			epigraphs: [{ text: palacioNueveFronterasEpigraphText, reference: palacioNueveFronterasEpigraphReference }],
			body: elPalacioDeLasNueveFronterasMdBody,
			readingTime: 11,
		},
	],
};
