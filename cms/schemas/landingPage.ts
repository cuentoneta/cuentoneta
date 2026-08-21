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
			name: 'cards',
			title: 'Storylists con Tarjetas (en baja)',
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
			title: 'Últimas novedades (en baja)',
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
		// Los campos nuevos conviven con los de arriba en vez de reemplazarlos: el Studio y la aplicación no
		// despliegan a la vez, así que reusar el nombre dejaría una ventana en la que un lado lee lo que el
		// otro todavía no escribe. Sin `required`: durante la convivencia un documento puede tener poblado
		// un par u otro, y exigirlos rompería la edición de los documentos que todavía no migraron.
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
	],
});
