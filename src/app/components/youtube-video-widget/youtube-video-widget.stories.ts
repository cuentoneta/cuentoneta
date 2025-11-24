import { Meta, StoryObj } from '@storybook/angular';
import { YoutubeVideoWidgetComponent } from './youtube-video-widget.component';
import { youtubeVideoMock } from '@mocks/youtube-video.mock';

const meta: Meta<YoutubeVideoWidgetComponent> = {
	title: 'Widgets/YoutubeVideo',
	component: YoutubeVideoWidgetComponent,
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
		media: youtubeVideoMock,
	},
};
