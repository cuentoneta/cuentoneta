// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionBySlugQueryResult } from '@sanity-types';
import {
	absurdoRawTag,
	alegoriaRawTag,
	colaborativaRawTag,
	cuentoRawTag,
	dramaPsicologicoRawTag,
	filosoficoRawTag,
	novelaRawTag,
	surrealismoRawTag,
} from '../../onoff-raw-tags.mock';
import { geometriaSectionTitle } from '../literary-work/geometria.epigraph';
import {
	geometriasDelDesveloSpotifyDescription,
	geometriasDelDesveloYoutubeDescription,
} from '../media/geometrias-del-desvelo.media';
import geometriasDelDesveloCollectionMd from './geometrias-del-desvelo.collection.md?raw';

export const geometriasDelDesveloRawCollection: NonNullable<CollectionBySlugQueryResult> = {
	_id: 'onoff-collection-geometrias-del-desvelo',
	slug: 'geometrias-del-desvelo',
	title: 'Geometrías del desvelo',
	description: geometriasDelDesveloCollectionMd,
	featuredImage: { _type: 'image', asset: { _ref: 'image-geometriasDelDesveloCover-236x328-png', _type: 'reference' } },
	config: { showAuthors: true },
	tags: [colaborativaRawTag],
	mediaSources: [
		{
			_key: 'geometrias-spotify',
			_type: 'spotifyPodcastEpisode',
			title: 'La colección leída de corrido',
			description: geometriasDelDesveloSpotifyDescription,
			url: 'https://open.spotify.com/embed/episode/geometrias-del-desvelo',
		},
		{
			_key: 'geometrias-youtube',
			_type: 'youTubeVideo',
			title: 'Las tres geometrías',
			description: geometriasDelDesveloYoutubeDescription,
			videoId: 'geometriasDelDesveloVideoId',
		},
	],
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
			_id: 'onoff-literary-work-los-peldanos',
			slug: 'los-peldanos',
			title: 'Los peldaños',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-losPeldanosCover-236x328-png' } },
			totalReadingTime: 8,
			sectionCount: 1,
			tags: [cuentoRawTag, absurdoRawTag, surrealismoRawTag],
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
					title: null,
					body: 'La escalera empezaba en ninguna parte y terminaba un poco más arriba de eso. La Sra. Oneiras vivía en alguno de sus peldaños, aunque jamás conseguí determinar en cuál, porque cada vez que creía haberlo hecho el peldaño se desplazaba, o yo me desplazaba, o el día entero cambiaba de número sin avisarle a nadie.',
				},
			],
		},
		{
			_id: 'onoff-literary-work-las-escaleras',
			slug: 'las-escaleras',
			title: 'Las escaleras',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-lasEscalerasCover-236x328-png' } },
			totalReadingTime: 9,
			sectionCount: 1,
			tags: [novelaRawTag, absurdoRawTag, alegoriaRawTag],
			mediaSources: [{ _type: 'audioRecording', title: 'Lectura de "Las escaleras" por su autor' }],
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
					title: null,
					body: 'Dos años después la encontré donde la había dejado, al pie de la escalera, midiendo con el pulgar la distancia exacta que separaba un peldaño del siguiente. La Sra. Oneiras no había envejecido; se había vuelto más precisa, como una cifra que se repite hasta perder su sentido.',
				},
			],
		},
	],
};
