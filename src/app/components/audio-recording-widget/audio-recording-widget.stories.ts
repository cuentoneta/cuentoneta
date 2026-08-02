import { Meta, StoryObj } from '@storybook/angular-vite';
import { AudioRecordingWidgetComponent } from './audio-recording-widget.component';
import { onoffAudioRecordingsMock } from '@mocks/onoff-media.mock';

const meta: Meta<AudioRecordingWidgetComponent> = {
	title: 'Widgets/AudioRecording',
	component: AudioRecordingWidgetComponent,
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
		},
	},
	argTypes: {
		media: {
			description: 'Audio recording media object containing title, description, and audio URL',
			control: { type: 'object' },
		},
	},
};

export default meta;
type Story = StoryObj<AudioRecordingWidgetComponent>;

export const Widget: Story = {
	args: {
		media: onoffAudioRecordingsMock[0],
	},
};
