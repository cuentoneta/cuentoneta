import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Models
import { AudioRecording } from '@models/media.model';

// Components
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-audio-recording-widget',
	imports: [CommonModule, PortableTextParserComponent],
	template: `
		<audio [src]="media().data.url" data-testid="audio-recording" controls class="mb-2 block w-full"></audio>
		<cuentoneta-portable-text-parser [paragraphs]="media().description" class="inter-body-xs-medium text-primary-500" />
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioRecordingWidgetComponent {
	media = input.required<AudioRecording>();
}
