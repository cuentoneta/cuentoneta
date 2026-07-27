import type { LiteraryWorkBySlugQueryResult } from '../sanity/types';
import { rawOnoffAuthor } from './onoff-raw-author.mock';

// Obra de dos secciones, con los reading time ya persistidos (materializados). Ejercita la lectura
// de persistidos y la proyección ?section=N.
// TODO: Migrar los tests y stories que consumen estos mocks al corpus canónico de Onoff.
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
	totalReadingTime: 2,
	sectionCount: 2,
	tags: [],
	mediaSources: [],
	resources: [],
	authors: [rawOnoffAuthor],
	content: [
		{
			_key: 'section-1',
			title: 'La espera',
			epigraphs: [
				{
					text: '_El insomnio es una lucidez que nadie pidió._',
					reference: '**Anónimo**, refranero apócrifo',
				},
			],
			body: 'François esperaba el amanecer con **una taza fría** entre las manos.\n\n![La ventana](https://cdn.sanity.io/images/s4dbqkc5/production/vista-800x600.jpg)\n\nAfuera, la ciudad seguía sin enterarse de nada.',
			readingTime: 1,
		},
		{
			_key: 'section-2',
			title: null,
			epigraphs: [],
			body: 'La segunda noche fue más corta, apenas un paréntesis de _sombras_ y relojes.',
			readingTime: 1,
		},
	],
};

// Obra recitada (sin texto principal): `totalReadingTime` lo setea el editor a mano (duración del
// medio), distinto de la suma de las secciones. Reemplaza al viejo `readingTimeOverride`.
export const rawAnonymousLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	...rawLiteraryWork,
	_id: 'literaryWork_2',
	slug: 'cantar-anonimo',
	title: 'Cantar anónimo',
	coverImage: null,
	totalReadingTime: 40,
	sectionCount: 1,
	authors: [{ ...rawOnoffAuthor, _id: 'author_anonimo', slug: 'anonimo', name: 'Anónimo' }],
	content: [
		{
			_key: 'section-1',
			title: null,
			epigraphs: [],
			body: 'Nadie firma estas líneas: la voz que las recita vive en otra parte.',
			readingTime: 1,
		},
	],
};

// Obra sin reading time persistido (campos ausentes): ejercita la materialización self-healing —
// el backend computa `readingTime` por sección y `totalReadingTime`, y los persiste con setIfMissing.
export const rawUnmaterializedLiteraryWork: NonNullable<LiteraryWorkBySlugQueryResult> = {
	...rawLiteraryWork,
	_id: 'literaryWork_3',
	slug: 'sin-materializar',
	title: 'Obra sin materializar',
	totalReadingTime: null,
	content: rawLiteraryWork.content.map((section) => ({ ...section, readingTime: null })),
};
