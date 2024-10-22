import { SpaceRecording } from '@models/media.model';

export const spaceRecordingMock: SpaceRecording = {
	title: 'El marajá de San Telmo: discusión y breve análisis',
	type: 'spaceRecording',
	description: [
		{
			style: 'normal',
			_key: '43863eebea59',
			markDefs: [
				{
					_type: 'link',
					href: 'https://x.com/criticocultural',
					_key: 'e7ed51a5d48b',
				},
			],
			children: [
				{
					_key: '325f3119262a0',
					_type: 'span',
					marks: [],
					text: 'Space de X organizado y dirigido por ',
				},
				{
					_key: '400efa9c0dfb',
					_type: 'span',
					marks: ['e7ed51a5d48b'],
					text: '@criticocultural',
				},
				{
					_type: 'span',
					marks: [],
					text: ' que incluye la lectura, análisis y discusión del cuento.',
					_key: 'f7739e8f5c02',
				},
			],
			_type: 'block',
		},
	],
	data: {
		id: '1773161072247164990',
		createdAt: 'Thu Mar 28 01:31:58 +0000 2024',
		tweetBy: {
			id: '736315211389472769',
			userName: 'criticocultural',
			fullName: 'Crítico Cultural',
			createdAt: 'Fri May 27 21:56:41 +0000 2016',
			description: 'Otro crítico más',
			isVerified: false,
			likeCount: 141211,
			followersCount: 6958,
			followingsCount: 1400,
			statusesCount: 47045,
			pinnedTweet: '1366391960026689523',
			profileBanner: 'https://pbs.twimg.com/profile_banners/736315211389472769/1674041435',
			profileImage: 'https://pbs.twimg.com/profile_images/1610082924069588992/xCKlsPnA_normal.jpg',
		},
		entities: {
			hashtags: [],
			mentionedUsers: [],
			urls: ['https://x.com/i/spaces/1OOJXrjymndJY'],
		},
		fullText: 'https://t.co/VQJOzMFL6q',
		lang: 'zxx',
		quoteCount: 0,
		replyCount: 9,
		retweetCount: 0,
		likeCount: 8,
		viewCount: 1172,
		bookmarkCount: 2,
		duration: '2:19:23',
	},
};
