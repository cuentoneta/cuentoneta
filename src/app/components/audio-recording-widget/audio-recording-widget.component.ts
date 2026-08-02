import { Component, input } from '@angular/core';

// Models
import { AudioRecording } from '@models/media.model';

@Component({
	selector: 'cuentoneta-audio-recording-widget',
	template: `
		<figure>
			<audio [src]="media().data.url" data-testid="audio-recording" controls class="mb-2 block w-full"></audio>
			<figcaption
				[innerHTML]="media().description"
				data-testid="media-description"
				class="font-inter text-xs font-medium text-brand-500"
			></figcaption>
		</figure>
	`,
})
export class AudioRecordingWidgetComponent {
	public readonly media = input.required<AudioRecording>();
}
