import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe';
import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'nationality',
	title: 'Nacionalidad',
	type: 'document',
	icon: EarthGlobeIcon,
	fields: [
		defineField({
			name: 'country',
			title: 'País',
			type: 'string',
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: 'flag',
			title: 'Bandera',
			type: 'image',
			validation: (Rule) => Rule.required(),
		}),
	],
});
