// Localization
import { supportedLanguages } from '../utils/localization';
import { UsersIcon } from '@sanity/icons';
import { resource } from './resourceType';
import { defineArrayMember, defineField, defineType } from 'sanity';

const defaultAuthorImage = {
	asset: {
		_type: 'reference',
		_ref: 'image-76250a3cd5acc91a1013e2acd1f97df69b33825c-360x360-jpg',
	},
};

export default defineType({
	name: 'author',
	title: 'Autor/a',
	type: 'document',
	icon: UsersIcon,
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
			name: 'image',
			title: 'Foto',
			type: 'image',
			initialValue: defaultAuthorImage,
			options: {
				hotspot: true,
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'nationality',
			title: 'Nacionalidad',
			type: 'reference',
			to: { type: 'nationality' },
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'biography',
			title: 'Biografía',
			type: 'object',
			validation: (Rule) => Rule.required(),
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
		}),
		defineField({
			name: 'resources',
			title: 'Recursos asociados al perfil del autor',
			type: 'array',
			of: [defineArrayMember(resource)],
		}),
	],
	preview: {
		select: {
			title: 'name',
			media: 'image',
		},
	},
});
