// Localization
import { supportedLanguages } from '../utils/localization';
import { UsersIcon } from '@sanity/icons';
import { resource } from './resourceType';

export default {
	name: 'author',
	title: 'Autor/a',
	type: 'document',
	icon: UsersIcon,
	fields: [
		{
			name: 'name',
			title: 'Nombre',
			type: 'string',
		},
		{
			name: 'slug',
			title: 'Slug',
			type: 'slug',
			options: {
				source: 'name',
				maxLength: 96,
			},
			validation: (Rule) => Rule.required(),
		},
		{
			name: 'image',
			title: 'Foto',
			type: 'image',
			initialValue: {
				asset: {
				  _type: 'reference',
				  _ref: 'image-76250a3cd5acc91a1013e2acd1f97df69b33825c-360x360-jpg'
				}
			  },
			options: {
				hotspot: true,
			},
		},
		{
			name: 'nationality',
			title: 'Nacionalidad',
			type: 'reference',
			to: { type: 'nationality' },
		},
		{
			name: 'biography',
			title: 'Biografía',
			type: 'object',
			fieldsets: [
				{
					title: 'Traducciones',
					name: 'translations',
					options: { collapsible: true },
				},
			],
			// Dynamically define one field per language
			fields: supportedLanguages.map((lang) => ({
				title: lang.title,
				name: lang.id,
				type: 'blockContent',
				fieldset: lang.isDefault ? null : 'translations',
			})),
		},
		{
			name: 'resources',
			title: 'Recursos asociados al perfil del autor',
			type: 'array',
			of: [resource],
		},
	],
	preview: {
		select: {
			title: 'name',
			media: 'image',
		},
	},
};
