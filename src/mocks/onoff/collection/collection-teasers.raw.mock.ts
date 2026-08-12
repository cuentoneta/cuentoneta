// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionsQueryResult } from '@sanity-types';
import { colaborativaRawTag } from '../../onoff-raw-tags.mock';
import {
	geometriasDelDesveloSpotifyDescription,
	geometriasDelDesveloYoutubeDescription,
} from '../media/geometrias-del-desvelo.media';
import geometriasDelDesveloCollectionMd from './geometrias-del-desvelo.collection.md?raw';
import inventarioDeLasPasionesCollectionMd from './inventario-de-las-pasiones.collection.md?raw';

export const onoffRawCollectionTeasersMock: CollectionsQueryResult = [
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
			{
				_type: 'image',
				asset: { _type: 'reference', _ref: 'image-ff13dcee67b52bc4bbd78c2c7900f466f335badd-236x328-png' },
			},
			{
				_type: 'image',
				asset: { _type: 'reference', _ref: 'image-83588a6210ea3de0cee7f493f3d41140427958bf-236x328-png' },
			},
			{
				_type: 'image',
				asset: { _type: 'reference', _ref: 'image-83ad8511a47107773b70ff339edd8b43c29dcf3e-236x328-png' },
			},
		],
	},
	{
		_id: 'onoff-collection-geometrias-del-desvelo',
		slug: 'geometrias-del-desvelo',
		title: 'Geometrías del desvelo',
		description: geometriasDelDesveloCollectionMd,
		featuredImage: {
			_type: 'image',
			asset: { _ref: 'image-6efd3e53eec8dfab23e1c0109027be9f58a01f8c-1200x630-png', _type: 'reference' },
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
			{
				_type: 'image',
				asset: { _type: 'reference', _ref: 'image-9e1eab984fbe94e19101c7aa4fc2e99a88f71736-236x328-png' },
			},
			{
				_type: 'image',
				asset: { _type: 'reference', _ref: 'image-27fb05f42b38f0ba9ba21aeb566e25abe670b213-236x328-png' },
			},
			{
				_type: 'image',
				asset: { _type: 'reference', _ref: 'image-ad5639283bf3d3e927b5b0eb79ef2ba098b707e8-236x328-png' },
			},
		],
	},
];
