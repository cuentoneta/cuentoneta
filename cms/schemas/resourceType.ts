import { LinkIcon } from '@sanity/icons/Link';
import { defineField, defineType } from 'sanity';

export const resource = defineType({
	name: 'resource',
	title: 'Recurso',
	type: 'object',
	preview: {
		select: {
			title: 'resourceType.title',
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
			subtitle: 'description',
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
			name: 'description',
			title: 'Descripción breve',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
	],
});
