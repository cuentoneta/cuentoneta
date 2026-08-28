import type { Media } from '@models/media.model';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import { onoffImageAssets } from '../../onoff-image-assets.mock';
import {
	geometriasDelDesveloSpaceDescription,
	geometriasDelDesveloSpotifyDescription,
	geometriasDelDesveloYoutubeDescription,
} from './geometrias-del-desvelo.media';

// Los medios de la colección, distintos de los de sus obras: el corpus necesita que una colección tenga
// los suyos para que el selector por capacidad no quede vacío y el mapeo se ejercite a ese nivel.
export const geometriasDelDesveloMediaMock: Media[] = [
	{
		title: 'La colección leída de corrido',
		type: 'spotifyPodcastEpisode',
		description: markdownToSanitizedHtml(createMarkdown(geometriasDelDesveloSpotifyDescription)),
		data: { url: 'https://open.spotify.com/embed/episode/geometrias-del-desvelo' },
	},
	{
		title: 'Las tres geometrías',
		type: 'youTubeVideo',
		description: markdownToSanitizedHtml(createMarkdown(geometriasDelDesveloYoutubeDescription)),
		data: { videoId: 'geometriasDelDesveloVideoId' },
	},
	{
		title: 'Mesa de lectura sobre el insomnio',
		type: 'spaceRecording',
		description: markdownToSanitizedHtml(createMarkdown(geometriasDelDesveloSpaceDescription)),
		data: {
			url: 'https://cdn.example.org/onoff/geometria-space.ogg',
			duration: '52:40',
			hostName: 'Biblioteca del Méridien',
			hostAvatar: onoffImageAssets.bibliotecaMeridienAvatar.path,
			date: '1974-07-03',
		},
	},
];
