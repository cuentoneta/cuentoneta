import { Meta, StoryObj } from '@storybook/angular';
import { AudioRecordingWidgetComponent } from './audio-recording-widget.component';
import { audioRecordingMock } from '@mocks/audio-recording.mock';

const meta: Meta<AudioRecordingWidgetComponent> = {
	title: 'Widgets/AudioRecording',
	component: AudioRecordingWidgetComponent,
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
		media: audioRecordingMock,
	},
};
