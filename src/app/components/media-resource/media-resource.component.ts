import { Component, input, Type } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioRecording, Media, MediaTypes, SpaceRecording, YouTubeVideo } from '@models/media.model';
import { SpaceRecordingWidgetComponent } from '../space-recording-widget/space-recording-widget.component';
import { AudioRecordingWidgetComponent } from '../audio-recording-widget/audio-recording-widget.component';
import { YoutubeVideoWidgetComponent } from '../youtube-video-widget/youtube-video-widget.component';

type MediaTypeWidgetComponents =
	| AudioRecordingWidgetComponent
	| SpaceRecordingWidgetComponent
	| YoutubeVideoWidgetComponent;

@Component({
	selector: 'cuentoneta-media-resource',
	imports: [CommonModule],
	template: ` @for (media of mediaResources(); track $index) {
		<ng-container *ngComponentOutlet="media.component; inputs: media.inputs"></ng-container>
	}`,
	styles: `
		:host {
			@apply mb-10 block w-full;
		}
	`,
})
export class MediaResourceComponent {
	mediaResources = input.required({
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
		if (media.type === 'audioRecording') {
			return { component: AudioRecordingWidgetComponent, inputs: { media: media as AudioRecording } };
		}
		if (media.type === 'spaceRecording') {
			return { component: SpaceRecordingWidgetComponent, inputs: { media: media as SpaceRecording } };
		}
		if (media.type === 'youTubeVideo') {
			return { component: YoutubeVideoWidgetComponent, inputs: { media: media as YouTubeVideo } };
		} else {
			throw new Error(`El tipo ${media.type} no está soportado.`);
		}
	}
}
