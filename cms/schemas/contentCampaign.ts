import { defineField, defineType } from 'sanity';
import { CalendarIcon } from '@sanity/icons';
import { localizedRequire } from '../utils/validations';

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
	const limits = {
		xs: {
			title: 32,
			subtitle: 36,
		},
		md: {
			title: 40,
			subtitle: 60,
		},
	};

	if (!blocks || blocks.length === 0) return true;

	const totalCharacters = blocks
		.filter((block) => block._type === 'block')
		.reduce((acc, block) => acc + block.children.reduce((sum, child) => sum + (child.text || '').length, 0), 0);

	const property = context.path[context.path.length - 1];
	const viewport = context.path[context.path.length - 2];
	const maxChars = limits[viewport][property];

	if (totalCharacters > maxChars) {
		return `La longitud máxima es de ${maxChars} caracteres. Longitud actual: ${totalCharacters}`;
	}

	return true;
};

const campaignImageSizeValidation = (image, context) => {
	const viewportSizes = {
		xs: {
			width: 540,
			height: 220,
		},
		md: {
			width: 960,
			height: 280,
		},
	};

	const viewport = context.path[context.path.length - 2];
	const viewportSize = viewportSizes[viewport];

	if (!image || !viewportSize) return true;
	const { dimensions } = decodeAssetId(image.asset._ref);
	return (
		(dimensions.width === viewportSize.width && dimensions.height === viewportSize.height) ||
		`La imagen debe tener un tamaño estricto de ${viewportSize.width} x ${viewportSize.height} px. El tamaño de la imagen actual es de ${dimensions.width} x ${dimensions.height} px`
	);
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
			fields: [
				defineField({
					name: 'xs',
					title: 'Viewport mobile (xs, sm)',
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
							title: 'Imagen (540px x 220px de tamaño)',
							type: 'image',
							validation: (Rule) => [Rule.custom(localizedRequire), Rule.custom(campaignImageSizeValidation)],
						}),
					],
				}),
				defineField({
					name: 'md',
					title: 'Viewport tablet horizontal y desktop (md y superior)',
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
							title: 'Imagen (960px x 280px de tamaño)',
							type: 'image',
							validation: (Rule) => [Rule.custom(localizedRequire), Rule.custom(campaignImageSizeValidation)],
						}),
					],
				}),
			],
		}),
	],
});
