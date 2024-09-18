import { supportedLanguages } from '../utils/localization';
import { DocumentTextIcon, DocumentVideoIcon, PlayIcon, TwitterIcon } from '@sanity/icons';
import { resource } from './resourceType';
import { defineArrayMember, defineField, defineType } from 'sanity';

const audioRecording = defineType({
	name: 'audioRecording',
	title: 'Grabación de audio con el relato del texto',
	type: 'object',
	icon: PlayIcon,
	preview: {
		select: {
			title: 'title',
			url: 'url',
		},
		prepare(selection) {
			const { title, url } = selection;
			return {
				title: `${title}`,
				subtitle: ` URL Grabación: ${url}`,
			};
		},
	},
	fields: [
		defineField({
			name: 'title',
			title: 'Título asignado a la grabación de audio',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Descripción de la grabación de audio',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'url',
			title: 'URL del archivo de audio (mp3, wav, etc.)',
			type: 'url',
			validation: (Rule) => Rule.required(),
		}),
	],
});

const spaceRecording = defineType({
	name: 'spaceRecording',
	title: 'Grabación de Spaces de X',
	type: 'object',
	icon: TwitterIcon,
	preview: {
		select: {
			title: 'title',
			spaceUrl: 'spaceUrl',
		},
		prepare(selection) {
			const { title, spaceUrl } = selection;
			return {
				title: `${title} | ID Tweet: ${'abc'} | URL Grabación: ${spaceUrl}`,
				subtitle: `${spaceUrl}`,
			};
		},
	},
	fields: [
		defineField({
			name: 'postId',
			title: 'ID de post de X',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'title',
			title: 'Título del space',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Descripción del space',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'spaceUrl',
			title: 'URL de la grabación del space',
			type: 'url',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'duration',
			title: 'Duración del space',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
	],
});

const youtubeVideo = defineType({
	name: 'youTubeVideo',
	title: 'Video de YouTube',
	type: 'object',
	icon: DocumentVideoIcon,
	preview: {
		select: {
			title: 'title',
			url: 'url',
		},
		prepare(selection) {
			const { title, url } = selection;
			return {
				title: `${title}`,
				subtitle: `URL Video: ${url}`,
			};
		},
	},
	fields: [
		{
			name: 'title',
			title: 'Título del video',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'description',
			title: 'Descripción del video',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'videoId',
			title: 'ID del video de YouTube',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
	],
});

export default defineType({
	name: 'story',
	title: 'Cuento',
	type: 'document',
	icon: DocumentTextIcon,
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
			name: 'author',
			title: 'Autor/a',
			type: 'reference',
			to: { type: 'author' },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'mediaSources',
			title: 'Información de recursos multimedia asociados a la historia en otras plataformas web',
			type: 'array',
			of: [defineArrayMember(audioRecording), defineArrayMember(spaceRecording), defineArrayMember(youtubeVideo)],
		}),
		defineField({
			name: 'resources',
			title: 'Recursos web asociados a la story y su contenido',
			type: 'array',
			of: [defineArrayMember(resource)],
		}),
		defineField({
			name: 'badLanguage',
			title: '¿Contiene lenguaje adulto?',
			type: 'boolean',
			initialValue: false,
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'approximateReadingTime',
			title: 'Tiempo de lectura aproximado',
			type: 'computedNumber',
			readOnly: true,
			validation: (Rule) => Rule.required(),
			options: {
				buttonText: 'Recalcular',
				documentQuerySelection: `
                    "blockContentParagraphs": *[_type == 'story' && _id == ^._id][0]{ body }
                `,
				reduceQueryResult: (result: {
					draft?: { blockContentParagraphs: { body } };
					published: { blockContentParagraphs: { body } };
				}) => {
					const textBody = result.draft
						? result.draft.blockContentParagraphs.body
						: result.published.blockContentParagraphs.body;

					const plainTextParagraphs = textBody.map((x) => x.children[0].text);
					const wordCount = plainTextParagraphs
						.map((paragraph) => paragraph.split(' ').length)
						.reduce((previous, current) => previous + current);

					return Math.ceil(wordCount / 200);
				},
			},
		}),
		defineField({
			name: 'epigraphs',
			title: 'Epígrafes',
			type: 'array',
			of: [
				defineArrayMember({
					name: 'epigraph',
					title: 'Epígrafe',
					type: 'object',
					preview: {
						select: {
							text: 'text',
							reference: 'reference',
						},
						prepare({ text, reference }) {
							const title =
								text?.length > 0
									? text
											.map((span) => span.children)
											.map((child) => child[0].text)
											.join('')
									: '';

							const subtitle =
								reference?.length > 0
									? reference
											.map((span) => span.children)
											.map((child) => child[0].text)
											.join('')
									: '';

							return {
								title: title ?? '',
								subtitle: subtitle ?? '',
							};
						},
					},
					fields: [
						{
							name: 'text',
							title: 'Texto del epígrafe',
							type: 'blockContent',
							validation: (Rule) => Rule.required(),
						},
						{
							name: 'reference',
							title: 'Referencia del epígrafe',
							description: 'Referencia del origen del epígrafe',
							type: 'blockContent',
						},
					],
				}),
			],
		}),
		defineField({
			name: 'body',
			title: 'Cuerpo del cuento',
			type: 'blockContent',
		}),
		defineField({
			name: 'review',
			title: 'Reseña',
			type: 'blockContent',
		}),
		defineField({
			name: 'originalPublication',
			title: 'Publicación original',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
	],
	preview: {
		select: {
			title: 'title',
			author: 'author.name',
			media: 'mainImage',
		},
		prepare(selection) {
			const { title, author } = selection;
			return {
				title: `${title}`,
				subtitle: `por ${author}`,
			};
		},
	},
});
