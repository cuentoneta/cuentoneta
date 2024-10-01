import { defineField, defineType } from 'sanity';
import { CalendarIcon } from '@sanity/icons';
import { localizedRequire } from '../utils/validations';

// Models
import {
	ContentCampaignViewport,
	ContentCampaignViewportKeys,
	viewportElementSizes,
} from '../../src/app/models/content-campaign.model';

const imageResourcePattern = /^image-([a-f\d]+)-(\d+x\d+)-(\w+)$/;

const decodeAssetId = (id) => {
	const [, assetId, dimensions, format] = imageResourcePattern.exec(id);
	const [width, height] = dimensions.split('x').map((v) => parseInt(v, 10));

	return {
		assetId,
		dimensions: { width, height },
		format,
	};
};

const campaignCharLimitValidation = (blocks, context) => {
	if (!blocks || blocks.length === 0) return true;

	const totalCharacters = blocks
		.filter((block) => block._type === 'block')
		.reduce((acc, block) => acc + block.children.reduce((sum, child) => sum + (child.text || '').length, 0), 0);

	const property = context.path[context.path.length - 1];
	const viewport = context.path[context.path.length - 2];
	const maxChars = viewportElementSizes[viewport][property];

	if (totalCharacters > maxChars) {
		return `La longitud máxima es de ${maxChars} caracteres. Longitud actual: ${totalCharacters}`;
	}

	return true;
};

const campaignImageSizeValidation = (image, context) => {
	const viewport = context.path[context.path.length - 2];
	const viewportSize = viewportElementSizes[viewport];

	if (!image || !viewportSize) return true;
	const { dimensions } = decodeAssetId(image.asset._ref);
	return (
		(dimensions.width === viewportSize.imageWidth && dimensions.height === viewportSize.imageHeight) ||
		`La imagen debe tener un tamaño estricto de ${viewportSize.imageWidth} x ${viewportSize.imageHeight} px. El tamaño de la imagen actual es de ${dimensions.width} x ${dimensions.height} px`
	);
};

const generateContent = (viewport: ContentCampaignViewport) => {
	return defineField({
		name: viewport,
		title: `Viewport ${viewport}`,
		type: 'object',
		fields: [
			defineField({
				name: 'title',
				title: 'Título',
				type: 'blockContent',
				validation: (Rule) => [Rule.custom(localizedRequire), Rule.custom(campaignCharLimitValidation)],
			}),
			defineField({
				name: 'subtitle',
				title: 'Subtítulo',
				type: 'blockContent',
				validation: (Rule) => [Rule.custom(localizedRequire), Rule.custom(campaignCharLimitValidation)],
			}),
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
			name: 'description',
			title: 'Descripción',
			type: 'blockContent',
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
