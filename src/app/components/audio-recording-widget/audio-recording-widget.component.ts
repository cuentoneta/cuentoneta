import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioRecording } from '@models/media.model';

@Component({
	selector: 'cuentoneta-audio-recording-widget',
	standalone: true,
	imports: [CommonModule],
	template: ` <audio [src]="media().data.url" controls class="mb-2 block w-full"></audio>
		<label class="inter-body-xs-medium text-primary-500">{{ media().title }}</label>`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioRecordingWidgetComponent {
	media = input.required<AudioRecording>();
}
