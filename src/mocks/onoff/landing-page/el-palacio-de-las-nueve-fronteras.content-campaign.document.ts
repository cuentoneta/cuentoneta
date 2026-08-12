import type { ContentCampaign } from '@sanity-types';
import { documentSystemFields, slugField } from '../document/sanity-document.factory';
import { onoffImageAssets } from '../../onoff-image-assets.mock';

export const palacioNueveFronterasContentCampaignDocument: ContentCampaign = {
	...documentSystemFields('onoff-content-campaign-el-palacio-de-las-nueve-fronteras'),
	_type: 'contentCampaign',
	title: 'El palacio de las nueve fronteras',
	slug: slugField('el-palacio-de-las-nueve-fronteras'),
	url: '../story/el-palacio-de-las-nueve-fronteras',
	contents: {
		xs: {
			image: { _type: 'image', asset: { _type: 'reference', _ref: onoffImageAssets.elPalacioBannerMobile.ref } },
		},
		md: {
			image: { _type: 'image', asset: { _type: 'reference', _ref: onoffImageAssets.elPalacioBannerDesktop.ref } },
		},
	},
};
