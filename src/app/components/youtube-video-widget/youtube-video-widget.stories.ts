import { Meta, StoryObj } from '@storybook/angular-vite';
import { YoutubeVideoWidgetComponent } from './youtube-video-widget.component';
import { onoffYouTubeVideosMock } from '@mocks/onoff-media.mock';

const meta: Meta<YoutubeVideoWidgetComponent> = {
	title: 'Widgets/YoutubeVideo',
	component: YoutubeVideoWidgetComponent,
	parameters: {
		docs: {
			canvas: {
				sourceState: 'shown',
			},
		},
	},
	argTypes: {
		media: {
			description: 'YouTube video media object containing title, description, and video ID',
			control: { type: 'object' },
		},
	},
};

export default meta;
type Story = StoryObj<YoutubeVideoWidgetComponent>;

export const Widget: Story = {
	args: {
		media: onoffYouTubeVideosMock[0],
	},
};
