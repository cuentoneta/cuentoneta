import { supportedLanguages } from '../utils/localization';
import { DashboardIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';
import publication from './publication';

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
			name: 'language',
			title: 'Idioma',
			type: 'string',
			options: {
				list: supportedLanguages.map((lang) => ({
					title: lang.title,
					value: lang.id,
				})),
				layout: 'radio',
			},
			initialValue: 'es',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'displayDates',
			title: 'Mostrar fechas',
			type: 'boolean',
			initialValue: false,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'comingNextLabel',
			title: 'Etiqueta de "Próximo"',
			description:
				'Etiqueta que se mostrará en una publicación programada dentro de una storylist pero que aún no ha sido publicada.',
			type: 'string',
			initialValue: 'Próximamente',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'editionPrefix',
			title: 'Prefijo de edición',
			description:
				'Prefijo usado para identificar qué representa cada historia en una Storylist (día, edición, historia, etc.)',
			type: 'string',
			initialValue: 'Edición',
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
			name: 'publications',
			title: 'Publicaciones de Cuento/Texto/Historia dentro de la storylist',
			type: 'array',
			of: [defineArrayMember(publication)],
		}),
	],
});
