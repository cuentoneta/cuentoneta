import type { ContentCampaign } from '@models/content-campaign.model';
import { onoffImageAssets } from './onoff-image-assets.mock';
export const contentCampaignMock: ContentCampaign[] = [
	{
		title: 'Diez tapas, una sola obra',
		slug: 'coleccion-completa-onoff',
		url: '../author/francois-onoff',
		contents: {
			xs: {
				imageUrl: onoffImageAssets.coleccionCompletaBannerMobile.path,
				imageWidth: 540,
				imageHeight: 220,
			},
			md: {
				imageUrl: onoffImageAssets.coleccionCompletaBannerDesktop.path,
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
				imageUrl: onoffImageAssets.elPalacioBannerMobile.path,
				imageWidth: 540,
				imageHeight: 220,
			},
			md: {
				imageUrl: onoffImageAssets.elPalacioBannerDesktop.path,
				imageWidth: 1240,
				imageHeight: 360,
			},
		},
	},
];
