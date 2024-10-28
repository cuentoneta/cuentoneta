import { CodeBlockIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
	name: 'landingPage',
	title: 'Página de Inicio',
	type: 'document',
	icon: CodeBlockIcon,
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
			name: 'active',
			title: 'Activa',
			type: 'boolean',
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
	],
});
