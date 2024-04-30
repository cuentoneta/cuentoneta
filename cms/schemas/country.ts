import { EarthGlobeIcon } from '@sanity/icons';

export default {
	name: 'nationality',
	title: 'Nacionalidad',
	type: 'document',
	icon: EarthGlobeIcon,
	fields: [
		{
			name: 'country',
			title: 'País',
			type: 'string',
		},
		{
			name: 'flag',
			title: 'Bandera',
			type: 'image',
		},
	],
};
