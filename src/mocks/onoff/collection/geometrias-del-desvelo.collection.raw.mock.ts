// Este archivo lo escribe `pnpm corpus:generate` evaluando la query GROQ real sobre los documentos del
// corpus. No se edita a mano: cualquier cambio se pierde en la próxima corrida.
import type { CollectionBySlugQueryResult } from '@sanity-types';
import { colaborativaRawTag } from '../../onoff-raw-tags.mock';
import { geometriaRawLiteraryWorkTeaser } from '../literary-work/geometria.literary-work-teaser.raw.mock';
import { lasEscalerasRawLiteraryWorkTeaser } from '../literary-work/las-escaleras.literary-work-teaser.raw.mock';
import { losPeldanosRawLiteraryWorkTeaser } from '../literary-work/los-peldanos.literary-work-teaser.raw.mock';
import {
	geometriasDelDesveloSpaceDescription,
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
		{
			_key: 'geometrias-space',
			_type: 'spaceRecording',
			title: 'Mesa de lectura sobre el insomnio',
			description: geometriasDelDesveloSpaceDescription,
			audioFile: { _type: 'file', asset: { _type: 'reference', _ref: 'file-geometria-space-ogg' } },
			hostName: 'Biblioteca del Méridien',
			hostAvatar: { _type: 'image', asset: { _type: 'reference', _ref: 'image-bibliotecaMeridienAvatar-96x96-png' } },
			date: '1974-07-03',
			duration: '52:40',
			audioUrl: 'https://cdn.example.org/onoff/geometria-space.ogg',
		},
	],
	literaryWorks: [geometriaRawLiteraryWorkTeaser, losPeldanosRawLiteraryWorkTeaser, lasEscalerasRawLiteraryWorkTeaser],
};
