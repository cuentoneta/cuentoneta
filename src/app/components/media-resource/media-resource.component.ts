import { Component, input, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Media, MediaTypeKey, MediaTypes } from '@models/media.model';
import { SpaceRecordingWidgetComponent } from '../space-recording-widget/space-recording-widget.component';
import { AudioRecordingWidgetComponent } from '../audio-recording-widget/audio-recording-widget.component';
import { YoutubeVideoWidgetComponent } from '../youtube-video-widget/youtube-video-widget.component';
import { SpotifyPodcastEpisodeWidget } from '@components/spotify-audio-widget/spotify-podcast-episode-widget';

type MediaTypeWidgetComponents =
	| AudioRecordingWidgetComponent
	| SpaceRecordingWidgetComponent
	| YoutubeVideoWidgetComponent
	| SpotifyPodcastEpisodeWidget;

const MEDIA_WIDGET_MAP: Record<MediaTypeKey, Type<MediaTypeWidgetComponents>> = {
	audioRecording: AudioRecordingWidgetComponent,
	spotifyPodcastEpisode: SpotifyPodcastEpisodeWidget,
	spaceRecording: SpaceRecordingWidgetComponent,
	youTubeVideo: YoutubeVideoWidgetComponent,
};

@Component({
	selector: 'cuentoneta-media-resource',
	imports: [CommonModule],
	template: ` @for (media of mediaResources(); track $index) {
		<ng-container *ngComponentOutlet="media.component; inputs: media.inputs" />
	}`,
	styles: `
		:host {
			@apply mb-10 block w-full;
		}
	`,
})
export class MediaResourceComponent {
	readonly mediaResources = input.required({
		transform: (media: Media[]) => media.map((m) => this.mediaTypesAdapter(m)),
	});

	/**
	 * Adaptador utilizado para mappear los distintos tipos de media que
	 * pueden existir en la plataforma a su tipo específico.
	 * @param media
	 * @private
	 */
	private mediaTypesAdapter(media: Media): {
		component: Type<MediaTypeWidgetComponents>;
		inputs: { media: MediaTypes };
	} {
		const component = MEDIA_WIDGET_MAP[media.type];
		if (!component) {
			throw new Error(`El tipo ${media.type} no está soportado.`);
		}
		return { component, inputs: { media: media as MediaTypes } };
	}
}
