import { CodeBlockIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
	name: 'landingPage',
	title: 'Página de Inicio',
	type: 'document',
	icon: CodeBlockIcon,
	orderings: [
		{
			title: 'Semana (más reciente primero)',
			name: 'configDesc',
			by: [{ field: 'config', direction: 'desc' }],
		},
	],
	preview: {
		select: {
			config: 'config',
			active: 'active',
		},
		prepare(selection) {
			const { config, active } = selection;
			return {
				title: `${config}`,
				subtitle: active ? 'Activa' : 'Inactiva',
			};
		},
	},
	fields: [
		defineField({
			name: 'config',
			title: 'Configuración',
			type: 'string',
			description:
				'Formato YYYY-WW, numeración de semana ISO-8601 (lunes = día 1). Ver docs/CONTENT_UPDATE_STRATEGIES.md.',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'config',
				maxLength: 96,
			},
			validation: (Rule) => Rule.required(),
		}),

		defineField({
			name: 'campaigns',
			title: 'Campañas',
			type: 'array',
			of: [
				defineArrayMember({
					name: 'campaign',
					title: 'Campaña',
					type: 'reference',
					to: [{ type: 'contentCampaign' }],
				}),
			],
		}),
		defineField({
			name: 'cards',
			title: 'Storylists con Tarjetas',
			type: 'array',
			of: [
				defineArrayMember({
					name: 'storylist',
					title: 'Storylist',
					type: 'reference',
					to: [{ type: 'storylist' }],
				}),
			],
		}),
		defineField({
			name: 'latestReads',
			title: 'Últimas novedades',
			type: 'array',
			of: [
				defineArrayMember({
					name: 'story',
					title: 'Historia',
					type: 'reference',
					to: [{ type: 'story' }],
				}),
			],
		}),
		defineField({
			name: 'highlightedAuthors',
			title: 'Autores/as destacados/as',
			description:
				'Hasta 6 autores destacados de la semana. Las etiquetas adicionales se suman a las del autor y se muestran primero.',
			type: 'array',
			validation: (Rule) => Rule.max(6),
			of: [
				defineArrayMember({
					name: 'highlightedAuthor',
					title: 'Autor/a destacado/a',
					type: 'object',
					preview: {
						select: {
							title: 'author.name',
							media: 'author.image',
						},
						prepare({ title, media }) {
							return {
								title: title ?? 'Sin autor',
								media,
							};
						},
					},
					fields: [
						defineField({
							name: 'author',
							title: 'Autor/a',
							type: 'reference',
							to: [{ type: 'author' }],
							validation: (Rule) => Rule.required(),
						}),
						defineField({
							name: 'additionalTags',
							title: 'Etiquetas adicionales',
							description: 'Etiquetas puntuales de la semana (p. ej. Cumpleaños). Se muestran antes que las del autor.',
							type: 'array',
							of: [
								defineArrayMember({
									type: 'reference',
									to: [{ type: 'tag' }],
								}),
							],
						}),
					],
				}),
			],
		}),
	],
});
