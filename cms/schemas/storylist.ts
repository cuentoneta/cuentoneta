import { DashboardIcon, DocumentTextIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { audioRecording, pdfLink, spaceRecording, spotifyPodcastEpisode, youtubeVideo } from './media-sources';

// Sub-schema para definir tabs programables
// TODO: Evaluar su uso para futuros features donde se requiera contenido programable desde Sanity
const storylistTab = defineType({
	name: 'storylistTab',
	title: 'Pestaña de Storylist',
	type: 'object',
	icon: DocumentTextIcon,
	fields: [
		defineField({
			name: 'title',
			title: 'Título de la pestaña',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'slug',
			title: 'Slug de la pestaña',
			type: 'slug',
			options: {
				source: 'title',
				maxLength: 96,
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'content',
			title: 'Contenido de la pestaña',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'icon',
			title: 'Ícono (opcional)',
			description: 'Nombre del ícono de FontAwesome (ej: "users", "book", "info-circle")',
			type: 'string',
		}),
	],
	preview: {
		select: {
			title: 'title',
			subtitle: 'slug.current',
		},
	},
});

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
		defineField({
			name: 'tabs',
			title: 'Pestañas programables',
			description: 'Pestañas adicionales con contenido personalizado (ej: "Sobre los autores")',
			type: 'array',
			of: [defineArrayMember(storylistTab)],
		}),
		defineField({
			name: 'mediaSources',
			title: 'Recursos multimedia asociados a la storylist',
			description: 'Audio, video, y otros contenidos multimedia relacionados con la colección',
			type: 'array',
			of: [
				defineArrayMember(audioRecording),
				defineArrayMember(spaceRecording),
				defineArrayMember(youtubeVideo),
				defineArrayMember(spotifyPodcastEpisode),
				defineArrayMember(pdfLink),
			],
		}),
	],
});
