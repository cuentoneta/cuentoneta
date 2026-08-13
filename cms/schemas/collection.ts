import { StackIcon } from '@sanity/icons/Stack';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { audioRecording, pdfLink, spaceRecording, spotifyPodcastEpisode, youtubeVideo } from './media-sources';

export default defineType({
	name: 'collection',
	title: 'Colecciones',
	type: 'document',
	icon: StackIcon,
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
			options: { source: 'title', maxLength: 96 },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Descripción',
			type: 'markdown',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'featuredImage',
			title: 'Imagen destacada',
			type: 'image',
			options: { hotspot: true },
		}),
		defineField({
			name: 'tags',
			title: 'Etiquetas',
			type: 'array',
			of: [defineArrayMember({ type: 'reference', to: [{ type: 'tag' }] })],
		}),
		defineField({
			name: 'config',
			title: 'Configuración',
			type: 'object',
			fields: [
				defineField({
					name: 'showAuthors',
					title: 'Mostrar autores',
					description: 'Mostrar los nombres de autoría en las tarjetas de la colección',
					type: 'boolean',
					initialValue: true,
				}),
			],
		}),
		defineField({
			name: 'literaryWorks',
			title: 'Obras literarias de la colección',
			type: 'array',
			of: [defineArrayMember({ type: 'reference', to: [{ type: 'literaryWork' }] })],
		}),
		defineField({
			name: 'mediaSources',
			title: 'Recursos multimedia asociados a la colección',
			description: 'Audio, video y otros contenidos multimedia relacionados con la colección',
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
	preview: { select: { title: 'title', subtitle: 'slug.current' } },
});
