import { Meta, moduleMetadata } from '@storybook/angular';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { SpaceRecordingWidgetComponent } from './space-recording-widget.component';
import { Media } from '@models/media.model';

export default {
	title: 'SpaceRecordingWidgetComponent',
	component: SpaceRecordingWidgetComponent,
	decorators: [
		moduleMetadata({
			imports: [CommonModule, NgOptimizedImage],
		}),
	],
} as Meta<SpaceRecordingWidgetComponent>;

const media: Media = {
	title: 'En Algún Lugar de Tlön: Encuentro #1',
	type: 'spaceRecording',
	data: {
		id: '1736920785162240151',
		createdAt: 'Tue Dec 19 01:26:00 +0000 2023',
		duration: '3:24:03',
		tweetBy: {
			id: '736315211389472769',
			userName: 'ladrondesabado',
			fullName: 'Ladrón de sábado',
			createdAt: 'Fri May 27 21:56:41 +0000 2016',
			description: 'Sombra terrible de Facundo\n\n«οὐ μανθάνεις ὅτι ζητῶ τὸ ἐπὶ πᾶσιν τούτοις ταὐτόν;»',
			isVerified: false,
			favouritesCount: 134855,
			followersCount: 5920,
			followingsCount: 1343,
			statusesCount: 43688,
			location: '',
			pinnedTweet: '1366391960026689543',
			profileBanner: 'https://pbs.twimg.com/profile_banners/736315211389472769/1674041435',
			profileImage: 'https://pbs.twimg.com/profile_images/1610082924069588992/xCKlsPnA_normal.jpg',
		},
		entities: {
			hashtags: [],
			urls: ['https://x.com/i/spaces/1OdKrjnmmQVKX'],
			mentionedUsers: [],
		},
		fullText: 'https://t.co/hTvEMOZzRE.',
		lang: 'zxx',
		quoteCount: 1,
		replyCount: 28,
		retweetCount: 5,
		likeCount: 24,
		viewCount: 3760,
		bookmarkCount: 12,
	},
};

export const Widget = () => ({
	props: {
		media: media,
	},
	template: `<cuentoneta-space-recording-widget class="block" [media]="media"></cuentoneta-space-recording-widget>`,
});
