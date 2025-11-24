import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SpaceRecordingWidgetComponent } from './space-recording-widget.component';
import { spaceRecordingMock } from '@mocks/space-recording.mock';

const meta: Meta<SpaceRecordingWidgetComponent> = {
	title: 'Widgets/SpaceRecording',
	component: SpaceRecordingWidgetComponent,
	decorators: [
		moduleMetadata({
			imports: [CommonModule, NgOptimizedImage],
		}),
	],
	argTypes: {
		media: {
			description: 'Space recording media object containing Twitter/X Space data with metadata',
			control: { type: 'object' },
		},
	},
};

export default meta;
type Story = StoryObj<SpaceRecordingWidgetComponent>;

export const Widget: Story = {
	args: {
		media: spaceRecordingMock,
	},
};
