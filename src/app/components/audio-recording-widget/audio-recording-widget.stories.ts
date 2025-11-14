import { Meta, moduleMetadata } from '@storybook/angular';
import { AudioRecordingWidgetComponent } from './audio-recording-widget.component';
import { Media } from '@models/media.model';
import { audioRecordingMock } from '@mocks/audio-recording.mock';

export default {
	title: 'Widgets/AudioRecording',
	component: AudioRecordingWidgetComponent,
	decorators: [
		moduleMetadata({
			imports: [],
		}),
	],
} as Meta<AudioRecordingWidgetComponent>;

const media: Media = audioRecordingMock;

export const Widget = () => ({
	props: {
		media: media,
	},
	template: `<cuentoneta-audio-recording-widget class="block" [media]="media"></cuentoneta-audio-recording-widget>`,
});
