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
		url: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Es-Ajedrez-article-part1.ogg',
		duration: '2:19:23',
		hostName: 'Crítico Cultural',
		hostAvatar: 'https://pbs.twimg.com/profile_images/1610082924069588992/xCKlsPnA_normal.jpg',
		date: '2024-03-28',
	},
};
