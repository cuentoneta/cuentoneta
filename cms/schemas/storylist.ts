import { DashboardIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
	name: 'storylist',
	title: 'Storylists',
	type: 'document',
	icon: DashboardIcon,
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
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'featuredImage',
			title: 'Imagen destacada',
			type: 'image',
			options: {
				hotspot: true,
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'tags',
			title: 'Etiquetas',
			type: 'array',
			of: [
				defineArrayMember({
					name: 'tag',
					title: 'Etiqueta',
					type: 'reference',
					to: [{ type: 'tag' }],
				}),
			],
		}),
		defineField({
			name: 'config',
			title: 'Configuración',
			type: 'object',
			fields: [
				defineField({
					name: 'showAuthors',
					title: 'Mostrar autores',
					description: 'Mostrar nombres de autores en los teasers de la storylist',
					type: 'boolean',
					initialValue: true,
				}),
			],
		}),
		defineField({
			name: 'stories',
			title: 'Cuentos/Textos/Historias dentro de la storylist',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'reference',
					to: [{ type: 'story' }],
				}),
			],
		}),
	],
});
