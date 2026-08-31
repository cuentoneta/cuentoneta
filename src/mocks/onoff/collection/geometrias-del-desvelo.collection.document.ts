import { onoffImageAssets } from '../../onoff-image-assets.mock';
import type { Collection } from '@sanity-types';
import {
	geometriasDelDesveloSpaceDescription,
	geometriasDelDesveloSpotifyDescription,
	geometriasDelDesveloYoutubeDescription,
} from '../media/geometrias-del-desvelo.media';
import geometriasDelDesveloCollectionMd from './geometrias-del-desvelo.collection.md?raw';

export const geometriasDelDesveloCollectionDocument: Collection = {
	_id: 'onoff-collection-geometrias-del-desvelo',
	_createdAt: '1974-06-12T00:00:00Z',
	_updatedAt: '1974-06-12T00:00:00Z',
	_rev: 'rev-onoff-collection-geometrias-del-desvelo',
	_type: 'collection',
	title: 'Geometrías del desvelo',
	slug: { _type: 'slug', current: 'geometrias-del-desvelo' },
	description: geometriasDelDesveloCollectionMd,
	featuredImage: {
		_type: 'image',
		asset: { _ref: onoffImageAssets.geometriasDelDesveloCover.ref, _type: 'reference' },
	},
	config: { showAuthors: true },
	literaryWorks: [
		{ _key: 'onoff-literary-work-geometria', _type: 'reference', _ref: 'onoff-literary-work-geometria' },
		{ _key: 'onoff-literary-work-los-peldanos', _type: 'reference', _ref: 'onoff-literary-work-los-peldanos' },
		{ _key: 'onoff-literary-work-las-escaleras', _type: 'reference', _ref: 'onoff-literary-work-las-escaleras' },
	],
	tags: [{ _key: 'colaborativa', _type: 'reference', _ref: 'tag-colaborativa' }],
	// Sin `spaceRecording`: es el único tipo cuya proyección dereferencia un asset (`audioFile.asset->url`),
	// y sumarlo obligaría a meter un documento de audio para la colección. La obra `geometria` ya cubre ese
	// caso; acá interesa que la colección tenga medios propios, no repetir la cobertura de tipos.
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
		// El único medio de la colección que la proyección resuelve a un campo derivado: sin él, la rama
		// que lee la url del audio quedaría afirmada solo por el compilador.
		{
			_key: 'geometrias-space',
			_type: 'spaceRecording',
			title: 'Mesa de lectura sobre el insomnio',
			description: geometriasDelDesveloSpaceDescription,
			audioFile: { _type: 'file', asset: { _type: 'reference', _ref: 'file-geometria-space-ogg' } },
			hostName: 'Biblioteca del Méridien',
			hostAvatar: {
				_type: 'image',
				asset: { _type: 'reference', _ref: onoffImageAssets.bibliotecaMeridienAvatar.ref },
			},
			date: '1974-07-03',
			duration: '52:40',
		},
	],
};
