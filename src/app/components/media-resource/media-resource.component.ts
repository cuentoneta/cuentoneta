// Angular Core
import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Componentes
import { SpaceRecordingWidgetComponent } from '../space-recording-widget/space-recording-widget.component';

// Modelos
import { MediaTypes, SpaceRecording } from '@models/media.model';

@Component({
	selector: 'cuentoneta-media-resource',
	standalone: true,
	imports: [CommonModule, SpaceRecordingWidgetComponent],
	template: ` @for (media of mediaResources(); track $index) {
		@if (media.type === 'spaceRecording') {
			<cuentoneta-space-recording-widget
				[media]="asSpaceRecording(media)"
				class="block"
			></cuentoneta-space-recording-widget>
		}
		@if (media.type === 'audioRecording') {
			<audio [src]="media.url" controls class="block mb-2 w-full"></audio>
			<label class="inter-body-caption-bold">{{ media.title }}</label>
		}
	}`,
	styles: `
	:host{
		@apply block w-full mb-10;
	}`,
})
export class MediaResourceComponent {
	readonly mediaResources = input.required<MediaTypes[]>();

	asSpaceRecording(media: MediaTypes): SpaceRecording {
		return media as SpaceRecording;
	}
}
