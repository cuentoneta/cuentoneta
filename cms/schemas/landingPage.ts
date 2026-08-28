import { CodeBlockIcon } from '@sanity/icons/CodeBlock';
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
		},
		prepare(selection) {
			const { config } = selection;
			return {
				title: `${config}`,
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
			name: 'collections',
			title: 'Colecciones con Tarjetas',
			type: 'array',
			of: [
				defineArrayMember({
					name: 'collection',
					title: 'Colección',
					type: 'reference',
					to: [{ type: 'collection' }],
				}),
			],
		}),
		defineField({
			name: 'latestLiteraryWorks',
			title: 'Últimas novedades (obras)',
			type: 'array',
			of: [
				defineArrayMember({
					name: 'literaryWork',
					title: 'Obra literaria',
					type: 'reference',
					to: [{ type: 'literaryWork' }],
				}),
			],
		}),
		defineField({
			name: 'highlightedAuthors',
			title: 'Autores destacados',
			type: 'array',
			validation: (Rule) => Rule.max(6),
			of: [
				defineArrayMember({
					name: 'highlightedAuthor',
					title: 'Autor destacado',
					type: 'reference',
					to: [{ type: 'author' }],
				}),
			],
		}),
	],
});
