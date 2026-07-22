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
//  - `author` (reference único, required)  ->  `authors` (array<reference>, 0..N): una obra puede tener
//    varios autores y el array vacío modela la obra anónima. Diverge de Story a propósito (Story sigue con
//    autor único); el shape multi/opcional se propaga al futuro GROQ (`authors[]->`), dominio (`authors: Author[]`)
//    y JSON-LD (schema.org `author` admite array). Sin migración: literaryWork es greenfield.
//
// DEFAULT de anónimo en alta (aplicado en el prototipo, ver `initialValue` abajo). Al crear un literaryWork,
// `authors[0]` se pre-carga con una referencia al author de slug "anonimo" (existe en los datasets
// production/development/staging, mismo `_id` a9af4fc4-25d4-48c0-8776-5b0a14c758c5, name "Anónimo"), en vez
// de dejar el array vacío. Así el editor arranca con una atribución válida y visible ("Anónimo") y la
// reemplaza por autores reales cuando corresponde. El `_id` está hardcodeado a propósito: es idéntico en los
// tres datasets, así que no hay que resolverlo por slug en un initialValue asíncrono.
//
// TENSIÓN a resolver en Slice 1: con este default, la obra anónima se representa como `[ref(anonimo)]`, no
// como `[]`. El dominio deberá tratar ESA referencia (no solo el array vacío) como "anónima", o el modelado
// deberá decidir qué es canónico (vacío vs. ref explícita) y normalizar. Acá se prioriza la ergonomía de alta.

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
	// authors[0] = "Anónimo" por defecto al crear (ver nota "DEFAULT de anónimo en alta" arriba).
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
				'Cero o más autores. Sin autores, la obra se considera anónima. El orden expresa prioridad (autor principal primero).',
			type: 'array',
			of: [defineArrayMember({ type: 'reference', to: [{ type: 'author' }] })],
			validation: (Rule) => Rule.unique(),
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
		// Sanity dereferencia por path de campo (no evalúa `.length`): seleccionamos el 1.º y 2.º autor.
		// Array vacío (obra anónima) -> subtítulo explícito; con 2.º autor presente -> "y otros".
		select: { title: 'title', author: 'authors.0.name', secondAuthor: 'authors.1.name' },
		prepare({ title, author, secondAuthor }) {
			const subtitle = !author ? 'Anónimo' : secondAuthor ? `por ${author} y otros` : `por ${author}`;
			return { title, subtitle };
		},
	},
});
