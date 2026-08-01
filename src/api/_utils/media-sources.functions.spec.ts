import { spyOn } from '@test-utils';
import { mapMediaSources } from './media-sources.functions';
import { onoffRawStoriesWithMediaSources, onoffRawTeasersWithMediaSources } from '@mocks/onoff-raw-stories.mock';
import type { AudioRecording, SpaceRecording, SpotifyPodcastEpisode, YouTubeVideo } from '@models/media.model';

const [rawStory] = onoffRawStoriesWithMediaSources;
const [rawTeaser] = onoffRawTeasersWithMediaSources;

function rawSourceOfType<T extends (typeof rawStory.mediaSources)[number]['_type']>(type: T) {
	const source = rawStory.mediaSources.find((mediaSource) => mediaSource._type === type);
	if (source === undefined) {
		throw new Error(`El fixture no trae un mediaSource de tipo "${type}"`);
	}
	return source as Extract<(typeof rawStory.mediaSources)[number], { _type: T }>;
}

describe('mapMediaSources', () => {
	it('mapea el audio recording con su url', () => {
		const [audioRecording] = mapMediaSources(rawStory.mediaSources).filter(
			(media) => media.type === 'audioRecording',
		) as AudioRecording[];
		const source = rawSourceOfType('audioRecording');

		expect(audioRecording.title).toBe(source.title);
		expect(audioRecording.data.url).toBe(source.url);
	});

	it('mapea el space recording resolviendo audioUrl y su metadata', () => {
		const [spaceRecording] = mapMediaSources(rawStory.mediaSources).filter(
			(media) => media.type === 'spaceRecording',
		) as SpaceRecording[];

		expect(spaceRecording.data.url).toBe('https://cdn.example.org/onoff/geometria-space.ogg');
		expect(spaceRecording.data.duration).toBe('48:12');
		expect(spaceRecording.data.hostName).toBe('Biblioteca del Méridien');
	});

	it('mapea el episodio de podcast y el video con su dato propio', () => {
		const mapped = mapMediaSources(rawStory.mediaSources);
		const [podcast] = mapped.filter((media) => media.type === 'spotifyPodcastEpisode') as SpotifyPodcastEpisode[];
		const [video] = mapped.filter((media) => media.type === 'youTubeVideo') as YouTubeVideo[];

		expect(podcast.data.url).toContain('open.spotify.com');
		expect(video.data.videoId).toBe('geometriaVideoId');
	});

	// El fixture lleva un pdfLink: un `_type` que el schema admite y el dominio no modela.
	it('descarta el tipo que el dominio no modela', () => {
		const mapped = mapMediaSources(rawStory.mediaSources);

		expect(rawSourceOfType('pdfLink')).toBeTruthy();
		expect(mapped.map((media) => media.type)).toEqual([
			'audioRecording',
			'spaceRecording',
			'spotifyPodcastEpisode',
			'youTubeVideo',
		]);
	});
});

describe('mapMediaSources sobre la proyección de teaser', () => {
	it('mapea los mismos tipos que la proyección completa', () => {
		const mapped = mapMediaSources(rawTeaser.mediaSources);

		expect(mapped.map((media) => media.type)).toEqual([
			'audioRecording',
			'spaceRecording',
			'spotifyPodcastEpisode',
			'youTubeVideo',
		]);
	});

	// La proyección de teaser no resuelve audioUrl, pero sí trae el resto de la metadata: el space
	// recording del teaser es una SpaceRecording válida con la url en null, no un objeto vacío.
	it('produce un space recording con su metadata y la url en null', () => {
		const [spaceRecording] = mapMediaSources(rawTeaser.mediaSources).filter(
			(media) => media.type === 'spaceRecording',
		) as SpaceRecording[];

		expect(spaceRecording.data.url).toBeNull();
		expect(spaceRecording.data.duration).toBe('48:12');
		expect(spaceRecording.data.hostName).toBe('Biblioteca del Méridien');
	});
});

describe('descarte de un tipo sin modelo de dominio', () => {
	it('deja rastro en el log en vez de descartarlo en silencio', () => {
		const warn = spyOn(console, 'warn').mockImplementation(() => undefined);

		mapMediaSources(rawStory.mediaSources);

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('pdfLink'), {
			_key: rawSourceOfType('pdfLink')._key,
		});
	});
});
