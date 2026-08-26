// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { LandingPageContentQueryResult } from '@sanity-types';
import {
	colaborativaRawTag,
	cuentoRawTag,
	dramaHistoricoRawTag,
	dramaPsicologicoRawTag,
	filosoficoRawTag,
	teatroRawTag,
	tragediaRawTag,
} from '../../onoff-raw-tags.mock';
import geometriasDelDesveloCollectionMd from '../collection/geometrias-del-desvelo.collection.md?raw';
import inventarioDeLasPasionesCollectionMd from '../collection/inventario-de-las-pasiones.collection.md?raw';
import {
	geometriasDelDesveloSpotifyDescription,
	geometriasDelDesveloYoutubeDescription,
} from '../media/geometrias-del-desvelo.media';

export const onoffRawLandingPageMock: NonNullable<LandingPageContentQueryResult> = {
	_id: 'onoff-landing-page-1974-24',
	slug: '1974-24',
	config: '1974-24',
	collections: [
		{
			_id: 'onoff-collection-geometrias-del-desvelo',
			slug: 'geometrias-del-desvelo',
			title: 'Geometrías del desvelo',
			description: geometriasDelDesveloCollectionMd,
			featuredImage: {
				_type: 'image',
				asset: { _ref: 'image-geometriasDelDesveloCover-236x328-png', _type: 'reference' },
			},
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
			count: 3,
			literaryWorkCoverImages: [
				{ _type: 'image', asset: { _type: 'reference', _ref: 'image-geometriaCover-236x328-png' } },
				{ _type: 'image', asset: { _type: 'reference', _ref: 'image-losPeldanosCover-236x328-png' } },
				{ _type: 'image', asset: { _type: 'reference', _ref: 'image-lasEscalerasCover-236x328-png' } },
			],
		},
		{
			_id: 'onoff-collection-inventario-de-las-pasiones',
			slug: 'inventario-de-las-pasiones',
			title: 'El inventario de las pasiones',
			description: inventarioDeLasPasionesCollectionMd,
			featuredImage: null,
			config: { showAuthors: false },
			tags: [colaborativaRawTag],
			mediaSources: [],
			count: 3,
			literaryWorkCoverImages: [
				{ _type: 'image', asset: { _type: 'reference', _ref: 'image-elTratadoDeLosPlaceresCover-236x328-png' } },
				{ _type: 'image', asset: { _type: 'reference', _ref: 'image-elOdioCover-236x328-png' } },
				{ _type: 'image', asset: { _type: 'reference', _ref: 'image-lasDosAntorchasCover-236x328-png' } },
			],
		},
	],
	latestLiteraryWorks: [
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
		},
		{
			_id: 'onoff-literary-work-neron',
			slug: 'neron',
			title: 'Nerón',
			coverImage: { _type: 'image', asset: { _type: 'reference', _ref: 'image-neronCover-236x328-png' } },
			totalReadingTime: 7,
			sectionCount: 1,
			tags: [teatroRawTag, tragediaRawTag, dramaHistoricoRawTag],
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
		},
	],
	cards: [],
	campaigns: [
		{
			_id: 'onoff-content-campaign-coleccion-completa-onoff',
			title: 'Diez tapas, una sola obra',
			slug: 'coleccion-completa-onoff',
			url: '../author/francois-onoff',
			contents: {
				xs: {
					image: {
						_type: 'image',
						asset: { _type: 'reference', _ref: 'image-0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b-540x220-png' },
					},
				},
				md: {
					image: {
						_type: 'image',
						asset: { _type: 'reference', _ref: 'image-2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d-1240x360-png' },
					},
				},
			},
		},
		{
			_id: 'onoff-content-campaign-el-palacio-de-las-nueve-fronteras',
			title: 'El palacio de las nueve fronteras',
			slug: 'el-palacio-de-las-nueve-fronteras',
			url: '../story/el-palacio-de-las-nueve-fronteras',
			contents: {
				xs: {
					image: {
						_type: 'image',
						asset: { _type: 'reference', _ref: 'image-1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c-540x220-png' },
					},
				},
				md: {
					image: {
						_type: 'image',
						asset: { _type: 'reference', _ref: 'image-3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e-1240x360-png' },
					},
				},
			},
		},
	],
	latestReads: [],
	highlightedAuthors: [
		{
			author: {
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
				resources: [],
			},
			tags: [cuentoRawTag, dramaPsicologicoRawTag],
			storyCount: 8,
		},
	],
};
