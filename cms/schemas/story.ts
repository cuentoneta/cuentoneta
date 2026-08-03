import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { resource } from './resourceType';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { audioRecording, pdfLink, spaceRecording, spotifyPodcastEpisode, youtubeVideo } from './media-sources';
import { type PreviewTextBlock, toPlainText } from '../utils/preview-text';

// Placeholder por defecto del dataset `production`; las historias nuevas y las existentes (vía migración) lo usan
// hasta que el equipo editorial cargue una imagen propia.
const defaultStoryCoverImage = {
	_type: 'image',
	asset: {
		_type: 'reference',
		_ref: 'image-852a122db56840452a0b7e2e58d73741de44bb01-229x320-svg',
	},
};

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
			name: 'coverImage',
			title: 'Imagen de portada',
			type: 'image',
			options: { hotspot: true },
			initialValue: defaultStoryCoverImage,
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
				defineArrayMember(pdfLink),
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
					draft?: { blockContentParagraphs: { body: PreviewTextBlock[] } };
					published: { blockContentParagraphs: { body: PreviewTextBlock[] } };
				}) => {
					const textBody = result.draft
						? result.draft.blockContentParagraphs.body
						: result.published.blockContentParagraphs.body;

					// Un párrafo con negritas o enlaces se parte en varios spans: contarlos todos, no solo el
					// primero, que era lo que hacía antes y subestimaba el tiempo de lectura.
					const plainTextParagraphs = textBody.map((paragraph) => toPlainText([paragraph]));
					const wordCount = plainTextParagraphs
						.map((paragraph) => paragraph.split(' ').length)
						.reduce((previous, current) => previous + current, 0);

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
						prepare({ text, reference }: { text?: PreviewTextBlock[]; reference?: PreviewTextBlock[] }) {
							return {
								title: toPlainText(text),
								subtitle: toPlainText(reference),
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
			name: 'tags',
			title: 'Etiquetas',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'reference',
					to: [{ type: 'tag' }],
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
		defineField({
			name: 'publishedAt',
			title: 'Fecha de publicación en La Cuentoneta',
			description:
				'Fecha y hora en que el cuento se publicó en la plataforma. Alimenta datePublished en los datos estructurados (SEO/AEO). Si se deja vacía, se usa la fecha de creación del documento (_createdAt). Se usa datetime para mantener el mismo formato ISO que el fallback.',
			type: 'datetime',
		}),
	],
	preview: {
		select: {
			title: 'title',
			author: 'author.name',
			media: 'coverImage',
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
