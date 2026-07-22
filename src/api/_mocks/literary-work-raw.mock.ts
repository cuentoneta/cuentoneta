import type { LiteraryWorkBySlugQueryResult } from '../sanity/types';
import { rawOnoffAuthor } from './onoff-raw-author.mock';

// Obra de dos secciones: ejercita la proyección ?section=N y la derivación de position/sectionCount.
export const rawLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	_id: 'literaryWork_1',
	slug: 'la-vigilia-de-onoff',
	title: 'La vigilia de Onoff',
	coverImage: {
		_type: 'image',
		asset: { _type: 'reference', _ref: 'image-a1b2c3d4e5f60718293a4b5c6d7e8f9012345678-1200x630-jpg' },
	},
	badLanguage: false,
	originalPublication: 'Cuadernos del Loira, 1987',
	publishedAt: '2026-07-01T12:00:00Z',
	readingTimeOverride: null,
	tags: [],
	mediaSources: [],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [
		{
			chapterTitle: 'La espera',
			epigraphs: [
				{
					text: '_El insomnio es una lucidez que nadie pidió._',
					reference: '**Anónimo**, refranero apócrifo',
				},
			],
			body: 'François esperaba el amanecer con **una taza fría** entre las manos.\n\n![La ventana](https://cdn.sanity.io/images/s4dbqkc5/production/vista-800x600.jpg)\n\nAfuera, la ciudad seguía sin enterarse de nada.',
		},
		{
			chapterTitle: null,
			epigraphs: [],
			body: 'La segunda noche fue más corta, apenas un paréntesis de _sombras_ y relojes.',
		},
	],
};

export const rawAnonymousLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	...rawLiteraryWork,
	_id: 'literaryWork_2',
	slug: 'cantar-anonimo',
	title: 'Cantar anónimo',
	coverImage: null,
	readingTimeOverride: 40,
	authors: [{ ...rawOnoffAuthor, _id: 'author_anonimo', slug: 'anonimo', name: 'Anónimo' }],
	content: [
		{
			chapterTitle: null,
			epigraphs: [],
			body: 'Nadie firma estas líneas: la voz que las recita vive en otra parte.',
		},
	],
};
