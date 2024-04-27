import { LinkIcon } from '@sanity/icons';
import { preview } from 'sanity-plugin-icon-picker';

export const resource = {
	name: 'resource',
	title: 'Recurso',
	type: 'object',
	preview: {
		select: {
			title: 'resourceType.title',
			icon: 'resourceType.icon',
		},
		prepare(selection) {
			return {
				title: selection.title,
				media: preview(selection.icon),
			};
		},
	},
	fields: [
		{
			name: 'title',
			title: 'Título',
			type: 'string',
		},
		{
			name: 'url',
			title: 'URL',
			type: 'string',
		},
		{
			name: 'resourceType',
			title: 'Tipo de recurso',
			type: 'reference',
			to: { type: 'resourceType' },
		},
	],
};

export default {
	name: 'resourceType',
	title: 'Tipos de Recursos',
	type: 'document',
	icon: LinkIcon,
	preview: {
		select: {
			title: 'title',
			description: 'description',
			provider: 'icon.provider',
			name: 'icon.name',
		},
		prepare(selection) {
			return {
				title: selection.title,
				subtitle: selection.description,
				media: preview(selection),
			};
		},
	},
	fields: [
		{
			name: 'title',
			title: 'Título',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'title',
				maxLength: 96,
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'description',
			title: 'Descripción',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'icon',
			title: 'Icono',
			type: 'iconPicker',
			options: {
				storeSvg: true,
			},
		},
	],
};
