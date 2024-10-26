import { YouTubeVideo } from '@models/media.model';

export const youtubeVideoMock: YouTubeVideo = {
	title: 'Video alusivo a la narración de "El espejo del tiempo"',
	type: 'youTubeVideo',
	description: [
		{
			markDefs: [
				{
					_type: 'link',
					href: 'https://www.youtube.com/@gativideo',
					_key: 'de7b21f8e43f',
				},
			],
			children: [
				{
					marks: [],
					text: 'Video alusivo a la narración de "El espejo del tiempo" en el canal de',
					_key: '7d7e212de407',
					_type: 'span',
				},
				{
					_type: 'span',
					marks: ['de7b21f8e43f'],
					text: 'Gativideo',
					_key: '374fb3581549',
				},
				{
					text: '.',
					_key: '83baeb531387',
					_type: 'span',
					marks: [],
				},
			],
			_type: 'block',
			style: 'normal',
			_key: '321178cc04c5',
		},
	],
	data: { videoId: 'cMFHs_vWPrw' },
};
