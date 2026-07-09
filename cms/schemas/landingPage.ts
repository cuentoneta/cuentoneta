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
	],
});
