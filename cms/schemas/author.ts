import { UsersIcon } from '@sanity/icons/Users';
import { resource } from './resourceType';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { validateHistoricalDate } from '../utils/validations';

const defaultAuthorImage = {
	asset: {
		_type: 'reference',
		_ref: 'image-76250a3cd5acc91a1013e2acd1f97df69b33825c-360x360-jpg',
	},
};

const reduceHistoricalYear =
	<K extends string>(fieldName: K) =>
	(result: { draft?: Record<K, string>; published: Record<K, string> }) => {
		const value = result.draft?.[fieldName] || result.published?.[fieldName];
		const match = value && /^(-?\d{4})-/.exec(value);
		return match ? parseInt(match[1], 10) : null;
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
			type: 'string',
			description:
				'Formato: YYYY-MM-DD para d.C. y -YYYY-MM-DD para a.C. (ej: -0043-03-20 = 20 de marzo de 43 a.C.). Se utiliza numeración histórica: -43 representa 43 a.C. (no se aplica el corrimiento astronómico de ISO-8601).',
			validation: (Rule) => Rule.custom(validateHistoricalDate),
		}),
		defineField({
			name: 'bornOnYear',
			title: 'Año de nacimiento',
			type: 'computedNumber',
			description:
				'Se calcula automáticamente desde la fecha completa. Ingrese manualmente si solo conoce el año (use valores negativos para a.C.).',
			validation: (Rule) => Rule.min(-3000).max(2100).integer(),
			readOnly: ({ document }) => !!document?.bornOn,
			options: {
				buttonText: 'Recalcular desde fecha',
				documentQuerySelection: `_id, _type, bornOn`,
				reduceQueryResult: reduceHistoricalYear('bornOn'),
			},
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
			type: 'computedNumber',
			description:
				'Se calcula automáticamente desde la fecha completa. Ingrese manualmente si solo conoce el año (use valores negativos para a.C.).',
			validation: (Rule) => Rule.min(-3000).max(2100).integer(),
			readOnly: ({ document }) => !!document?.diedOn,
			options: {
				buttonText: 'Recalcular desde fecha',
				documentQuerySelection: `_id, _type, diedOn`,
				reduceQueryResult: reduceHistoricalYear('diedOn'),
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
