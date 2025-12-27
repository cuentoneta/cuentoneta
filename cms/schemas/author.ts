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
			name: 'bornOn',
			title: 'Fecha de nacimiento',
			type: 'date',
			options: {
				dateFormat: 'YYYY-MM-DD',
			},
		}),
		defineField({
			name: 'bornOnYear',
			title: 'Año de nacimiento',
			type: 'computedNumber',
			description: 'Se calcula automáticamente desde la fecha completa. Ingrese manualmente si solo conoce el año.',
			validation: (Rule) => Rule.min(500).max(2100).integer(),
			readOnly: ({ document }) => !!document?.bornOn,
			options: {
				buttonText: 'Recalcular desde fecha',
				documentQuerySelection: `_id, _type, bornOn`,
				reduceQueryResult: (result: { draft?: { bornOn: string }; published: { bornOn: string } }) => {
					const bornOn = result.draft?.bornOn || result.published?.bornOn;
					if (bornOn) {
						return parseInt(bornOn.split('-')[0]);
					}
					return null;
				},
			},
		}),
		defineField({
			name: 'diedOn',
			title: 'Fecha de fallecimiento',
			type: 'date',
			options: {
				dateFormat: 'YYYY-MM-DD',
			},
		}),
		defineField({
			name: 'diedOnYear',
			title: 'Año de fallecimiento',
			type: 'computedNumber',
			description: 'Se calcula automáticamente desde la fecha completa. Ingrese manualmente si solo conoce el año.',
			validation: (Rule) => Rule.min(500).max(2100).integer(),
			readOnly: ({ document }) => !!document?.diedOn,
			options: {
				buttonText: 'Recalcular desde fecha',
				documentQuerySelection: `_id, _type, diedOn`,
				reduceQueryResult: (result: { draft?: { diedOn: string }; published: { diedOn: string } }) => {
					const diedOn = result.draft?.diedOn || result.published?.diedOn;
					if (diedOn) {
						return parseInt(diedOn.split('-')[0]);
					}
					return null;
				},
			},
		}),
		defineField({
			name: 'biography',
			title: 'Biografía',
			type: 'blockContent',
			validation: (Rule) => Rule.required(),
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
