import type { ContentCampaign } from '@sanity-types';
import { documentSystemFields, slugField } from '../document/sanity-document.factory';
import { onoffImageAssets } from '../../onoff-image-assets.mock';

export const coleccionCompletaContentCampaignDocument: ContentCampaign = {
	...documentSystemFields('onoff-content-campaign-coleccion-completa-onoff'),
	_type: 'contentCampaign',
	title: 'Diez tapas, una sola obra',
	slug: slugField('coleccion-completa-onoff'),
	url: '../author/francois-onoff',
	contents: {
		xs: {
			image: {
				_type: 'image',
				asset: { _type: 'reference', _ref: onoffImageAssets.coleccionCompletaBannerMobile.ref },
			},
		},
		md: {
			image: {
				_type: 'image',
				asset: { _type: 'reference', _ref: onoffImageAssets.coleccionCompletaBannerDesktop.ref },
			},
		},
	},
};
