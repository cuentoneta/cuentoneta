import { LinkIcon } from '@sanity/icons';
import { preview } from 'sanity-plugin-icon-picker';
import { defineField, defineType } from 'sanity';

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
		defineField({
			name: 'title',
			title: 'Título',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'url',
			title: 'URL',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'resourceType',
			title: 'Tipo de recurso',
			type: 'reference',
			to: { type: 'resourceType' },
			validation: (Rule) => Rule.required(),
		}),
	],
});

export const resourceType = defineType({
	name: 'resourceType',
	title: 'Tipos de Recursos',
	type: 'document',
	icon: LinkIcon,
	preview: {
		select: {
			title: 'title',
			shortDescription: 'shortDescription',
			provider: 'icon.provider',
			name: 'icon.name',
			options: 'icon.options',
		},
		prepare({ title, shortDescription, provider, name, options }) {
			return {
				title: title,
				subtitle: shortDescription,
				media: preview({ provider, name, options }),
			};
		},
	},
	fields: [
		defineField({
			name: 'title',
			title: 'Título',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'title',
				maxLength: 96,
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'shortDescription',
			title: 'Descripción breve',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Descripción',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'icon',
			title: 'Icono',
			type: 'iconPicker',
			options: {
				storeSvg: true,
			},
			validation: (Rule) => Rule.required(),
		}),
	],
});
