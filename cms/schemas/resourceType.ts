import { LinkIcon } from '@sanity/icons';
import { preview } from 'sanity-plugin-icon-picker';
import { defineType } from 'sanity';

export const resource = defineType({
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
});

export default defineType({
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
			options: 'icon.options',
		},
		prepare({ title, description, provider, name, options }) {
			return {
				title: title,
				subtitle: description,
				media: preview({ provider, name, options }),
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
});
