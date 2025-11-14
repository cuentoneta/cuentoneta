import { Meta, moduleMetadata } from '@storybook/angular';
import { YoutubeVideoWidgetComponent } from './youtube-video-widget.component';
import { Media } from '@models/media.model';
import { youtubeVideoMock } from '@mocks/youtube-video.mock';

export default {
	title: 'Widgets/YoutubeVideo',
	component: YoutubeVideoWidgetComponent,
	decorators: [
		moduleMetadata({
			imports: [],
		}),
	],
} as Meta<YoutubeVideoWidgetComponent>;

const media: Media = youtubeVideoMock;

export const Widget = () => ({
	props: {
		media: media,
	},
	template: `<cuentoneta-youtube-video-widget class="block" [media]="media"></cuentoneta-youtube-video-widget>`,
});
