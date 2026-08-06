import type { StoryBySlugQueryResult } from '@sanity-types';
import {
	geometriaAudioDescription,
	geometriaPdfDescription,
	geometriaSpaceDescription,
	geometriaSpotifyDescription,
	geometriaYoutubeDescription,
} from './geometria.media';

// Única obra del corpus con multimedia: cubre los cuatro tipos que el dominio modela más un
// pdfLink, que el schema admite y el ACL descarta — el caso real de tipo no mapeado. Se exporta
// para que la cara de obra literaria del mismo slug espeje exactamente estos medios.
export const geometriaRawMediaSources: NonNullable<StoryBySlugQueryResult>['mediaSources'] = [
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
		// Opcional en el schema: presente acá para que la rama del widget que pinta el avatar del anfitrión
		// se ejercite contra el canon.
		hostAvatar: {
			_type: 'image',
			asset: { _type: 'reference', _ref: 'image-2c4d6e8a0b2d4f6a8c0e2d4f6a8b0c2d4e6f8a0b-96x96-png' },
		},
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
];
