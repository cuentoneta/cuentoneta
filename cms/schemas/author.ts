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
			name: 'image',
			title: 'Foto',
			type: 'image',
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
