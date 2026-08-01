import { Component, input, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { narrowMedia, type Media, type MediaTypeKey, type MediaTypes } from '@models/media.model';
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
	host: {
		class: 'mb-10 block w-full',
	},
})
export class MediaResourceComponent {
	public readonly mediaResources = input.required({
		transform: (media: Media[]) => media.map((m) => this.mediaTypesAdapter(m)),
	});

	private mediaTypesAdapter(media: Media): {
		component: Type<MediaTypeWidgetComponents>;
		inputs: { media: MediaTypes };
	} {
		const narrowed = narrowMedia(media);
		return { component: MEDIA_WIDGET_MAP[narrowed.type], inputs: { media: narrowed } };
	}
}
