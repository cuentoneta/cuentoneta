import type { LiteraryWorkBySlugQueryResult } from '@sanity-types';
import { rawOnoffAuthor } from '../../onoff-raw-author.mock';
import { cuentoRawTag, dramaPsicologicoRawTag, filosoficoRawTag } from '../../onoff-raw-tags.mock';
import geometriaMdBody from './geometria.md?raw';
import geometriaEditorialNoteMd from './geometria.editorial-note.md?raw';
import { geometriaEpigraphReference, geometriaEpigraphText, geometriaSectionTitle } from './geometria.epigraph';
import { geometriaRawMediaSources } from '../media/geometria.media.raw.mock';

export const geometriaRawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'onoff-literary-work-geometria',
	slug: 'geometria',
	title: 'Geometría',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-9e1eab984fbe94e19101c7aa4fc2e99a88f71736-236x328-png' },
	},
	editorialNote: geometriaEditorialNoteMd,
	badLanguage: false,
	originalPublication: 'Éditions du Méridien (1974)',
	publishedAt: '1974-01-01T00:00:00Z',
	totalReadingTime: 7,
	sectionCount: 1,
	tags: [cuentoRawTag, dramaPsicologicoRawTag, filosoficoRawTag],
	// Espeja los medios de la cara Story del mismo slug: la proyección de obra literaria resuelve
	// `audioUrl` igual que la de Story, así que el fixture es el mismo y su mapeo se ejercita de
	// punta a punta desde el repository.
	mediaSources: geometriaRawMediaSources,
	resources: [],
	authors: [rawOnoffAuthor],
	content: [
		{
			_key: 'section-1',
			title: geometriaSectionTitle,
			epigraphs: [{ text: geometriaEpigraphText, reference: geometriaEpigraphReference }],
			body: geometriaMdBody,
			readingTime: 7,
		},
	],
};
