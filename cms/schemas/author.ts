import { UsersIcon } from '@sanity/icons/Users';
import { resource } from './resourceType';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { HISTORICAL_YEAR_RANGE } from '@utils/historical-date.utils';
import { validateHistoricalDate, validateSlugFormat } from '../utils/validations';

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
			validation: (Rule) => Rule.required().custom(validateSlugFormat),
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
			type: 'string',
			description:
				'Formato: YYYY-MM-DD para d.C. y -YYYY-MM-DD para a.C. (ej: -0043-03-20 = 20 de marzo de 43 a.C.). Se utiliza numeración histórica: -43 representa 43 a.C. (no se aplica el corrimiento astronómico de ISO-8601).',
			validation: (Rule) => Rule.custom(validateHistoricalDate),
		}),
		defineField({
			name: 'bornOnYear',
			title: 'Año de nacimiento',
			type: 'number',
			description:
				'Cargar solo si se conoce únicamente el año (valores negativos para a.C.). Si se completa la fecha, este campo se oculta y el año se deriva de ella.',
			validation: (Rule) => Rule.min(HISTORICAL_YEAR_RANGE.min).max(HISTORICAL_YEAR_RANGE.max).integer(),
			hidden: ({ document }) => !!document?.bornOn,
		}),
		defineField({
			name: 'diedOn',
			title: 'Fecha de fallecimiento',
			type: 'string',
			description:
				'Formato: YYYY-MM-DD para d.C. y -YYYY-MM-DD para a.C. (ej: -0043-03-20 = 20 de marzo de 43 a.C.). Se utiliza numeración histórica: -43 representa 43 a.C. (no se aplica el corrimiento astronómico de ISO-8601).',
			validation: (Rule) => Rule.custom(validateHistoricalDate),
		}),
		defineField({
			name: 'diedOnYear',
			title: 'Año de fallecimiento',
			type: 'number',
			description:
				'Cargar solo si se conoce únicamente el año (valores negativos para a.C.). Si se completa la fecha, este campo se oculta y el año se deriva de ella.',
			validation: (Rule) => Rule.min(HISTORICAL_YEAR_RANGE.min).max(HISTORICAL_YEAR_RANGE.max).integer(),
			hidden: ({ document }) => !!document?.diedOn,
		}),
		defineField({
			name: 'biography',
			title: 'Biografía',
			type: 'markdown',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'resources',
			title: 'Recursos asociados al perfil del autor',
			type: 'array',
			of: [defineArrayMember(resource)],
		}),
		defineField({
			name: 'tags',
			title: 'Etiquetas',
			description: 'Etiquetas asignadas al autor.',
			type: 'array',
			of: [
				defineArrayMember({
					type: 'reference',
					to: [{ type: 'tag' }],
				}),
			],
		}),
	],
	preview: {
		select: {
			title: 'name',
			media: 'image',
		},
	},
});
