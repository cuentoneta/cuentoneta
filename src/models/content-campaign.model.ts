export const ContentCampaignViewportKeys = ['xs', 'md'] as const;
export type ContentCampaignViewport = (typeof ContentCampaignViewportKeys)[number];

export const viewportElementSizes = Object.freeze({
	xs: {
		imageWidth: 540,
		imageHeight: 220,
	},
	md: {
		imageWidth: 1240,
		imageHeight: 360,
	},
});

export interface ContentCampaign {
	title: string;
	slug: string;
	url: string;
	contents: {
		[key in ContentCampaignViewport]: {
			imageUrl: string;
			imageWidth: number;
			imageHeight: number;
		};
	};
}
