import type { Media } from '@models/media.model';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import {
	geometriaAudioDescription,
	geometriaSpaceDescription,
	geometriaSpotifyDescription,
	geometriaYoutubeDescription,
} from './geometria.media';
import { onoffImageAssets } from '../../onoff-image-assets.mock';

// Espeja los mediaSources del fixture raw homónimo, sin el pdfLink que el ACL descarta.
export const geometriaMediaMock: Media[] = [
	{
		title: 'Lectura de "Geometría" por su autor',
		type: 'audioRecording',
		description: markdownToSanitizedHtml(createMarkdown(geometriaAudioDescription)),
		data: { url: 'https://cdn.example.org/onoff/geometria.ogg' },
	},
	{
		title: 'Conversación sobre el insomnio y la medida del tiempo',
		type: 'spaceRecording',
		description: markdownToSanitizedHtml(createMarkdown(geometriaSpaceDescription)),
		data: {
			url: 'https://cdn.example.org/onoff/geometria-space.ogg',
			duration: '48:12',
			hostName: 'Biblioteca del Méridien',
			hostAvatar: onoffImageAssets.bibliotecaMeridienAvatar.path,
			date: '1974-06-12',
		},
	},
	{
		title: 'Episodio dedicado a "Geometría"',
		type: 'spotifyPodcastEpisode',
		description: markdownToSanitizedHtml(createMarkdown(geometriaSpotifyDescription)),
		data: { url: 'https://open.spotify.com/embed/episode/geometria' },
	},
	{
		title: 'Video ensayo sobre las coordenadas del desvelo',
		type: 'youTubeVideo',
		description: markdownToSanitizedHtml(createMarkdown(geometriaYoutubeDescription)),
		data: { videoId: 'geometriaVideoId' },
	},
];
