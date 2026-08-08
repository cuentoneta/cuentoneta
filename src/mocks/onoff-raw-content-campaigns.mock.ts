import type { LandingPageContentQueryResult } from '@sanity-types';
import { contentCampaignMock } from './content-campaign.mock';
import { onoffImageAssets } from './onoff-image-assets.mock';

type RawContentCampaigns = NonNullable<LandingPageContentQueryResult>['campaigns'];

function rawImage(assetRef: string): NonNullable<RawContentCampaigns[number]['contents']['xs']['image']> {
	return { _type: 'image', asset: { _type: 'reference', _ref: assetRef } };
}

const campaignBanners = [
	{ xs: onoffImageAssets.coleccionCompletaBannerMobile, md: onoffImageAssets.coleccionCompletaBannerDesktop },
	{ xs: onoffImageAssets.elPalacioBannerMobile, md: onoffImageAssets.elPalacioBannerDesktop },
];

// Serializa el canon de dominio a la forma de wire que devuelve la proyección `campaigns`. El `_id`
// no existe en el dominio a propósito (lo corta el ACL): se agrega acá porque es lo que Sanity
// devuelve, y es lo que le da filo al test de contrato del mapper.
export const onoffRawContentCampaignsMock: RawContentCampaigns = contentCampaignMock.map((campaign, index) => ({
	_id: `onoff-content-campaign-${campaign.slug}`,
	title: campaign.title,
	slug: campaign.slug,
	url: campaign.url,
	contents: {
		xs: { image: rawImage(campaignBanners[index].xs.ref) },
		md: { image: rawImage(campaignBanners[index].md.ref) },
	},
}));
