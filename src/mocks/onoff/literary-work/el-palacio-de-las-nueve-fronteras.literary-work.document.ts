import type { LiteraryWork } from '@sanity-types';
import elPalacioDeLasNueveFronterasEditorialNoteMd from './el-palacio-de-las-nueve-fronteras.editorial-note.md?raw';
import {
	palacioNueveFronterasEpigraphReference,
	palacioNueveFronterasEpigraphText,
	palacioNueveFronterasSectionTitle,
} from './el-palacio-de-las-nueve-fronteras.epigraph';
import elPalacioDeLasNueveFronterasMdBody from './el-palacio-de-las-nueve-fronteras.md?raw';

export const elPalacioDeLasNueveFronterasLiteraryWorkDocument: LiteraryWork = {
	_id: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras',
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: 'rev-onoff-literary-work-el-palacio-de-las-nueve-fronteras',
	_type: 'literaryWork',
	title: 'El palacio de las nueve fronteras',
	slug: { _type: 'slug', current: 'el-palacio-de-las-nueve-fronteras' },
	authors: [{ _key: 'author_1', _type: 'reference', _ref: 'author_1' }],
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-3f8774ea01abc54483829d982035a810667240e1-236x328-png' },
	},
	content: [
		{
			_type: 'section',
			_key: 'section-1',
			title: palacioNueveFronterasSectionTitle,
			epigraphs: [
				{
					_type: 'epigraph',
					_key: 'epigraph-0',
					text: palacioNueveFronterasEpigraphText,
					reference: palacioNueveFronterasEpigraphReference,
				},
			],
			body: elPalacioDeLasNueveFronterasMdBody,
			readingTime: 11,
		},
	],
	editorialNote: elPalacioDeLasNueveFronterasEditorialNoteMd,
	totalReadingTime: 11,
	mediaSources: [],
	resources: [],
	tags: [
		{ _key: 'novela', _type: 'reference', _ref: 'tag-novela' },
		{ _key: 'drama-psicologico', _type: 'reference', _ref: 'tag-drama-psicologico' },
		{ _key: 'metaficcion', _type: 'reference', _ref: 'tag-metaficcion' },
	],
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1985)',
	publishedAt: '1985-01-01T00:00:00Z',
};
