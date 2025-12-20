import { DocumentTextIcon } from '@sanity/icons';
import { resource } from './resourceType';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { audioRecording, spaceRecording, spotifyPodcastEpisode, youtubeVideo } from './media-sources';

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
			of: [
				defineArrayMember(audioRecording),
				defineArrayMember(spaceRecording),
				defineArrayMember(youtubeVideo),
				defineArrayMember(spotifyPodcastEpisode),
			],
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
