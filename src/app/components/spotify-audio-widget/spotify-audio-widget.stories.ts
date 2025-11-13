import { Meta, moduleMetadata } from '@storybook/angular';
import { SpotifyAudioWidget } from './spotify-audio-widget';
import { Media } from '@models/media.model';
import { spotifyAudioMock } from '@mocks/spotify-audio.mock';

export default {
	title: 'SpotifyAudioWidgetComponent',
	component: SpotifyAudioWidget,
	decorators: [
		moduleMetadata({
			imports: [],
		}),
	],
} as Meta<SpotifyAudioWidget>;

const media: Media = spotifyAudioMock;

export const Widget = () => ({
	props: {
		media: media,
	},
	template: `<cuentoneta-spotify-audio-widget class="block" [media]="media"></cuentoneta-spotify-audio-widget>`,
});
