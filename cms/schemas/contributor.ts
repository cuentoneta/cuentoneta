import { defineField, defineType } from 'sanity';
import { UserIcon } from '@sanity/icons';

export default defineType({
	name: 'contributor',
	title: 'Colaborador',
	type: 'document',
	icon: UserIcon,
	fields: [
		defineField({
			name: 'name',
			title: 'Nombre',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'name',
				maxLength: 96,
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'area',
			title: 'Área',
			type: 'string',
			options: {
				list: [
					{ title: 'Staff', value: 'staff' },
					{ title: 'Programación', value: 'programming' },
					{ title: 'Generación de contenido', value: 'content-generation' },
					{ title: 'Selección, transcripción y curación de contenido', value: 'content-pick' },
				],
				layout: 'radio',
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'link',
			title: 'Redes sociales',
			type: 'object',
			fields: [
				{ name: 'handle', type: 'string', title: 'Handle' },
				{ name: 'url', type: 'url', title: 'URL' },
			],
			options: {
				collapsible: false,
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'notes',
			title: 'Notas',
			type: 'string',
		}),
	],
});
