import { TagIcon } from '@sanity/icons';
import { preview } from 'sanity-plugin-icon-picker';
import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'tag',
	title: 'Etiquetas',
	type: 'document',
	icon: TagIcon,
	preview: {
		select: {
			title: 'title',
			description: 'description',
			icon: 'icon',
		},
		prepare(selection) {
			return {
				title: selection.title,
				subtitle: selection.description,
				media: preview(selection.icon),
			};
		},
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
			options: {
				source: 'title',
				maxLength: 96,
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Descripción',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'icon',
			title: 'Icono',
			type: 'iconPicker',
			options: {
				storeSvg: true,
			},
			validation: (Rule) => Rule.required(),
		}),
	],
});
