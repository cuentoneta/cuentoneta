import { Meta, StoryObj, moduleMetadata } from '@storybook/angular-vite';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SpaceRecordingWidgetComponent } from './space-recording-widget.component';
import { onoffSpaceRecordingsMock } from '@mocks/onoff-media.mock';

const meta: Meta<SpaceRecordingWidgetComponent> = {
	title: 'Widgets/SpaceRecording',
	component: SpaceRecordingWidgetComponent,
	decorators: [
		moduleMetadata({
			imports: [CommonModule, NgOptimizedImage],
		}),
	],
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
		},
	},
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
		media: onoffSpaceRecordingsMock[0],
	},
};
