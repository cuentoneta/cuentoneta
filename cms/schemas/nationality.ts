import { EarthGlobeIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
	name: 'nationality',
	title: 'Nacionalidad',
	type: 'document',
	icon: EarthGlobeIcon,
	fields: [
		defineField({ name: 'country', title: 'País', type: 'string' }),
		defineField({
			name: 'flag',
			title: 'Bandera',
			type: 'image',
		}),
	],
});
