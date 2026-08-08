// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionBySlugQueryResult } from '@sanity-types';
import {
	absurdoRawTag,
	alegoriaRawTag,
	cuentoRawTag,
	dramaPsicologicoRawTag,
	filosoficoRawTag,
	novelaRawTag,
	surrealismoRawTag,
} from '../../onoff-raw-tags.mock';
import { palacioSecondSectionReadingTime } from '../literary-work/el-palacio-de-las-nueve-fronteras.multi-section';
import { geometriaSectionTitle } from '../literary-work/geometria.epigraph';
import geometriaMdBody from '../literary-work/geometria.md?raw';
import lasEscalerasMdBody from '../literary-work/las-escaleras.md?raw';
import losPeldanosMdBody from '../literary-work/los-peldanos.md?raw';
import {
	geometriaAudioDescription,
	geometriaPdfDescription,
	geometriaSpaceDescription,
	geometriaSpotifyDescription,
	geometriaYoutubeDescription,
} from '../media/geometria.media';
import geometriasDelDesveloCollectionMd from './geometrias-del-desvelo.collection.md?raw';

export const geometriasDelDesveloRawCollection: NonNullable<CollectionBySlugQueryResult> = {
	_id: 'onoff-collection-geometrias-del-desvelo',
	slug: 'geometrias-del-desvelo',
	title: 'Geometrías del desvelo',
	description: geometriasDelDesveloCollectionMd,
	featuredImage: { _type: 'image', asset: { _ref: 'image-geometriasDelDesveloCover-236x328-png', _type: 'reference' } },
	config: { showAuthors: true },
	tags: [],
	mediaSources: [],
	literaryWorks: [
		{
			_id: 'onoff-literary-work-geometria',
			slug: 'geometria',
			title: 'Geometría',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-geometriaCover-236x328-png' } },
			totalReadingTime: 7,
			sectionCount: palacioSecondSectionReadingTime,
			tags: [cuentoRawTag, dramaPsicologicoRawTag, filosoficoRawTag],
			mediaSources: [
				{
					_key: 'geometria-audio',
					_type: 'audioRecording',
					title: 'Lectura de "Geometría" por su autor',
					description: geometriaAudioDescription,
					url: 'https://cdn.example.org/onoff/geometria.ogg',
				},
				{
					_key: 'geometria-space',
					_type: 'spaceRecording',
					title: 'Conversación sobre el insomnio y la medida del tiempo',
					description: geometriaSpaceDescription,
					audioFile: { _type: 'file', asset: { _type: 'reference', _ref: 'file-geometria-space-ogg' } },
					hostName: 'Biblioteca del Méridien',
					hostAvatar: { _type: 'image', asset: { _type: 'reference', _ref: 'image-defaultAvatar-360x360-jpg' } },
					date: '1974-06-12',
					duration: '48:12',
					audioUrl: 'https://cdn.example.org/onoff/geometria-space.ogg',
				},
				{
					_key: 'geometria-spotify',
					_type: 'spotifyPodcastEpisode',
					title: 'Episodio dedicado a "Geometría"',
					description: geometriaSpotifyDescription,
					url: 'https://open.spotify.com/embed/episode/geometria',
				},
				{
					_key: 'geometria-youtube',
					_type: 'youTubeVideo',
					title: 'Video ensayo sobre las coordenadas del desvelo',
					description: geometriaYoutubeDescription,
					videoId: 'geometriaVideoId',
				},
				{
					_key: 'geometria-pdf',
					_type: 'pdfLink',
					title: 'Facsímil de la primera edición',
					description: geometriaPdfDescription,
					url: 'https://cdn.example.org/onoff/geometria.pdf',
				},
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
			teaserSection: [{ _key: 'section-1', title: geometriaSectionTitle, body: geometriaMdBody, readingTime: 7 }],
		},
		{
			_id: 'onoff-literary-work-los-peldanos',
			slug: 'los-peldanos',
			title: 'Los peldaños',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-losPeldanosCover-236x328-png' } },
			totalReadingTime: 8,
			sectionCount: palacioSecondSectionReadingTime,
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
			teaserSection: [{ _key: 'section-1', title: null, body: losPeldanosMdBody, readingTime: 8 }],
		},
		{
			_id: 'onoff-literary-work-las-escaleras',
			slug: 'las-escaleras',
			title: 'Las escaleras',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-lasEscalerasCover-236x328-png' } },
			totalReadingTime: 9,
			sectionCount: palacioSecondSectionReadingTime,
			tags: [novelaRawTag, absurdoRawTag, alegoriaRawTag],
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
			teaserSection: [{ _key: 'section-1', title: null, body: lasEscalerasMdBody, readingTime: 9 }],
		},
	],
};
