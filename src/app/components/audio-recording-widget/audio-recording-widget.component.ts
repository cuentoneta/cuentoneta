import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioRecording } from '@models/media.model';
import { PortableTextParserComponent } from '../portable-text-parser/portable-text-parser.component';

@Component({
	selector: 'cuentoneta-audio-recording-widget',
	standalone: true,
	imports: [CommonModule, PortableTextParserComponent],
	template: ` <audio [src]="media().data.url" controls class="mb-2 block w-full"></audio>
		<label class="inter-body-xs-medium text-primary-500"
			><cuentoneta-portable-text-parser [paragraphs]="media().description" />
		</label>`,
	styles: ``,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioRecordingWidgetComponent {
	media = input.required<AudioRecording>();
}
