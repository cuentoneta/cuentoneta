import type { Type } from '@angular/core';
import type { Media } from '@models/media.model';
import { AudioRecordingWidgetComponent } from '@components/audio-recording-widget/audio-recording-widget.component';
import { SpaceRecordingWidgetComponent } from '@components/space-recording-widget/space-recording-widget.component';
import { SpotifyPodcastEpisodeWidget } from '@components/spotify-audio-widget/spotify-podcast-episode-widget';
import { YoutubeVideoWidgetComponent } from '@components/youtube-video-widget/youtube-video-widget.component';
import { mediaWidgetRegistry, toMediaWidgetOutlet } from './media-widget-registry';
import type { MediaWidget } from './media-widget-registry';

// Mocks
import {
	onoffAudioRecordingsMock,
	onoffMediaMock,
	onoffSpaceRecordingsMock,
	onoffSpotifyPodcastEpisodesMock,
	onoffYouTubeVideosMock,
} from '@mocks/onoff-media.mock';

const casosPorTipo: { descripcion: string; media: Media; widget: Type<MediaWidget> }[] = [
	{
		descripcion: 'audioRecording',
		media: onoffAudioRecordingsMock[0],
		widget: AudioRecordingWidgetComponent,
	},
	{
		descripcion: 'spaceRecording',
		media: onoffSpaceRecordingsMock[0],
		widget: SpaceRecordingWidgetComponent,
	},
	{
		descripcion: 'youTubeVideo',
		media: onoffYouTubeVideosMock[0],
		widget: YoutubeVideoWidgetComponent,
	},
	{
		descripcion: 'spotifyPodcastEpisode',
		media: onoffSpotifyPodcastEpisodesMock[0],
		widget: SpotifyPodcastEpisodeWidget,
	},
];

describe('mediaWidgetRegistry', () => {
	test.each(casosPorTipo)('resuelve el widget de $descripcion', ({ media, widget }) => {
		expect(toMediaWidgetOutlet(media).component).toBe(widget);
	});

	test('transporta el propio medio como input del widget', () => {
		const media = onoffAudioRecordingsMock[0];

		expect(toMediaWidgetOutlet(media).inputs.media).toBe(media);
	});

	test('falla ante un tipo de medio que el registry no tiene', () => {
		// El tag se ensancha a propósito: es la forma que llega del CMS, donde nada garantiza que el
		// `type` publicado esté dentro de `MediaTypeKey`.
		const media = { type: 'unsupportedType', title: 'Medio sin widget' } as unknown as Media;

		expect(() => toMediaWidgetOutlet(media)).toThrow('El tipo unsupportedType no está soportado.');
	});

	test('el corpus ejercita todos los tipos de medio que el registry declara', () => {
		const tiposDelCorpus = new Set(onoffMediaMock.map((media) => media.type));

		expect([...tiposDelCorpus].sort()).toEqual(Object.keys(mediaWidgetRegistry).sort());
	});
});
