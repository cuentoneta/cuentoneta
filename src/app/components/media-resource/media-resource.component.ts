import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpaceRecordingWidgetComponent } from '../space-recording-widget/space-recording-widget.component';
import { MediaTypes } from '@models/media.model';
import { AudioRecordingWidgetComponent } from '../audio-recording-widget/audio-recording-widget.component';

@Component({
	selector: 'cuentoneta-media-resource',
	standalone: true,
	imports: [CommonModule, SpaceRecordingWidgetComponent, AudioRecordingWidgetComponent],
	template: ` @for (media of mediaResources(); track $index) {
		@if (media.type === 'spaceRecording') {
			@defer {
				<cuentoneta-space-recording-widget [media]="media" class="block"></cuentoneta-space-recording-widget>
			}
		}
		@if (media.type === 'audioRecording') {
			@defer {
				<cuentoneta-audio-recording-widget [media]="media"></cuentoneta-audio-recording-widget>
			}
		}
	}`,
	styles: `
	:host{
		@apply block w-full mb-10;
	}`,
})
export class MediaResourceComponent {
	mediaResources = input.required<MediaTypes[]>();
}
