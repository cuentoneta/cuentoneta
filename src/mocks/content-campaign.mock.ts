import { ContentCampaign } from '@models/content-campaign.model';
export const contentCampaignMock: ContentCampaign[] = [
	{
		title: 'Diez tapas, una sola obra',
		slug: 'coleccion-completa-onoff',
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
	},
	{
		title: 'El palacio de las nueve fronteras',
		slug: 'el-palacio-de-las-nueve-fronteras',
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
