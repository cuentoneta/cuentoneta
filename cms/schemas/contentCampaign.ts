import { defineField, defineType, type ImageValue, type ValidationContext } from 'sanity';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { localizedRequire } from '../utils/validations';

// Models
import {
	ContentCampaignViewport,
	ContentCampaignViewportKeys,
	viewportElementSizes,
} from '@models/content-campaign.model';

const imageResourcePattern = /^image-([a-f\d]+)-(\d+x\d+)-(\w+)$/;

const decodeAssetId = (id) => {
	const [, assetId, dimensions, format] = imageResourcePattern.exec(id);
	const [width, height] = dimensions.split('x').map((v: string) => parseInt(v, 10));

	return {
		assetId,
		dimensions: { width, height },
		format,
	};
};

const isViewport = (segment: unknown): segment is ContentCampaignViewport =>
	ContentCampaignViewportKeys.some((key) => key === segment);

const campaignImageSizeValidation = (image: ImageValue | undefined, context: ValidationContext) => {
	// El viewport es el penúltimo segmento del path del campo (`<viewport>.image`), y llega sin tipar:
	// se valida contra las claves declaradas para no indexar el mapa de tamaños con una clave cualquiera.
	const viewport = context.path?.[context.path.length - 2];
	const viewportSize = isViewport(viewport) ? viewportElementSizes[viewport] : undefined;

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
