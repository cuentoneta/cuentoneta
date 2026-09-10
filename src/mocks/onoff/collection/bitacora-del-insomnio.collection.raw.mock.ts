// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionBySlugQueryResult } from '@sanity-types';
import {
	cuentoRawTag,
	dramaPsicologicoRawTag,
	filosoficoRawTag,
	metaficcionRawTag,
	novelaRawTag,
} from '../../onoff-raw-tags.mock';
import { elOdioSectionTitle } from '../literary-work/el-odio.epigraph';
import { palacioNueveFronterasSectionTitle } from '../literary-work/el-palacio-de-las-nueve-fronteras.epigraph';
import { geometriaSectionTitle } from '../literary-work/geometria.epigraph';
import bitacoraDelInsomnioCollectionMd from './bitacora-del-insomnio.collection.md?raw';

export const bitacoraDelInsomnioRawCollection: NonNullable<CollectionBySlugQueryResult> = {
	_id: 'onoff-collection-bitacora-del-insomnio',
	slug: 'bitacora-del-insomnio',
	title: 'Bitácora del insomnio',
	description: bitacoraDelInsomnioCollectionMd,
	featuredImage: null,
	config: { showAuthors: false },
	tags: [],
	mediaSources: [],
	literaryWorks: [
		{
			_id: 'onoff-literary-work-geometria',
			slug: 'geometria',
			title: 'Geometría',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-geometriaCover-236x328-png' } },
			totalReadingTime: 7,
			sectionCount: 1,
			tags: [cuentoRawTag, dramaPsicologicoRawTag, filosoficoRawTag],
			mediaSources: [
				{ _type: 'audioRecording', title: 'Lectura de "Geometría" por su autor' },
				{ _type: 'spaceRecording', title: 'Conversación sobre el insomnio y la medida del tiempo' },
				{ _type: 'spotifyPodcastEpisode', title: 'Episodio dedicado a "Geometría"' },
				{ _type: 'youTubeVideo', title: 'Video ensayo sobre las coordenadas del desvelo' },
				{ _type: 'pdfLink', title: 'Facsímil de la primera edición' },
			],
			authors: [
				{
					_id: 'author_1',
					slug: 'francois-onoff',
					name: 'François Onoff',
					image: { _type: 'image', asset: { _type: 'reference', _ref: 'image-francoisOnoffPortrait-1254x1254-png' } },
					nationality: {
						_id: 'nationality-francia',
						_type: 'nationality',
						_createdAt: '2021-12-28T00:00:00Z',
						_updatedAt: '2021-12-28T00:00:00Z',
						_rev: 'rev-francia',
						country: 'Francia',
						flag: { _type: 'image', asset: { _type: 'reference', _ref: 'image-franceFlag-30x20-png' } },
					},
					bornOn: '1948-01-01',
					bornOnYear: 1948,
					diedOn: '1994-12-31',
					diedOnYear: 1994,
				},
			],
			excerpt: [
				{
					_key: 'section-1',
					title: geometriaSectionTitle,
					body: 'A las tres y media en punto, sin que ningún despertador lo convoque, Shannon abre los ojos. La oscuridad de la habitación tiene siempre el mismo peso, el mismo gramaje exacto, como si la noche hubiera sido recortada con escuadra. No hay sobresalto: hay precisión.',
				},
			],
		},
		{
			_id: 'onoff-literary-work-el-odio',
			slug: 'el-odio',
			title: 'El odio',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-elOdioCover-236x328-png' } },
			totalReadingTime: 6,
			sectionCount: 1,
			tags: [novelaRawTag, dramaPsicologicoRawTag],
			mediaSources: [],
			authors: [
				{
					_id: 'author_1',
					slug: 'francois-onoff',
					name: 'François Onoff',
					image: { _type: 'image', asset: { _type: 'reference', _ref: 'image-francoisOnoffPortrait-1254x1254-png' } },
					nationality: {
						_id: 'nationality-francia',
						_type: 'nationality',
						_createdAt: '2021-12-28T00:00:00Z',
						_updatedAt: '2021-12-28T00:00:00Z',
						_rev: 'rev-francia',
						country: 'Francia',
						flag: { _type: 'image', asset: { _type: 'reference', _ref: 'image-franceFlag-30x20-png' } },
					},
					bornOn: '1948-01-01',
					bornOnYear: 1948,
					diedOn: '1994-12-31',
					diedOnYear: 1994,
				},
			],
			excerpt: [
				{
					_key: 'section-1',
					title: elOdioSectionTitle,
					body: 'No empezó por nada. Eso es lo primero que conviene aclarar. No hubo un agravio, ni una herida, ni una infancia que pudiera invocarse después como excusa. El odio estaba ahí desde antes, igual que el peso del cuerpo o el color de los ojos, una propiedad y no un acontecimiento.',
				},
			],
		},
		{
			_id: 'onoff-literary-work-el-palacio-de-las-nueve-fronteras',
			slug: 'el-palacio-de-las-nueve-fronteras',
			title: 'El palacio de las nueve fronteras',
			coverImage: {
				_type: 'image',
				asset: { _type: 'reference', _ref: 'image-elPalacioDeLasNueveFronterasCover-236x328-png' },
			},
			totalReadingTime: 11,
			sectionCount: 1,
			tags: [novelaRawTag, dramaPsicologicoRawTag, metaficcionRawTag],
			mediaSources: [],
			authors: [
				{
					_id: 'author_1',
					slug: 'francois-onoff',
					name: 'François Onoff',
					image: { _type: 'image', asset: { _type: 'reference', _ref: 'image-francoisOnoffPortrait-1254x1254-png' } },
					nationality: {
						_id: 'nationality-francia',
						_type: 'nationality',
						_createdAt: '2021-12-28T00:00:00Z',
						_updatedAt: '2021-12-28T00:00:00Z',
						_rev: 'rev-francia',
						country: 'Francia',
						flag: { _type: 'image', asset: { _type: 'reference', _ref: 'image-franceFlag-30x20-png' } },
					},
					bornOn: '1948-01-01',
					bornOnYear: 1948,
					diedOn: '1994-12-31',
					diedOnYear: 1994,
				},
			],
			excerpt: [
				{
					_key: 'section-1',
					title: palacioNueveFronterasSectionTitle,
					body: 'La primera frontera no tiene nombre porque el nombre se quedó del otro lado, con los que no cruzaron. Avancé al amanecer, cuando la nieve aún no decidía si caer, y el funcionario que revisó mis papeles no levantó la vista. Escribí entonces la primera línea, que no era mía: era de un hombre que había visto caer una hora antes, en una plaza sin testigos, con un orden tan limpio que parecía ensayado.',
				},
			],
		},
	],
};
