import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SpaceRecordingWidgetComponent } from '../space-recording-widget/space-recording-widget.component';
import { MediaTypes } from '@models/media.model';

@Component({
	selector: 'cuentoneta-media-resource',
	standalone: true,
	imports: [CommonModule, SpaceRecordingWidgetComponent],
	template: ` @for (media of mediaResources(); track $index) {
		@if (media.type === 'spaceRecording') {
			<cuentoneta-space-recording-widget [media]="media" class="block mb-10"></cuentoneta-space-recording-widget>
		}
	}`,
	styles: ``,
})
export class MediaResourceComponent {
	mediaResources = input.required<MediaTypes[]>();
}
