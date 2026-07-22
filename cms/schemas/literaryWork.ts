import { BookIcon } from '@sanity/icons/Book';
import { resource } from './resourceType';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { audioRecording, pdfLink, spaceRecording, spotifyPodcastEpisode, youtubeVideo } from './media-sources';

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
						defineField({ name: 'reference', title: 'Referencia', type: 'markdown' }),
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
	// authors[0] = "Anónimo" al crear: el editor arranca con la representación real de la obra
	// anónima (la referencia explícita al author "anonimo" — ver docs/LITERARY_WORK_DESIGN.md §10)
	// y la reemplaza cuando la obra tiene autoría real. El _id va fijo porque es idéntico en
	// production/staging/development y evita resolver por slug en un initialValue asíncrono.
	initialValue: {
		authors: [{ _type: 'reference', _ref: 'a9af4fc4-25d4-48c0-8776-5b0a14c758c5', _key: 'anonimo' }],
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
			options: { source: 'title', maxLength: 96 },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'authors',
			title: 'Autores/as',
			description:
				'Al menos un autor. La obra anónima referencia al autor "Anónimo" (precargado al crear). El orden expresa prioridad (autor principal primero).',
			type: 'array',
			of: [defineArrayMember({ type: 'reference', to: [{ type: 'author' }] })],
			validation: (Rule) => Rule.required().min(1).unique(),
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
			description: 'Array de secciones. Con un único elemento, equivale a la lectura de una Story.',
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
		// Sanity dereferencia por path de campo (no evalúa `.length`): se seleccionan el 1.º y 2.º autor.
		select: { title: 'title', author: 'authors.0.name', secondAuthor: 'authors.1.name' },
		prepare({ title, author, secondAuthor }) {
			const subtitle = !author ? 'Anónimo' : secondAuthor ? `por ${author} y otros` : `por ${author}`;
			return { title, subtitle };
		},
	},
});
