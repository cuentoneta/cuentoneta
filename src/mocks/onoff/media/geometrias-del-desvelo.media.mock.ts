import type { Media } from '@models/media.model';
import { createMarkdown } from '@models/markdown.model';
import { markdownToSanitizedHtml } from '@utils/markdown-pipeline.utils';
import {
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
];
