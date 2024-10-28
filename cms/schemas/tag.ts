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
			shortDescription: 'shortDescription',
			icon: 'icon',
		},
		prepare({ title, shortDescription, icon }) {
			return {
				title: title,
				subtitle: shortDescription,
				media: preview(icon),
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
			name: 'shortDescription',
			title: 'Descripción breve',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'description',
			title: 'Descripción',
			type: 'blockContent',
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
