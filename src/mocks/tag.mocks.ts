import { Tag } from '@models/tag.model';

export const tagMock: Tag = {
	title: 'Colaborativa',
	slug: 'colaborativa',
	shortDescription: 'Lista de textos generada colaborativamente por la comunidad.',
	description: [
		{
			_type: 'block',
			style: 'normal',
			_key: '558175c4191c',
			markDefs: [],
			children: [
				{
					text: 'Lista de textos generada colaborativamente por la comunidad.',
					_key: '423250ef7cf30',
					_type: 'span',
					marks: [],
				},
			],
		},
	],
	icon: {
		provider: 'mdi',
		name: 'people',
	},
};
