import { ContentCampaign } from '@models/content-campaign.model';
export const contentCampaignMock: ContentCampaign[] = [
	{
		description: [
			{
				style: 'normal',
				_key: 'a1b2c3d4e5f6',
				markDefs: [],
				children: [
					{
						text: 'Toda la biblioteca de Onoff, de ',
						_key: '11aa22bb33cc',
						_type: 'span',
						marks: [],
					},
					{
						text: 'El odio',
						_key: '44dd55ee66ff',
						_type: 'span',
						marks: ['em'],
					},
					{
						text: ' (1971) a ',
						_key: '77aa88bb99cc',
						_type: 'span',
						marks: [],
					},
					{
						text: 'Nerón',
						_key: 'aa11bb22cc33',
						_type: 'span',
						marks: ['em'],
					},
					{
						text: ' (1988).',
						_key: 'dd44ee55ff66',
						_type: 'span',
						marks: [],
					},
				],
				_type: 'block',
			},
		],
		url: '../author/francois-onoff',
		contents: {
			xs: {
				imageUrl: 'assets/img/mocks/banners/banner-coleccion-completa-mobile.png',
				imageWidth: 540,
				imageHeight: 220,
			},
			md: {
				imageUrl: 'assets/img/mocks/banners/banner-coleccion-completa-desktop.png',
				imageWidth: 1240,
				imageHeight: 360,
			},
		},
		title: 'Diez tapas, una sola obra',
		slug: 'coleccion-completa-onoff',
	},
	{
		title: 'El palacio de las nueve fronteras',
		slug: 'el-palacio-de-las-nueve-fronteras',
		description: [
			{
				markDefs: [],
				children: [
					{
						_type: 'span',
						marks: ['em'],
						text: '«Ese cuerpo necesitaba un aliento; esos ojos vacíos, una mirada.»',
						_key: 'bc12de34fa56',
					},
				],
				_type: 'block',
				style: 'normal',
				_key: 'ef78ab90cd12',
			},
		],
		url: '../story/el-palacio-de-las-nueve-fronteras',
		contents: {
			xs: {
				imageUrl: 'assets/img/mocks/banners/banner-el-palacio-mobile.png',
				imageWidth: 540,
				imageHeight: 220,
			},
			md: {
				imageUrl: 'assets/img/mocks/banners/banner-el-palacio-desktop.png',
				imageWidth: 1240,
				imageHeight: 360,
			},
		},
	},
];
