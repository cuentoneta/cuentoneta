import { defineField, defineType } from 'sanity';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { localizedRequire } from '../utils/validations';
import { campaignImageSizeValidation } from '../utils/content-campaign-image';

// Models
import {
	ContentCampaignViewport,
	ContentCampaignViewportKeys,
	viewportElementSizes,
} from '@models/content-campaign.model';

const generateContent = (viewport: ContentCampaignViewport) => {
	return defineField({
		name: viewport,
		title: `Viewport ${viewport}`,
		type: 'object',
		fields: [
			defineField({
				name: 'image',
				title: `Imagen (${viewportElementSizes[viewport].imageWidth}px x ${viewportElementSizes[viewport].imageHeight}px de tamaño)`,
				type: 'image',
				validation: (Rule) => [Rule.custom(localizedRequire), Rule.custom(campaignImageSizeValidation)],
			}),
		],
	});
};

export default defineType({
	name: 'contentCampaign',
	title: 'Campaña de Contenido',
	type: 'document',
	icon: CalendarIcon,
	fields: [
		defineField({
			name: 'title',
			title: 'Título',
			type: 'string',
			validation: (Rule) => Rule.custom(localizedRequire),
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'title',
				maxLength: 96,
			},
			validation: (Rule) => Rule.custom(localizedRequire),
		}),
		defineField({
			name: 'url',
			title: 'URL',
			type: 'string',
			validation: (Rule) => Rule.custom(localizedRequire),
		}),
		defineField({
			name: 'contents',
			title: 'Contenidos',
			type: 'object',
			fields: [...ContentCampaignViewportKeys.map((key) => generateContent(key))],
		}),
	],
});
