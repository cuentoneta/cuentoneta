import { TagIcon } from '@sanity/icons/Tag';
import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'tag',
	title: 'Etiquetas',
	type: 'document',
	icon: TagIcon,
	preview: {
		select: {
			title: 'title',
			subtitle: 'shortDescription',
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
	],
});
