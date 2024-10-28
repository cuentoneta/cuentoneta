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
	title: 'Desde el sótano de la casa de la calle Garay: Encuentro #2',
	type: 'spaceRecording',
	description: [
		{
			_key: '41d2361c078b',
			markDefs: [
				{
					_type: 'link',
					href: 'https://x.com/ladrondesabado',
					_key: '0f3107ec26f8',
				},
			],
			children: [
				{
					_type: 'span',
					marks: [],
					text: 'Space de X organizado y dirigido por ',
					_key: '61bda96789450',
				},
				{
					_type: 'span',
					marks: ['0f3107ec26f8'],
					text: '@ladrondesabado',
					_key: '5250d3f6b741',
				},
				{
					_type: 'span',
					marks: [],
					text: ' que incluye la lectura, análisis y discusión del cuento.',
					_key: '78789bc376f3',
				},
			],
			_type: 'block',
			style: 'normal',
		},
	],
	data: {
		id: '1738650310468399373',
		createdAt: 'Sat Dec 23 19:58:31 +0000 2023',
		tweetBy: {
			id: '736315211389472769',
			userName: 'ladrondesabado',
			fullName: 'Ladrón de sábado',
			createdAt: 'Fri May 27 21:56:41 +0000 2016',
			description: 'Sombra terrible de Facundo\n\n«οὐ μανθάνεις ὅτι ζητῶ τὸ ἐπὶ πᾶσιν τούτοις ταὐτόν;»',
			isVerified: false,
			likeCount: 139246,
			followersCount: 6810,
			followingsCount: 1381,
			statusesCount: 46555,
			pinnedTweet: '1366391960026689543',
			profileBanner: 'https://pbs.twimg.com/profile_banners/736315211389472769/1674041435',
			profileImage: 'https://pbs.twimg.com/profile_images/1610082924069588992/xCKlsPnA_normal.jpg',
		},
		entities: {
			hashtags: [],
			mentionedUsers: [],
			urls: ['https://x.com/i/spaces/1eaKbgZvmOBGX'],
		},
		fullText:
			'En un rato arranca la segunda parte. Esta vez leeremos "El Fin" para luego analizarlo entre todos, así que están invitadísimos\n https://t.co/e8dI374Sco',
		lang: 'es',
		quoteCount: 0,
		replyCount: 1,
		retweetCount: 2,
		likeCount: 11,
		viewCount: 1839,
		bookmarkCount: 5,
		duration: '3:04:21',
	},
};

export const Widget = () => ({
	props: {
		media: media,
	},
	template: `<cuentoneta-space-recording-widget class="block" [media]="media"></cuentoneta-space-recording-widget>`,
});
