import { BookIcon } from '@sanity/icons/Book';
import { resource } from './resourceType';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { audioRecording, pdfLink, spaceRecording, spotifyPodcastEpisode, youtubeVideo } from './media-sources';

// PROTOTIPO DESCARTABLE (spike #1481, slice 0). No es producción.
// Objetivo: sentir la ergonomía real del array de secciones + `markdown` en el Studio
// y observar el shape que produce typegen. Modelado a partir de `story`, pero Markdown-native.
//
// Diferencias de diseño respecto de `story` que este prototipo valida:
//  - `body: blockContent`  ->  `content: array<section>` con cuerpo `markdown` por sección.
//  - epígrafes: array por seccion (analogo a Story.epigraphs), texto Markdown-native (sin acoplar el lenguaje viejo).
//  - SIN `approximateReadingTime` (computedNumber): el reading time se materializa fuera del CMS,
//    vía webhook -> función -> documento derivado (decisión T1b). El source doc no lo persiste.

const section = defineArrayMember({
	name: 'section',
	title: 'Sección / Capítulo',
	type: 'object',
	fields: [
		defineField({
			name: 'chapterTitle',
			title: 'Título del capítulo',
			description: 'Opcional. Una obra de una sola sección puede no llevar título de capítulo.',
			type: 'string',
		}),
		defineField({
			name: 'epigraphs',
			title: 'Epígrafes de la sección',
			description: 'Una sección puede tener más de un epígrafe (análogo a los epígrafes de una Story).',
			type: 'array',
			of: [
				defineArrayMember({
					name: 'epigraph',
					title: 'Epígrafe',
					type: 'object',
					fields: [
						defineField({ name: 'text', title: 'Texto', type: 'markdown' }),
						defineField({ name: 'reference', title: 'Referencia', type: 'string' }),
					],
				}),
			],
		}),
		defineField({
			name: 'body',
			title: 'Cuerpo (Markdown)',
			type: 'markdown',
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: { title: 'chapterTitle' },
		prepare({ title }) {
			return { title: title || 'Sección sin título' };
		},
	},
});

export default defineType({
	name: 'literaryWork',
	title: 'Obra literaria',
	type: 'document',
	icon: BookIcon,
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
			name: 'author',
			title: 'Autor/a',
			type: 'reference',
			to: { type: 'author' },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'coverImage',
			title: 'Imagen de portada',
			type: 'image',
			options: { hotspot: true },
		}),
		defineField({
			name: 'content',
			title: 'Contenido (secciones / capítulos)',
			description:
				'Array de secciones. Con un único elemento, equivale a la lectura de una Story. La navegación multi-sección se difiere a issue futuro.',
			type: 'array',
			of: [section],
			validation: (Rule) => Rule.required().min(1),
		}),
		defineField({
			name: 'mediaSources',
			title: 'Recursos multimedia asociados en otras plataformas',
			type: 'array',
			of: [
				defineArrayMember(audioRecording),
				defineArrayMember(spaceRecording),
				defineArrayMember(youtubeVideo),
				defineArrayMember(spotifyPodcastEpisode),
				defineArrayMember(pdfLink),
			],
		}),
		defineField({
			name: 'resources',
			title: 'Recursos web asociados',
			type: 'array',
			of: [defineArrayMember(resource)],
		}),
		defineField({
			name: 'badLanguage',
			title: '¿Contiene lenguaje adulto?',
			type: 'boolean',
			initialValue: false,
		}),
		defineField({
			name: 'tags',
			title: 'Etiquetas',
			type: 'array',
			of: [defineArrayMember({ type: 'reference', to: [{ type: 'tag' }] })],
		}),
		defineField({
			name: 'originalPublication',
			title: 'Publicación original',
			type: 'string',
		}),
		defineField({
			name: 'publishedAt',
			title: 'Fecha de publicación en La Cuentoneta',
			type: 'datetime',
		}),
	],
	preview: {
		select: { title: 'title', author: 'author.name' },
		prepare({ title, author }) {
			return { title, subtitle: author ? `por ${author}` : '' };
		},
	},
});
