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
			type: 'url',
			// La regla rige sobre la edición y no sobre lo almacenado, así que sanear los documentos que
			// ya la incumplían es un trabajo aparte y no algo que esto repare. `mailto` está admitido
			// porque un recurso puede ser la dirección de contacto del autor, no solo una página.
			validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https', 'mailto'] }),
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
			title: 'Descripción',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
	],
});
