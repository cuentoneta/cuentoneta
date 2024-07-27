import { supportedLanguages } from '../utils/localization';
import { DashboardIcon } from '@sanity/icons';
import { defineType } from 'sanity';

const gridItemFields = [
	{
		name: 'order',
		title: 'Orden',
		description: 'Orden utilizado internamente por CSS Grid para renderizar el elemento',
		type: 'number',
		validation: (Rule) => Rule.required(),
	},
	{
		name: 'startCol',
		title: 'Columna inicial en CSS Grid',
		type: 'string',
	},
	{
		name: 'endCol',
		title: 'Columna final en CSS Grid',
		type: 'string',
	},
	{
		name: 'startRow',
		title: 'Fila inicial en CSS Grid',
		type: 'string',
	},
	{
		name: 'endRow',
		title: 'Fila final en CSS Grid',
		type: 'string',
	},
];

const gridConfigfields = [
	{
		name: 'gridTemplateColumns',
		title: 'Template de columnas en CSS Grid (grid-template-columns)',
		type: 'string',
		description: 'Ejemplo: "repeat(3, 1fr)", "repeat(12, 1fr), etc.',
		initialValue: 'repeat(3, 1fr)',
	},
	{
		name: 'titlePlacement',
		title: 'Posición del título',
		type: 'object',
		fields: [...gridItemFields],
	},
	{
		name: 'cardsPlacement',
		description:
			'Posiciones de las tarjetas y las imágenes alusivas de la storylist, con su orden de renderizado y extensión en columnas y filas dentro del layout de CSS Grid',
		type: 'array',
		of: [
			{
				name: 'deckPreviewConfigItem',
				title: 'Configuración de preview de Storylist',
				type: 'object',
				preview: {
					select: {
						order: 'order',
						publicationOrder: 'publication.publishingOrder',
						storyTitle: 'publication.story.title',
						image: 'image',
						imageSlug: 'imageSlug.current',
						startCol: 'startCol',
						endCol: 'endCol',
					},
					prepare(selection) {
						const { order, publicationOrder, storyTitle, image, imageSlug, startCol, endCol } = selection;

						// Preview para stories en grid
						const title = `${image ? imageSlug : storyTitle}`;

						// Preview para imágenes en grid
						return {
							title: `${order} | ${title} | ${endCol}`,
							subtitle: `Orden en lista: ${publicationOrder}`,
							media: image ?? undefined,
						};
					},
				},
				fields: [
					{
						name: 'publication',
						title: 'Publicación de Cuento/Texto/Historia dentro de la storylist',
						type: 'object',
						fields: [
							{
								name: 'story',
								title: 'Referencia a historia',
								type: 'reference',
								to: [{ type: 'story' }],
								options: {
									filter: ({ document }) => {
										return {
											params: {
												_id: document._id.startsWith('drafts.') ? document._id.split('drafts.')[1] : document._id,
											},
										};
									},
									disableNew: true,
								},
							},
							{
								name: 'published',
								title: '¿Publicado?',
								description:
									'Determina si la publicación fue o no liberada. Si el valor es false, la publicación no se mostrará como parte de la Storylist',
								type: 'boolean',
								validation: (Rule) => Rule.required(),
								initialValue: false,
							},
							{
								name: 'publishingOrder',
								title: 'Orden de publicación',
								description: 'Número ordinal de publicación dentro de la storylist para el cuento',
								type: 'number',
							},
							{
								name: 'publishingDate',
								title: 'Fecha de publicación',
								description: 'Fecha en la cual el cuento se publicó o publicará en la storylist',
								type: 'date',
							},
						],
					},
					{
						name: 'image',
						title: 'Imagen de grid',
						type: 'image',
						options: {
							hotspot: true,
						},
					},
					{
						name: 'imageSlug',
						title: 'Slug de imagen alusiva',
						type: 'slug',
						options: {
							source: 'title',
							maxLength: 96,
						},
					},
					...gridItemFields,
				],
				initialValue: {
					startCol: 'auto',
					endCol: 'span 4',
				},
			},
		],
	},
];

export default defineType({
	name: 'storylist',
	title: 'Storylists',
	type: 'document',
	icon: DashboardIcon,
	fields: [
		{
			name: 'title',
			title: 'Título',
			type: 'string',
		},
		{
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'title',
				maxLength: 96,
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'description',
			title: 'Descripción',
			type: 'text',
		},
		{
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
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'displayDates',
			title: 'Mostrar fechas',
			type: 'boolean',
			initialValue: false,
		},
		{
			name: 'comingNextLabel',
			title: 'Etiqueta de "Próximo"',
			description:
				'Etiqueta que se mostrará en una publicación programada dentro de una storylist pero que aún no ha sido publicada.',
			type: 'string',
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'editionPrefix',
			title: 'Prefijo de edición',
			description:
				'Prefijo usado para identificar qué representa cada historia en una Storylist (día, edición, historia, etc.)',
			type: 'string',
			initialValue: 'Edición',
		},
		{
			name: 'featuredImage',
			title: 'Imagen destacada',
			type: 'image',
			options: {
				hotspot: true,
			},
		},
		{
			name: 'tags',
			title: 'Etiquetas',
			type: 'array',
			of: [
				{
					name: 'tag',
					title: 'Etiqueta',
					type: 'reference',
					to: [{ type: 'tag' }],
				},
			],
		},
		{
			name: 'gridConfig',
			title: 'Configuración de vista completa de Storylist en layout de CSS Grid',
			type: 'object',
			fields: [...gridConfigfields],
		},
		{
			name: 'previewGridConfig',
			title: 'Configuración de vista previa de Storylist en layout de CSS Grid',
			type: 'object',
			fields: [
				...gridConfigfields,
				{
					name: 'ordering',
					title: 'Orden de publicaciones',
					description: 'Orden de publicaciones en vista previa de Storylist',
					type: 'string',
					options: {
						list: [
							{ title: 'Ascendente', value: 'asc' },
							{ title: 'Descendente', value: 'desc' },
						],
					},
				},
			],
		},
	],
	initialValue: {
		comingNextLabel: 'Próximamente',
		language: 'Español',
	},
});
